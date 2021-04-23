/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access PlanNet network
 * 4. Construct request to issue gym plan
 * 5. Submit transaction
 * 6. Process response
 */

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

    process.argv.forEach(function (val, index, array) {
        console.log(index + ': ' + val);

        if(index == 2 ){
            planOwner = val; 
        }

        if(index == 3 ){
            planNumber = val; 
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

        //const issueResponse = await contract.submitTransaction('issue', 'UniversalHealth', '00001', '2020-05-31', '2020-11-30', '2', '1', '1', '1');
        const issueResponse = await contract.submitTransaction('issue', planOwner, planNumber, issueDate, activeDate, expiryDate, subscriberCount, '2', '1', '1', '1');

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
