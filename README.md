# CA6001I Assignment2 GymPlanNet

Enure you have installed Hyperleger Fabric 2.2 as per the instructions provided in the course material.

Note that I have created the health-gym project directory within fabric-samples.

Clone the git repository:
>$ git clone https://github.com/fintanduffy/health-gym

Change directory to health-gym:
>$ cd health-gym

Start GymPlanNet network by running:
>$ ./network-starter.sh

Deploy and approve the smart contract chaincode on both peers:
>$ ./deployAll.sh


Open a new terminal window and go to the Universal Health application directory:
>$ cd ~/fabric-samples/health-gym/organization/universalhealth/application

Enroll the health insurance company admin user:
>$ node enrollUser.js

Issue the gym plan:
>$ node issue.js UniversalHealth 00002 2021-04-25 2021-04-26 2022-04-26 0 100000 2 52 1 1

Change to the globo gym application directory:
>$ cd ~/fabric-samples/health-gym/organization/globogym/application

Enroll the gym admin user:
>$ node enrollUser.js

Subscribe to the plan:
>$ node subscribe.js GloboGym 00002 UniversalHealth

Go back to the Universal Health application directory:
>$ cd ~/fabric-samples/health-gym/organization/universalhealth/application

Activate the plan:
>$ node activatePlan.js UniversalHealth 00002 

Enroll the health insurance member:
>$ node enrollMember.js

Use the plan:
>$ node usePlan.js UniversalHealth 00002 GloboGym Gordon 0 1 0 0

Expire plan:
>$ node expirePlan.js UniversalHealth 00002 

Retrieve plan usage:
>$ node queryUsage.js











