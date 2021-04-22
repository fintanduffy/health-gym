'use strict';

// Utility class for ledger state
const State = require('../ledger-api/state.js');

// Enumerate gym plan state values
const gpState = {
    SUBSCRIBED: 1,
    UNSUBSCRIBED: 2
};

/**
 * GymPlan class extends State class
 * Class will be used by application and smart contract to define a plan
 */
class GymPlanSubscription extends State {

    constructor(obj) {
        super(GymPlanSubscription.getClass(), [obj.owner, obj.planNumber, obj.planOwner]);
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
     * Useful methods to encapsulate gym plan subscription states
     */
    setSubscribed() {
        this.currentState = gpState.SUBSCRIBED;
    }

    setUnSubscribed(){
        this.currentState = gpState.UNSUBSCRIBED;
    }

    isSubscribed() {
        return this.currentState === gpState.SUBSCRIBED;
    }

    isUnSubscribed(){
        return this.currentState === gpState.UNSUBSCRIBED;
    }

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
    static createInstance(owner, planNumber, planOwner, subscribeDateTime) {
        return new GymPlanSubscription({owner, planNumber, planOwner, subscribeDateTime});
    }

    static getClass() {
        return 'org.gymplannet.gymplansubscription';
    }
}

module.exports = GymPlanSubscription;
