/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access GymPlanNet network
 * 4. Construct request to query the ledger
 * 5. Evaluate transactions (queries)
 * 6. Process responses
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');


// Main program function
async function main() {

    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet('../identity/user/balaji/wallet');

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        const userName = 'balaji';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/connection-org1.yaml', 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled: true, asLocalhost: true }

        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access GylPlanNet network
        console.log('Use network channel: mychannel.');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to gym plan contract
        console.log('Use org.gymplannet.gymplan smart contract.');

        const contract = await network.getContract('gymplancontract', 'org.gymplannet.gymplan');

        // queries - gym plan
        console.log('-----------------------------------------------------------------------------------------');
        console.log('****** Submitting gym plan queries ****** \n\n ');


        // 1 asset history
        console.log('1. Query Gym Plan History....');
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse = await contract.evaluateTransaction('queryHistory', 'UniversalHealth', '00001', 'org.gymplannet.gymplan');

        let json = JSON.parse(queryResponse.toString());
        console.log(json);
        console.log('\n\n');
        console.log('\n  History query complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n');

        // 2 ownership query
        console.log('2. Query Gym Plan Ownership.... GymPlans owned by UniversalHealth');
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse2 = await contract.evaluateTransaction('queryOwner', 'UniversalHealth', 'org.gymplannet.gymplan');
        json = JSON.parse(queryResponse2.toString());
        console.log(json);

        console.log('\n\n');
        console.log('\n  Plan Ownership query complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n');

        // 3 partial key query
        console.log('3. Query Gym Plan Partial Key.... Plans in org.gymplannet.plans namespace and prefixed UniversalHealth');
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse3 = await contract.evaluateTransaction('queryPartial', 'UniversalHealth', 'org.gymplannet.gymplan');

        json = JSON.parse(queryResponse3.toString());
        console.log(json);
        console.log('\n\n');

        console.log('\n  Partial Key query complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n');


        // 4 Named query - all redeemed plans
        console.log('4. Named Query: ... All plans in org.gymplannet.plans that are in current state of redeemed');
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse4 = await contract.evaluateTransaction('queryNamed', 'redeemed', 'org.gymplannet.gymplan');

        json = JSON.parse(queryResponse4.toString());
        console.log(json);
        console.log('\n\n');

        console.log('\n  Named query "redeemed" complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n');


        // 5 named query - by value
        console.log('5. Named Query:.... All plans in org.gymplannet.gymplans with faceValue > 4000000');
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse5 = await contract.evaluateTransaction('queryNamed', 'value', 'org.gymplannet.gymplan');

        json = JSON.parse(queryResponse5.toString());
        console.log(json);
        console.log('\n\n');

        console.log('\n  Named query by "value" complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n');

        // 6 gym subscription asset history
        console.log('6. Query Gym Plan Subscription History....');
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse6 = await contract.evaluateTransaction('queryHistorySubscription', 'UniversalHealth', '00001', 'GloboGym', 'org.gymplannet.gymplansubscription');

        json = JSON.parse(queryResponse6.toString());
        console.log(json);
        console.log('\n\n');
        console.log('\n  History query complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n');

        // 7 ownership query
        console.log('7. Query Gym Plan Subcription Ownership.... GymPlanSubcriptions owned by UniversalHealth');
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse7 = await contract.evaluateTransaction('queryOwner', 'UniversalHealth', 'org.gymplannet.gymplansubscription');
        json = JSON.parse(queryResponse7.toString());
        console.log(json);

        console.log('\n\n');
        console.log('\n  Plan Ownership query complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n');

        // 8 partial key query
        console.log('8. Query Gym Plan Subscription Partial Key.... Plans in org.gymplannet.gymplansubscription namespace and prefixed UniversalHealth');
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse8 = await contract.evaluateTransaction('queryPartial', 'UniversalHealth', 'org.gymplannet.gymplansubscription');

        json = JSON.parse(queryResponse8.toString());
        console.log(json);
        console.log('\n\n');

        console.log('\n  Partial Key query complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n');


        // 9 Named query - all redeemed plans
        console.log('9. Named Query: ... All plans in org.gymplannet.gymplansubscription that are in current state of redeemed');
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse9 = await contract.evaluateTransaction('queryNamed', 'redeemed', 'org.gymplannet.gymplansubscription');

        json = JSON.parse(queryResponse9.toString());
        console.log(json);
        console.log('\n\n');

        console.log('\n  Named query "redeemed" complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n');


        // 10 named query - by value
        console.log('10. Named Query:.... All plans in org.gymplannet.gymplansubscription ');
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse10 = await contract.evaluateTransaction('queryNamed', 'value', 'org.gymplannet.gymplansubscription');

        json = JSON.parse(queryResponse10.toString());
        console.log(json);
        console.log('\n\n');

        console.log('\n  Named query by "value" complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n'); 

        // 11 gym usage asset history
        console.log('11. Query Gym Plan Usage History....');
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse11 = await contract.evaluateTransaction('queryHistoryUsage', 'UniversalHealth', '00001', 'GloboHealth', 'Gordon', 'org.gymplannet.gymplanusage');

        json = JSON.parse(queryResponse11.toString());
        console.log(json);
        console.log('\n\n');
        console.log('\n  History query complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n');

        // 12 ownership query
        console.log('12. Query Gym Plan Usage Ownership.... GymPlanUsage owned by UniversalHealth');
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse12 = await contract.evaluateTransaction('queryOwner', 'UniversalHealth', 'org.gymplannet.gymplanusage');
        json = JSON.parse(queryResponse12.toString());
        console.log(json);

        console.log('\n\n');
        console.log('\n  Plan Ownership query complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n');

        // 13 partial key query
        console.log('13. Query Gym Plan Usage Partial Key.... Plans in org.gymplannet.gymplanusage namespace and prefixed UniversalHealth');
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse13 = await contract.evaluateTransaction('queryPartial', 'UniversalHealth', 'org.gymplannet.gymplanusage');

        json = JSON.parse(queryResponse13.toString());
        console.log(json);
        console.log('\n\n');

        console.log('\n  Partial Key query complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n');


        // 14 Named query - all redeemed plans
        console.log('14. Named Query: ... All plans in org.gymplannet.gymplanusage that are in current state of active');
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse14 = await contract.evaluateTransaction('queryNamed', 'active', 'org.gymplannet.gymplanusage');

        json = JSON.parse(queryResponse14.toString());
        console.log(json);
        console.log('\n\n');

        console.log('\n  Named query "active" complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n');


        // 15 named query - by value
        console.log('15. Named Query:.... All plans in org.gymplannet.gymplanusage ');
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse15 = await contract.evaluateTransaction('queryNamed', 'value', 'org.gymplannet.gymplanusage');

        json = JSON.parse(queryResponse15.toString());
        console.log(json);
        console.log('\n\n');

        console.log('\n  Named query by "value" complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n'); 

    } catch (error) {

        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);

    } finally {

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();

    }
}
main().then(() => {

    console.log('Queryapp program complete.');

}).catch((e) => {

    console.log('Queryapp program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
