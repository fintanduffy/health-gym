echo --- Set the environment variables to operate the peer CLI as the MagnetoCorp admin user ---
source universalhealth.sh

echo --- Save the package ID as an environment variable ---
export PACKAGE_ID=cp_0:9fee8086b3e12c6acc4dde2db2ce54f7bd09d264955874074947936d8a891126

echo --- Approve the chaincode definition ---
peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name gymplancontract -v 0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA
