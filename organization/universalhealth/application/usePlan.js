/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access GymPlanNet network
 * 4. Construct request to use a plan subscription
 * 5. Submit transaction
 * 6. Process response
 */

//  sample call: $ node usePlan.js UniversalHealth 00002 GloboGym Gordon 0 1 0 0

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');
const GymPlanUsage = require('../contract/lib/gymplanusage.js');

// Main program function
async function main () {

    var planMember = 'Gordon';
    var planSubscriber = 'GloboGym';
    var planNumber = '00001';
    var planOwner = 'UniversalHealth';
    var trainerSessions = 0;
    var numClasses = 0;
    var gymAccess = 0;
    var poolAccess = 0;

    process.argv.forEach(function (val, index, array) {
        console.log(index + ': ' + val);

        if(index == 2 ){
            planOwner = val; 
        }

        if(index == 3 ){
            planNumber = val; 
        }
        
        if(index == 4 ){
            planSubscriber = val;
        }

        if(index == 5 ){
            planMember = val;
        }

	if(index == 6 ){
            trainerSessions = val;
        }

        if(index == 7 ){
            numClasses = val;
        }

        if(index == 8 ){
            gymAccess = val;
        }

        if(index == 9 ){
            poolAccess = val;
        }
    });


    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet('../identity/user/gordon/wallet');

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        const userName = 'gordon';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/connection-org2.yaml', 'utf8'));

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

        // use gym plan
        console.log('Submit gym plan use_plan transaction.');

        // const usageResponse = await contract.submitTransaction('use_plan', 'UniversalHealth', '00001', 'GloboGym', 'Gordon', '2', '1', '1', '1');

        const usageResponse = await contract.submitTransaction('use_plan', planOwner, planNumber, planSubscriber, planMember, trainerSessions, numClasses, gymAccess, poolAccess);
        // process response
        console.log('Process use plan transaction response.');

        let planUsage = GymPlanUsage.fromBuffer(usageResponse);

        console.log(`${planUsage.owner} gym plan : ${planUsage.planNumber} successfully used by ${planUsage.planMember}`);
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

    console.log('Use Plan program complete.');

}).catch((e) => {

    console.log('Use Plan program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
