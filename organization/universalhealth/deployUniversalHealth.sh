echo --- Create the chaincode package ---
peer lifecycle chaincode package cp.tar.gz --lang node --path ./contract --label cp_0

echo --- Set the environment variables to operate the peer CLI as the UniversalHealth admin user ---
source universalhealth.sh

echo --- Install the chaincode on the UniversalHealth peer
peer lifecycle chaincode install cp.tar.gz
