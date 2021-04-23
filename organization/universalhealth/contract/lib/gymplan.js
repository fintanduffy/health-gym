'use strict';

// Utility class for ledger state
const State = require('../ledger-api/state.js');

// Enumerate gym plan state values
const gpState = {
    ISSUED: 1,
    SUBSCRIBING: 2,
    ACTIVE: 3,
    EXPIRED: 5
};

/**
 * GymPlan class extends State class
 * Class will be used by application and smart contract to define a plan
 */
class GymPlan extends State {

    constructor(obj) {
        super(GymPlan.getClass(), [obj.owner, obj.planNumber]);
        Object.assign(this, obj);
    }

    /**
     * Basic getters and setters
    */
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
        this.currentState = gpState.ISSUED;
    }

    setSubscribing(){
        this.currentState = gpState.SUBSCRIBING
    }

    setActive(){
        this.currentState = gpState.ACTIVE
    }

    setExpired(){
        this.currentState = gpState.EXPIRED
    }

    isIssued() {
        return this.currentState === gpState.ISSUED;
    }

    isSubscribing(){
        return this.currentState === gpState.SUBSCRIBING;
    }

    isActive(){
        return this.currentState === gpState.ACTIVE;
    }

    isExpired(){
        return this.currentState === gpState.EXPIRED;
    }

    static fromBuffer(buffer) {
        return GymPlan.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to gym plan
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, GymPlan);
    }

    /**
     * Factory method to create a gym plan object
     */
    static createInstance(owner, planNumber, issueDateTime, activeDateTime, expiryDateTime, subscriberCount, totalAwards, trainerSessions, numClasses, gymAccess, poolAccess) {
        return new GymPlan({owner, planNumber, issueDateTime, activeDateTime, expiryDateTime, subscriberCount, totalAwards, trainerSessions, numClasses, gymAccess, poolAccess });
    }

    static getClass() {
        return 'org.gymplannet.gymplan';
    }
}

module.exports = GymPlan;
