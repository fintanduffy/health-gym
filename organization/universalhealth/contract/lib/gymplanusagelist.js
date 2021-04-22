'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('../ledger-api/statelist.js');

const GymPlanUsage = require('./gymplanusage.js');

class GymPlanUsageList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.gymplannet.gymplanusage');
        this.use(GymPlanUsage);
    }

    async addGymPlanUsage(gymplanusage) {
        return this.addState(gymplanusage);
    }

    async getGymPlanUsage(gymPlanUsageKey) {
        return this.getState(gymPlanUsageKey);
    }

    async updateGymPlanUsage(gymplanusage) {
        return this.updateState(gymplanusage);
    }
}


module.exports = GymPlanUsageList;
