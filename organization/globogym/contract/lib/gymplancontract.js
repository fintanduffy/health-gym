/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// PlanNet specifc classes
const GymPlan = require('./gymplan.js');
const GymPlanList = require('./gymplanlist.js');
const QueryUtils = require('./queries.js');

/**
 * A custom context provides easy access to list of all gym plans
 */
class GymPlanContext extends Context {

    constructor() {
        super();
        // All plans are held in a list of plans
        this.planList = new GymPlanList(this);
    }
}

/**
 * Define gym plan smart contract by extending Fabric Contract class
 *
 */
class GymPlanContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.gymplannet.gymplan');
    }

    /**
     * Define a custom context for gym plan
    */
    createContext() {
        return new GymPlanContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * Issue gym plan
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer gym plan issuer
     * @param {Integer} planNumber plan number for this issuer
     * @param {String} issueDateTime plan issue date
     * @param {String} maturityDateTime plan maturity date
     * @param {Integer} faceValue face value of plan
    */
    async issueGym(ctx, issuer, planNumber, issueDateTime, maturityDateTime, faceValue) {

        // create an instance of the plan
        let plan = GymPlan.createInstance(issuer, planNumber, issueDateTime, maturityDateTime, parseInt(faceValue));

        // Smart contract, rather than plan, moves plan into ISSUED state
        plan.setIssued();

        // save the owner's MSP 
        let mspid = ctx.clientIdentity.getMSPID();
        plan.setOwnerMSP(mspid);

        // Newly issued plan is owned by the issuer to begin with (recorded for reporting purposes)
        plan.setOwner(issuer);

        // Add the plan to the list of all similar gym plans in the ledger world state
        await ctx.planList.addPaper(plan);

        // Must return a serialized plan to caller of smart contract
        return plan;
    }

    /**
     * Buy gym plan
     *
      * @param {Context} ctx the transaction context
      * @param {String} issuer gym plan issuer
      * @param {Integer} planNumber plan number for this issuer
      * @param {String} currentOwner current owner of plan
      * @param {String} newOwner new owner of plan
      * @param {Integer} price price paid for this plan // transaction input - not written to asset
      * @param {String} purchaseDateTime time plan was purchased (i.e. traded)  // transaction input - not written to asset
     */
    async buy(ctx, issuer, planNumber, currentOwner, newOwner, price, purchaseDateTime) {

        // Retrieve the current plan using key fields provided
        let planKey = GymPlan.makeKey([issuer, planNumber]);
        let plan = await ctx.planList.getPaper(planKey);

        // Validate current owner
        if (plan.getOwner() !== currentOwner) {
            throw new Error('\nPlan ' + issuer + planNumber + ' is not owned by ' + currentOwner);
        }

        // First buy moves state from ISSUED to TRADING (when running )
        if (plan.isIssued()) {
            plan.setTrading();
        }

        // Check plan is not already REDEEMED
        if (plan.isTrading()) {
            plan.setOwner(newOwner);
            // save the owner's MSP 
            let mspid = ctx.clientIdentity.getMSPID();
            plan.setOwnerMSP(mspid);
        } else {
            throw new Error('\nPlan ' + issuer + planNumber + ' is not trading. Current state = ' + plan.getCurrentState());
        }

        // Update the plan
        await ctx.planList.updatePaper(plan);
        return plan;
    }

    /**
      *  Buy request:  (2-phase confirmation: Gym plan is 'PENDING' subject to completion of transfer by owning org)
      *  Alternative to 'buy' transaction
      *  Note: 'buy_request' puts plan in 'PENDING' state - subject to transfer confirmation [below].
      * 
      * @param {Context} ctx the transaction context
      * @param {String} issuer gym plan issuer
      * @param {Integer} planNumber plan number for this issuer
      * @param {String} currentOwner current owner of plan
      * @param {String} newOwner new owner of plan                              // transaction input - not written to asset per se - but written to block
      * @param {Integer} price price paid for this plan                         // transaction input - not written to asset per se - but written to block
      * @param {String} purchaseDateTime time plan was requested                // transaction input - ditto.
     */
    async buy_request(ctx, issuer, planNumber, currentOwner, newOwner, price, purchaseDateTime) {
        

        // Retrieve the current plan using key fields provided
        let planKey = GymPlan.makeKey([issuer, planNumber]);
        let plan = await ctx.planList.getPaper(planKey);

        // Validate current owner - this is really information for the user trying the sample, rather than any 'authorisation' check per se FYI
        if (plan.getOwner() !== currentOwner) {
            throw new Error('\nPlan ' + issuer + planNumber + ' is not owned by ' + currentOwner + ' provided as a parameter');
        }
        // plan set to 'PENDING' - can only be transferred (confirmed) by identity from owning org (MSP check).
        plan.setPending();

        // Update the plan
        await ctx.planList.updatePaper(plan);
        return plan;
    }

    /**
     * transfer gym plan: only the owning org has authority to execute. It is the complement to the 'buy_request' transaction. '[]' is optional below.
     * eg. issue -> buy_request -> transfer -> [buy ...n | [buy_request...n | transfer ...n] ] -> redeem
     * this transaction 'pair' is an alternative to the straight issue -> buy -> [buy....n] -> redeem ...path
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer gym plan issuer
     * @param {Integer} planNumber plan number for this issuer
     * @param {String} newOwner new owner of plan
     * @param {String} newOwnerMSP  MSP id of the transferee
     * @param {String} confirmDateTime  confirmed transfer date.
    */
    async transfer(ctx, issuer, planNumber, newOwner, newOwnerMSP, confirmDateTime) {

        // Retrieve the current plan using key fields provided
        let planKey = GymPlan.makeKey([issuer, planNumber]);
        let plan = await ctx.planList.getPaper(planKey);

        // Validate current owner's MSP in the plan === invoking transferor's MSP id - can only transfer if you are the owning org.

        if (plan.getOwnerMSP() !== ctx.clientIdentity.getMSPID()) {
            throw new Error('\nPlan ' + issuer + planNumber + ' is not owned by the current invoking Organisation, and not authorised to transfer');
        }

        // Plan needs to be 'pending' - which means you need to have run 'buy_pending' transaction first.
        if ( ! plan.isPending()) {
            throw new Error('\nPlan ' + issuer + planNumber + ' is not currently in state: PENDING for transfer to occur: \n must run buy_request transaction first');
        }
        // else all good

        plan.setOwner(newOwner);
        // set the MSP of the transferee (so that, that org may also pass MSP check, if subsequently transferred/sold on)
        plan.setOwnerMSP(newOwnerMSP);
        plan.setTrading();
        plan.confirmDateTime = confirmDateTime;

        // Update the plan
        await ctx.planList.updatePaper(plan);
        return plan;
    }

    /**
     * Redeem gym plan
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer gym plan issuer
     * @param {Integer} planNumber plan number for this issuer
     * @param {String} redeemingOwner redeeming owner of plan
     * @param {String} issuingOwnerMSP the MSP of the org that the plan will be redeemed with.
     * @param {String} redeemDateTime time plan was redeemed
    */
    async redeem(ctx, issuer, planNumber, redeemingOwner, issuingOwnerMSP, redeemDateTime) {

        let planKey = GymPlan.makeKey([issuer, planNumber]);

        let plan = await ctx.planList.getPaper(planKey);

        // Check plan is not alread in a state of REDEEMED
        if (plan.isRedeemed()) {
            throw new Error('\nPlan ' + issuer + planNumber + ' has already been redeemed');
        }

        // Validate current redeemer's MSP matches the invoking redeemer's MSP id - can only redeem if you are the owning org.

        if (plan.getOwnerMSP() !== ctx.clientIdentity.getMSPID()) {
            throw new Error('\nPlan ' + issuer + planNumber + ' cannot be redeemed by ' + ctx.clientIdentity.getMSPID() + ', as it is not the authorised owning Organisation');
        }

        // As this is just a sample, can show additional verification check: that the redeemer provided matches that on record, before redeeming it
        if (plan.getOwner() === redeemingOwner) {
            plan.setOwner(plan.getIssuer());
            plan.setOwnerMSP(issuingOwnerMSP);
            plan.setRedeemed();
            plan.redeemDateTime = redeemDateTime; // record redemption date against the asset (the complement to 'issue date')
        } else {
            throw new Error('\nRedeeming owner: ' + redeemingOwner + ' organisation does not currently own plan: ' + issuer + planNumber);
        }

        await ctx.planList.updatePaper(plan);
        return plan;
    }

    // Query transactions

    /**
     * Query history of a gym plan
     * @param {Context} ctx the transaction context
     * @param {String} issuer gym plan issuer
     * @param {Integer} planNumber plan number for this issuer
    */
    async queryHistory(ctx, issuer, planNumber) {

        // Get a key to be used for History query

        let query = new QueryUtils(ctx, 'org.gymplannet.plan');
        let results = await query.getAssetHistory(issuer, planNumber); // (cpKey);
        return results;

    }

    /**
    * queryOwner gym plan: supply name of owning org, to find list of plans based on owner field
    * @param {Context} ctx the transaction context
    * @param {String} owner gym plan owner
    */
    async queryOwner(ctx, owner) {

        let query = new QueryUtils(ctx, 'org.gymplannet.plan');
        let owner_results = await query.queryKeyByOwner(owner);

        return owner_results;
    }

    /**
    * queryPartial gym plan - provide a prefix eg. "DigiBank" will list all plans _issued_ by DigiBank etc etc
    * @param {Context} ctx the transaction context
    * @param {String} prefix asset class prefix (added to planlist namespace) eg. org.plannet.planUniversalHealth asset listing: plans issued by UniversalHealth.
    */
    async queryPartial(ctx, prefix) {

        let query = new QueryUtils(ctx, 'org.gymplannet.plan');
        let partial_results = await query.queryKeyByPartial(prefix);

        return partial_results;
    }

    /**
    * queryAdHoc gym plan - supply a custom mango query
    * eg - as supplied as a param:     
    * ex1:  ["{\"selector\":{\"faceValue\":{\"$lt\":8000000}}}"]
    * ex2:  ["{\"selector\":{\"faceValue\":{\"$gt\":4999999}}}"]
    * 
    * @param {Context} ctx the transaction context
    * @param {String} queryString querystring
    */
    async queryAdhoc(ctx, queryString) {

        let query = new QueryUtils(ctx, 'org.gymplannet.plan');
        let querySelector = JSON.parse(queryString);
        let adhoc_results = await query.queryByAdhoc(querySelector);

        return adhoc_results;
    }


    /**
     * queryNamed - supply named query - 'case' statement chooses selector to build (pre-canned for demo purposes)
     * @param {Context} ctx the transaction context
     * @param {String} queryname the 'named' query (built here) - or - the adHoc query string, provided as a parameter
     */
    async queryNamed(ctx, queryname) {
        let querySelector = {};
        switch (queryname) {
            case "redeemed":
                querySelector = { "selector": { "currentState": 4 } };  // 4 = redeemd state
                break;
            case "trading":
                querySelector = { "selector": { "currentState": 3 } };  // 3 = trading state
                break;
            case "value":
                // may change to provide as a param - fixed value for now in this sample
                querySelector = { "selector": { "faceValue": { "$gt": 4000000 } } };  // to test, issue GymPlans with faceValue <= or => this figure.
                break;
            default: // else, unknown named query
                throw new Error('invalid named query supplied: ' + queryname + '- please try again ');
        }

        let query = new QueryUtils(ctx, 'org.gymplannet.plan');
        let adhoc_results = await query.queryByAdhoc(querySelector);

        return adhoc_results;
    }

}

module.exports = GymPlanContract;
