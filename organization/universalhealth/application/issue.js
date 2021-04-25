/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access GymPlanNet network
 * 4. Construct request to issue gym plan
 * 5. Submit transaction
 * 6. Process response
 */

//  sample call: $ node issue.js UniversalHealth 00002 2021-03-01 2021-04-01 2022-04-01 0 100000 2 52 1 1

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const moment = require('moment');
const { Wallets, Gateway } = require('fabric-network');
const GymPlan = require('../contract/lib/gymplan.js');

// Main program function
async function main() {

    //  Default values is no params are passed
    var planOwner = 'UniversalHealth';
    var planNumber = '00001'
    var date = new Date();
    var issueDate = moment(date).format('YYYY-MM-DD');
    var activeDate = new Date(date.setMonth(date.getMonth()+1));
    activeDate = moment(activeDate).format('YYYY-MM-DD');
    var expiryDate = new Date(date.setMonth(date.getMonth()+13));
    expiryDate = moment(expiryDate).format('YYYY-MM-DD');
    var subscriberCount = 0;
    var totalAwards = 0;  //  zero by default as this should be set by whoever is creating the plan
    var trainerSessions = 0;
    var numClasses = 0;
    var gymAccess = 0;
    var poolAccess = 0;

    //  Note: should include date validation or not allow passing the dates as parameters
    //  Including it here for testing purposes

    process.argv.forEach(function (val, index, array) {
        console.log(index + ': ' + val);

        if(index == 2 ){
            planOwner = val; 
        }

        if(index == 3 ){
            planNumber = val; 
        }
        
        if(index == 4 ){
            issueDate = val;
        }

        if(index == 5 ){
            activeDate = val;
        }

        if(index == 6 ){
            expiryDate = val;
        }

        if(index == 7 ){
            subscriberCount = val;
        }

        if(index == 8 ){
            totalAwards = val;
        }

	if(index == 9 ){
            trainerSessions = val;
        }

        if(index == 10 ){
            numClasses = val;
        }

        if(index == 11 ){
            gymAccess = val;
        }

        if(index == 12 ){
            poolAccess = val;
        }
    });

    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet('../identity/user/kate/wallet');

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        const userName = 'kate';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/connection-org2.yaml', 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled:true, asLocalhost: true }
        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access GymPlanNet network
        console.log('Use network channel: mychannel.');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to gym plan contract
        console.log('Use org.gymplannet.gymplan smart contract.');

        const contract = await network.getContract('gymplancontract');

        // issue gym plan
        console.log('Submit gym plan issue transaction.');

        const issueResponse = await contract.submitTransaction('issue', planOwner, planNumber, issueDate, activeDate, expiryDate, subscriberCount, totalAwards, trainerSessions, numClasses, gymAccess, poolAccess);

        // process response
        console.log('Process issue transaction response.' + issueResponse);

        let plan = GymPlan.fromBuffer(issueResponse);

        console.log(`${plan.owner} gym plan : ${plan.planNumber} successfully issued.`);
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

    console.log('Issue program complete.');

}).catch((e) => {

    console.log('Issue program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
