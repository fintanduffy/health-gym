/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('../ledger-api/statelist.js');

const GymPlan = require('./gymplan.js');

class GymPlanList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.gymplannet.plan');
        this.use(GymPlan);
    }

    async addPaper(plan) {
        return this.addState(plan);
    }

    async getPaper(planKey) {
        return this.getState(planKey);
    }

    async updatePaper(plan) {
        return this.updateState(plan);
    }
}


module.exports = GymPlanList;
