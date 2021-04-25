echo --- Change directory
cd ~/fabric-samples/health-gym/organization/globogym

echo --- Create the chaincode package ---
peer lifecycle chaincode package gp.tar.gz --lang node --path ./contract --label gp_0

echo --- Set the environment variables to operate the peer CLI as the Globogym admin user ---
source globogym.sh

echo --- Install the chaincode on the Globogym peer
peer lifecycle chaincode install gp.tar.gz

echo --- Save the package ID as an environment variable ---
export PACKAGE_ID=gp_0:bc128080c1af103cb2f8d8955553c43d97cc68d8d5a49de92ad56d4ad0302f22

echo --- Approve the chaincode definition ---
peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name gymplancontract -v 0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA

echo --- Commit the chaincode definition of gymplancontract to mychannel
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --peerAddresses localhost:7051 --tlsRootCertFiles ${PEER0_ORG1_CA} --peerAddresses localhost:9051 --tlsRootCertFiles ${PEER0_ORG2_CA} --channelID mychannel --name gymplancontract -v 0 --sequence 1 --tls --cafile $ORDERER_CA --waitForEvent

