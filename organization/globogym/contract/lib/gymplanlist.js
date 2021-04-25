'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('../ledger-api/statelist.js');

const GymPlan = require('./gymplan.js');

class GymPlanList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.gymplannet.gymplan');
        this.use(GymPlan);
    }

    async addGymPlan(gymplan) {
        return this.addState(gymplan);
    }

    async getGymPlan(gymPlanKey) {
        return this.getState(gymPlanKey);
    }

    async updateGymPlan(gymplan) {
        return this.updateState(gymplan);
    }
}

module.exports = GymPlanList;
