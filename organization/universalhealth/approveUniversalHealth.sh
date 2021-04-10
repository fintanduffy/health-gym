echo --- Set the environment variables to operate the peer CLI as the MagnetoCorp admin user ---
source universalhealth.sh

echo --- Save the package ID as an environment variable ---
export PACKAGE_ID=cp_0:e0f7c6a64e9376b9058a1faafd64cdaa8317ad205d00d78274cbb4c359811b1b

echo --- Approve the chaincode definition ---
peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name gymplancontract -v 0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA
