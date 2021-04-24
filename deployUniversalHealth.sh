echo --- Change directory
cd ~/fabric-samples/health-gym/organization/universalhealth

echo --- Create the chaincode package ---
peer lifecycle chaincode package gp.tar.gz --lang node --path ./contract --label gp_0

echo --- Set the environment variables to operate the peer CLI as the UniversalHealth admin user ---
source universalhealth.sh

echo --- Install the chaincode on the UniversalHealth peer
peer lifecycle chaincode install gp.tar.gz
