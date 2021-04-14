/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('../ledger-api/statelist.js');

const GymPlanSubscription = require('./gymplansubscription.js');

class GymPlanSubscriptionList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.gymplannet.gymplansubscription');
        this.use(GymPlanSubscription);
    }

    async addGymPlanSubscription(gymplansubscription) {
        return this.addState(gymplansubscription);
    }

    async getGymPlanSubscription(gymPlanSubscriptionKey) {
        return this.getState(gymPlanSubscriptionKey);
    }

    async updateGymPlanSubscription(gymplansubscription) {
        return this.updateState(gymplansubscription);
    }
}


module.exports = GymPlanSubscriptionList;
