/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access GymPlanNet network
 * 4. Construct request to subscribe to a gym plan
 * 5. Submit transaction
 * 6. Process response
 */

//  sample call: $ node unsubscribe.js GloboGym 00002 UniversalHealth

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const moment = require('moment');
const { Wallets, Gateway } = require('fabric-network');
const GymPlanSubcription = require('../contract/lib/gymplansubscription.js');

// Main program function
async function main () {

    var planSubscriber = 'GloboGym';
    var planNumber = '00001';
    var planOwner = 'UniversalHealth';    
    var date = new Date();

    process.argv.forEach(function (val, index, array) {
        console.log(index + ': ' + val);

        if(index == 2 ){
            planSubscriber = val; 
        }

        if(index == 3 ){
            planNumber = val; 
        }
        
        if(index == 4 ){
            planOwner = val;
        }
    });

    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet('../identity/user/meshell/wallet');

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        const userName = 'meshell';

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

        // Access GymPlanNet network
        console.log('Use network channel: mychannel.');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to gym plan contract
        console.log('Use org.gymplannet.gymplan smart contract.');

        const contract = await network.getContract('gymplancontract', 'org.gymplannet.gymplan');

        // buy gym plan
        console.log('Submit gym plan unsubscribe transaction.');

        const subscribeResponse = await contract.submitTransaction('unsubscribe', planSubscriber, planNumber, planOwner);

        // process response
        console.log('Process subscribe transaction response.');

        let planSubscription = GymPlanSubcription.fromBuffer(subscribeResponse);

        console.log(`${planSubscription.planOwner} gym plan : ${planSubscription.planNumber} successfully unsubscribed by ${planSubscription.owner}`);
        console.log('Transaction complete.');

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

    console.log('Subscribe program complete.');

}).catch((e) => {

    console.log('Subscribe program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
