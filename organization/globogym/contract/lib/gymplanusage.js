'use strict';

// Utility class for ledger state
const State = require('../ledger-api/state.js');

// Enumerate gym plan usage state values
const gpState = {
    DORMANT: 1,
    ACTIVE: 2,
    EXPIRED: 3
};

/**
 * GymPlan class extends State class
 * Class will be used by application and smart contract to define a plan
 */
class GymPlanUsage extends State {

    constructor(obj) {
        super(GymPlanUsage.getClass(), [obj.owner, obj.planNumber, obj.planSubscriber, obj.planMember]);
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
    setDormant() {
        this.currentState = gpState.DORMANT;
    }

    setActive(){
        this.currentState = gpState.ACTIVE;
    }

    setExpired(){
        this.currentState = gpState.EXPIRED;
    }

    isDormant() {
        return this.currentState === gpState.DORMANT;
    }

    isActive(){
        return this.currentState === gpState.ACTIVE;
    }

    isExpired(){
        return this.currentState === gpState.EXPIRED;
    }

    static fromBuffer(buffer) {
        return GymPlanUsage.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to gym plan
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, GymPlanUsage);
    }

    /**
     * Factory method to create a gym plan object
     */
    static createInstance(issuer, planNumber, planSubscriber, planMember, trainerSessions, numClasses, gymAccess, poolAccess) {
        return new GymPlanUsage({issuer, planNumber, planSubscriber, planMember, trainerSessions, numClasses, gymAccess, poolAccess});
    }

    static getClass() {
        return 'org.gymplannet.gymplanusage';
    }
}

module.exports = GymPlanUsage;
