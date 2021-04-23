echo --- Set the environment variables to operate the peer CLI as the MagnetoCorp admin user ---
source universalhealth.sh

echo --- Save the package ID as an environment variable ---
export PACKAGE_ID=gp_0:4090945201c9f2d34b69967be5c73838258bbcef783c366beddcb61ea66ba3e4

echo --- Approve the chaincode definition ---
peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name gymplancontract -v 0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA
