echo --- Change directory
cd ~/fabric-samples/health-gym/organization/universalhealth

echo --- Set the environment variables to operate the peer CLI as the MagnetoCorp admin user ---
source universalhealth.sh

echo --- Save the package ID as an environment variable ---
export PACKAGE_ID=gp_0:b93ea926211374c195c297aa62866a8d15f51ce34c6be98c261169559926534d

echo --- Approve the chaincode definition ---
peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name gymplancontract -v 0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA
