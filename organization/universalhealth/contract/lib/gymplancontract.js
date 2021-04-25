'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// GymPlanNet specifc classes
const GymPlan = require('./gymplan.js');
const GymPlanList = require('./gymplanlist.js');
const GymPlanSubscription = require('./gymplansubscription.js');
const GymPlanSubscriptionList = require('./gymplansubscriptionlist.js');
const GymPlanUsage = require('./gymplanusage.js');
const GymPlanUsageList = require('./gymplanusagelist.js');
const QueryUtils = require('./queries.js');

/**
 * A custom context provides easy access to list of all gym plans
 */
class GymPlanContext extends Context {

    constructor() {
        super();
        // All plans are held in a list of plans
        this.planList = new GymPlanList(this);        
        this.planSubscriptionList = new GymPlanSubscriptionList(this);
        this.planUsageList = new GymPlanUsageList(this);
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
     * @param {String} owner gym plan creator
     * @param {Integer} planNumber plan number for this owner
     * @param {String} issueDateTime plan issue date
     * @param {String} activeDateTime, plan activation date
     * @param {String} expiryDateTime, plan expiry date
     * @param {Integer} subsciberCount, number of subscribers
     * @param {Integer} totalAwards, total value to be distributed to subscribers
     * @param {Integer} trainerSessions number of personal training sessions
     * @param {Integer} numClasses number of classes during the term of the plan
     * @param {Integer} gymAccess is gym access included
     * @param {Integer} poolAccess is pool access included
    */
    async issue(ctx, owner, planNumber, issueDateTime, activeDateTime, expiryDateTime, subsciberCount, totalAwards, trainerSessions, numClasses, gymAccess, poolAccess) {

        //  Check if the plan already exists
        let planKey = GymPlan.makeKey([owner, planNumber]);
        let plan = await ctx.planList.getGymPlan(planKey);

        if ( plan !== null ){
            throw new Error('\nPlan ' + owner + planNumber + ' already exists ');
        }

        // create an instance of the plan
        plan = GymPlan.createInstance(owner, planNumber, issueDateTime, activeDateTime, expiryDateTime, subsciberCount, totalAwards, trainerSessions, numClasses, gymAccess, poolAccess);

        // Smart contract, rather than plan, moves plan into ISSUED state
        plan.setIssued();

        // save the owner's MSP 
        let mspid = ctx.clientIdentity.getMSPID();
        plan.setOwnerMSP(mspid);

        plan.setOwner(owner);

        // Add the plan to the list of all similar gym plans in the ledger world state
        await ctx.planList.addGymPlan(plan);

        // Must return a serialized plan to caller of smart contract
        return plan;
    }

    async expire_plan(ctx, planOwner, planNumber) {

        // Retrieve the current plan using key fields provided
        let planKey = GymPlan.makeKey([planOwner, planNumber]);
        let plan = await ctx.planList.getGymPlan(planKey);

        // To do : implement date validation
        /*if (plan.isActive()) {            
            var current = new Date();
            if (current <= plan.expiryDateTime){
                plan.setExpired();
            }
            else{
                throw new Error('\nPlan ' + planOwner + planNumber + ' is active and has not passed the expiratin date' );
            }
        }        
        else{*/
            plan.setExpired();
        //}

        // Update the plan
        await ctx.planList.updateGymPlan(plan);
        return plan;
    }

    async activate_plan(ctx, planOwner, planNumber) {

        // Retrieve the current plan using key fields provided
        let planKey = GymPlan.makeKey([planOwner, planNumber]);
        let plan = await ctx.planList.getGymPlan(planKey);

        if (plan.isActive()) {
            throw new Error('\nPlan ' + planOwner + planNumber + ' is already active' );
        }

        if (plan.isIssued()) {
            throw new Error('\nPlan ' + planOwner + planNumber + ' has no subscribers. Unable to activate.' );
        }

        if (plan.isSubscribing()) {
            if (plan.subscriberCount > 0){
                plan.setActive();
            }
            else{
                throw new Error('\nPlan ' + planOwner + planNumber + ' has no subscribers. Unable to activate.' );
            }            
        }

        // Update the plan
        await ctx.planList.updateGymPlan(plan);
        return plan;
    }

    /**
     * Subscribe gym plan
     *
      * @param {Context} ctx the transaction context
      * @param {String} owner gym plan subscriber
      * @param {Integer} planNumber plan number for this owner
      * @param {String} planOwner owner of the plan
      * @param {String} subscribeDateTime time plan was subcribed 
     */
     async subscribe(ctx, owner, planNumber, planOwner, subscribeDateTime) {

        let planSubKey = GymPlanSubscription.makeKey([owner, planNumber, planOwner]);
        let planSubscription = await ctx.planSubscriptionList.getGymPlanSubscription(planSubKey);

        if ( planSubscription !== null ){
            if (planSubscription.isSubscribed()){
                throw new Error('\nPlan ' + planOwner + planNumber + ' already subcribed by ' +  owner);    
            }
            else{
                planSubscription.setSubscribed();
                // Add the plan to the list of all similar gym plans in the ledger world state
                await ctx.planSubscriptionList.updateGymPlanSubscription(planSubscription);                
            }
        }
        else{

            // Retrieve the current plan using key fields provided
            let planKey = GymPlan.makeKey([planOwner, planNumber]);
            let plan = await ctx.planList.getGymPlan(planKey);

            if (plan === null){
                throw new Error('\nPlan ' + planOwner + planNumber + ' not found' );
            }

            if (plan.isIssued()){
                plan.setSubscribing();
                plan.subscriberCount = plan.subscriberCount + 1;

                await ctx.planList.updateGymPlan(plan);
            }        

            planSubscription = GymPlanSubscription.createInstance(owner, planNumber, planOwner, subscribeDateTime);
            planSubscription.setSubscribed();
            
            // save the owner's MSP 
            let mspid = ctx.clientIdentity.getMSPID();
            planSubscription.setOwnerMSP(mspid);

            planSubscription.setOwner(owner);

            // Add the plan to the list of all similar gym plans in the ledger world state
            await ctx.planSubscriptionList.addGymPlanSubscription(planSubscription);            
        }
        return planSubscription;
    }

    /**
     * Unsubscribe gym plan
     *
      * @param {Context} ctx the transaction context
      * @param {String} planSubscriber gym plan subscriber
      * @param {Integer} planNumber plan number for this owner
      * @param {String} planOwner owner of the plan
     */
     async unsubscribe(ctx, planSubscriber, planNumber, planOwner) {

        let planSubKey = GymPlanSubscription.makeKey([planSubscriber, planNumber, planOwner]);
        let planSubscription = await ctx.planSubscriptionList.getGymPlanSubscription(planSubKey);

        if ( planSubscription !== null ){
            if (planSubscription.isUnsubscribed()){
                throw new Error('\nPlan ' + planOwner + planNumber + ' already unsubcribed by ' +  planSubscriber);
            }
            else{
                planSubscription.setUnsubscribed();
                // Add the plan to the list of all similar gym plans in the ledger world state
                await ctx.planSubscriptionList.updateGymPlanSubscription(planSubscription);
                return planSubscription;
            }
        }
        else{
            throw new Error('\nPlan ' + planOwner + planNumber + ' subscription not found for ' +  planSubscriber);            
        }
    }

    /**
     * Use gym plan
     *
      * @param {Context} ctx the transaction context
      * @param {String} planOwner gym plan owner
      * @param {Integer} planNumber plan number for this owner
      * @param {String} planSubscriber plan subscriber
      * @param {String} planMember plan member
      * @param {Integer} trainerSessions number of personal training sessions
      * @param {Integer} numClasses number of classes
      * @param {Integer} gymAccess is gym access included
      * @param {Integer} poolAccess is pool access included
     */
     async use_plan(ctx, planOwner, planNumber, planSubscriber, planMember, trainerSessions, numClasses, gymAccess, poolAccess) {

        //  Confirm the plan exists and is active        
        let planKey = GymPlan.makeKey([planOwner, planNumber]);
        let plan = await ctx.planList.getGymPlan(planKey);

        if ( plan === null ){
            throw new Error('\nPlan ' + planOwner + planNumber + ' does not exists ');    
        }
        else{
            if (plan.isActive()){
                
                //  confirm there is a valid subscription
                let planSubKey = GymPlanSubscription.makeKey([planSubscriber, planNumber, planOwner]);
                let planSubscription = await ctx.planSubscriptionList.getGymPlanSubscription(planSubKey);

                if ( planSubscription === null ){
                    throw new Error('\nPlan ' + planOwner + planNumber + ' is not subscribed by ' + planSubscriber);    
                }
                else{
                        
                    if ( planSubscription.isSubscribed ()){
                        
                        let planUsage = GymPlanUsage.createInstance(planOwner, planNumber, planSubscriber, planMember, trainerSessions, numClasses, gymAccess, poolAccess);
                        
                        // save the owner's MSP 
                        let mspid = ctx.clientIdentity.getMSPID();
                        planUsage.setOwnerMSP(mspid);
        
                        planUsage.setOwner(planOwner);
        
                        // Add the plan usage to the list of all similar gym plans usages in the ledger world state
                        await ctx.planUsageList.addGymPlanUsage(planUsage);
        
                        return planUsage;     
                    }
                    else{
                        throw new Error('\nPlan ' + planOwner + planNumber + ' is not subscribed by ' + planSubscriber);    
                    }
                }                    
            }
            else{
                throw new Error('\nPlan ' + planOwner + planNumber + ' is not active ');    
            }
        }
    }

    /**
     * Cancel gym plan usage
     *
      * @param {Context} ctx the transaction context
      * @param {String} planOwner gym plan owner
      * @param {Integer} planNumber plan number for this owner
      * @param {String} planSubscriber plan subscriber
      * @param {String} planMember plan member
      * @param {Integer} trainerSessions number of personal training sessions
      * @param {Integer} numClasses number of classes
      * @param {Integer} gymAccess is gym access included
      * @param {Integer} poolAccess is pool access included
     */
     async cancel_use_plan(ctx, planOwner, planNumber, planSubscriber, planMember, trainerSessions, numClasses, gymAccess, poolAccess) {

        //  Confirm the plan exists and is active        
        let planKey = GymPlan.makeKey([planOwner, planNumber]);
        let plan = await ctx.planList.getGymPlan(planKey);

        if ( plan === null ){
            throw new Error('\nPlan ' + planOwner + planNumber + ' does not exists ');    
        }
        else{
            //  subcriber is permitted to cancel the usage as long as the plan is still active
            //  members or the health insurance company are not permitted to cancel usage
            if (plan.isActive()){                

                /* To Do: Date validation   
                var current = new Date();

                if (current >= plan.activeDateTime){*/ 
                
                    //  confirm there is a valid subscription
                    let planSubKey = GymPlanSubscription.makeKey([planSubscriber, planNumber, planOwner]);
                    let planSubscription = await ctx.planSubscriptionList.getGymPlanSubscription(planSubKey);

                    if ( planSubscription === null ){
                        throw new Error('\nPlan ' + planOwner + planNumber + ' is not subscribed by ' + planSubscriber);    
                    }
                    else{
                        
                        if ( planSubscription.isSubscribed ()){
                        
                            let planUsageKey = GymPlanUsage.makeKey([planOwner, planNumber, planSubscriber, planMember]);
                            let planUsage = await ctx.planUsageList.getGymPlanSubscription(planUsageKey);
                        
                            // save current MSP 
                            let mspid = ctx.clientIdentity.getMSPID();                            

                            // ensure it is the subcriber requesting the cancellation
                            if (planSubscription.mspid === mspid){                            
        
                                if (planUsage.isConfirmed()){

                                    planUsage.setCancelled();
                                    // Add the plan usage to the list of all similar gym plans usages in the ledger world state
                                    await ctx.planUsageList.updateGymPlanUsage(planUsage);
            
                                    return planUsage;
                                }
                            }
                        }
                        else{
                            throw new Error('\nPlan ' + planOwner + planNumber + ' is not subscribed by ' + planSubscriber);    
                        }
                    }
                /*}
                else{
                    throw new Error('\nPlan ' + planOwner + planNumber + ' is not active yet ');    
                }*/
            }
            else{
                throw new Error('\nPlan ' + planOwner + planNumber + ' is not active ');    
            }
        }
    }

    // Query transactions

    /**
     * Query history of a gym plan
     * @param {Context} ctx the transaction context
     * @param {String} owner gym plan owner
     * @param {Integer} planNumber plan number for this owner
     * @param {String} listName e.g. org.gymplannet.gymplan
    */
    async queryHistory(ctx, owner, planNumber, listName) {

        // Get a key to be used for History query

        let query = new QueryUtils(ctx, listName); //'org.gymplannet.gymplan');
        let results = await query.getAssetHistory(owner, planNumber); // (gpKey);
        return results;

    }

    /**
     * Query history of a gym plan subscription
     * @param {Context} ctx the transaction context
     * @param {String} owner gym plan owner
     * @param {Integer} planNumber plan number for this owner
     * @param {String} planSubscriber plan subscriber
     * @param {String} listName e.g. org.gymplannet.gymplan
    */
     async queryHistorySubscription(ctx, owner, planNumber, planSubscriber, listName) {

        // Get a key to be used for History query

        let query = new QueryUtils(ctx, listName); //'org.gymplannet.gymplan');
        let results = await query.getAssetHistorySubscription(owner, planNumber, planSubscriber);
        return results;

    }

    /**
     * Query history of a gym plan usage
     * @param {Context} ctx the transaction context
     * @param {String} owner gym plan owner
     * @param {Integer} planNumber plan number for this owner
     * @param {String} planSubscriber plan subscriber
     * @param {String} planMember plan member
     * @param {String} listName e.g. org.gymplannet.gymplan
    */
     async queryHistoryUsage(ctx, owner, planNumber, planSubscriber, planMember, listName) {

        // Get a key to be used for History query

        let query = new QueryUtils(ctx, listName); //'org.gymplannet.gymplan');
        let results = await query.getAssetHistoryUsage(owner, planNumber, planSubscriber, planMember);
        return results;
    }

    /**
    * queryOwner gym plan: supply name of owning org, to find list of plans based on owner field
    * @param {Context} ctx the transaction context
    * @param {String} owner gym plan owner
    * @param {String} listName e.g. org.gymplannet.gymplan
    */
    async queryOwner(ctx, owner, listName) {

        let query = new QueryUtils(ctx, listName); //'org.gymplannet.gymplan');
        let owner_results = await query.queryKeyByOwner(owner);

        return owner_results;
    }

    /**
    * queryPartial gym plan - provide a prefix eg. "DigiBank" will list all plans _issued_ by DigiBank etc etc
    * @param {Context} ctx the transaction context
    * @param {String} prefix asset class prefix (added to planlist namespace) eg. org.plannet.planUniversalHealth asset listing: plans issued by UniversalHealth.
    * @param {String} listName e.g. org.gymplannet.gymplan
    */
    async queryPartial(ctx, prefix, listName) {

        let query = new QueryUtils(ctx, listName);//'org.gymplannet.gymplan');
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
    * @param {String} listName e.g. org.gymplannet.gymplan
    */
    async queryAdhoc(ctx, queryString, listName) {

        let query = new QueryUtils(ctx, listName);//'org.gymplannet.gymplan');
        let querySelector = JSON.parse(queryString);
        let adhoc_results = await query.queryByAdhoc(querySelector);

        return adhoc_results;
    }


    /**
     * queryNamed - supply named query - 'case' statement chooses selector to build (pre-canned for demo purposes)
     * @param {Context} ctx the transaction context
     * @param {String} queryname the 'named' query (built here) - or - the adHoc query string, provided as a parameter
     * @param {String} listName e.g. org.gymplannet.gymplan
     */
    async queryNamed(ctx, queryname, listName) {
        let querySelector = {};
        switch (queryname) {
            case "dormant":
                querySelector = { "selector": { "currentState": 1 } };  // 1 = dormant state
                break;
            case "subscribing":
                querySelector = { "selector": { "currentState": 2 } };  // 2 = active state
                break;    
            case "active":
                querySelector = { "selector": { "currentState": 2 } };  // 2 = active state
                break;
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

        let query = new QueryUtils(ctx, listName);//'org.gymplannet.gymplan');
        let adhoc_results = await query.queryByAdhoc(querySelector);

        return adhoc_results;
    }

}

module.exports = GymPlanContract;
