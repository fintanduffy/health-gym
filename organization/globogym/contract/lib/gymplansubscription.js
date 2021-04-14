/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('../ledger-api/state.js');

// Enumerate gym plan state values
const cpState = {
    ISSUED: 1,
    SUBSCRIBING: 2,
    EXPIRED: 3
    // PENDING: 2,
    // TRADING: 3,
    // REDEEMED: 4
};

/**
 * GymPlan class extends State class
 * Class will be used by application and smart contract to define a plan
 */
class GymPlanSubscription extends State {

    constructor(obj) {
        super(GymPlanSubscription.getClass(), [obj.issuer, obj.planNumber, obj.planSubscriber, obj.subscribeDateTime]);
        Object.assign(this, obj);
    }

    /**
     * Basic getters and setters
    */
    getIssuer() {
        return this.issuer;
    }

    setIssuer(newIssuer) {
        this.issuer = newIssuer;
    }

    getOwner() {
        return this.owner;
    }

    setOwnerMSP(mspid) {
        this.mspid = mspid;
    }

    getOwnerMSP() {
        return this.mspid;
    }

    setOwner(newOwner) {
        this.owner = newOwner;
    }

    /**
     * Useful methods to encapsulate gym plan states
     */
    setIssued() {
        this.currentState = cpState.ISSUED;
    }

    setSubscribing(){
        this.currentState = cpState.SUBSCRIBING
    }

    setExpired(){
        this.currentState = cpState.EXPIRED
    }

    /*setTrading() {
        this.currentState = cpState.TRADING;
    }

    setRedeemed() {
        this.currentState = cpState.REDEEMED;
    }

    setPending() {
        this.currentState = cpState.PENDING;
    }*/

    isIssued() {
        return this.currentState === cpState.ISSUED;
    }

    isSubscribing(){
        return this.currentState === cpState.SUBSCRIBING;
    }

    isExpired(){
        return this.currentState === cpState.EXPIRED;
    }

    /*isTrading() {
        return this.currentState === cpState.TRADING;
    }

    isRedeemed() {
        return this.currentState === cpState.REDEEMED;
    }

    isPending() {
        return this.currentState === cpState.PENDING;
    }*/

    static fromBuffer(buffer) {
        return GymPlanSubscription.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to gym plan
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, GymPlanSubscription);
    }

    /**
     * Factory method to create a gym plan object
     */
    /*static createInstance(issuer, planNumber, issueDateTime, maturityDateTime, faceValue, planQty) {
        return new GymPlan({ issuer, planNumber, issueDateTime, maturityDateTime, faceValue, planQty });
    }*/
    static createInstance(issuer, planNumber, planSubscriber, subscribeDateTime) {
        return new GymPlanSubscription({issuer, planNumber, planSubscriber, subscribeDateTime});
    }

    static getClass() {
        return 'org.gymplannet.gymplansubscription';
    }
}

module.exports = GymPlanSubscription;
