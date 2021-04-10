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
 * 4. Construct request to issue gym plan
 * 5. Submit transaction
 * 6. Process response
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');
const GymPlan = require('../contract/lib/gymplan.js');


// Main program function
async function main() {

  // A wallet stores a collection of identities for use
  const wallet = await Wallets.newFileSystemWallet('../identity/user/balaji/wallet');

  // A gateway defines the peers used to access Fabric networks
  const gateway = new Gateway();

  // Main try/catch block
  try {

    // Specify userName for network access
        // Specify userName for network access
        const userName = 'balaji';

    // Load connection profile; will be used to locate a gateway
    let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/connection-org1.yaml', 'utf8'));

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

    const contract = await network.getContract('gymplancontract', 'org.gymplannet.gymplan');

    // redeem gym plan
    console.log('Submit gym plan redeem transaction.');

    const redeemResponse = await contract.submitTransaction('redeem', 'UniversalHealth', '00001', 'GloboGym', 'Org2MSP', '2020-11-30');

    // process response
    console.log('Process redeem transaction response.');

    let plan = GymPlan.fromBuffer(redeemResponse);

    console.log(`${plan.issuer} gym plan : ${plan.planNumber} successfully redeemed with ${plan.owner}`);

    console.log('Transaction complete.');

  } catch (error) {

    console.log(`Error processing transaction. ${error}`);
    console.log(error.stack);

  } finally {

    // Disconnect from the gateway
    console.log('Disconnect from Fabric gateway.')
    gateway.disconnect();

  }
}
main().then(() => {

  console.log('Redeem program complete.');

}).catch((e) => {

  console.log('Redeem program exception.');
  console.log(e);
  console.log(e.stack);
  process.exit(-1);

});
