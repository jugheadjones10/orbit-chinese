#!/bin/bash

##
## script name: make_auth_config.sh
## author: Luke F. Lawson
## license: MIT
## 
## This script creates a auth_config.json file
## at build time using environment variables.
##

## first delete any existing file

if [[ -f google-credentials.json ]] ; then rm google-credentials.json ; fi

## then build the file one line at a time:

echo "{" >> google-credentials.json
echo "  \"type\": \"service_account\"," >> google-credentials.json
echo "  \"project_id\": \"gvh-payment\"," >> google-credentials.json
echo "  \"private_key_id\": \"${PRIVATE_KEY_ID}\"," >> google-credentials.json
echo "  \"private_key\": \"${PRIVATE_KEY}\"," >> google-credentials.json
echo "  \"client_email\": \"gvh-library@gvh-payment.iam.gserviceaccount.com\"," >> google-credentials.json
echo "  \"client_id\": \"${CLIENT_ID}\"," >> google-credentials.json
echo "  \"auth_uri\": \"https://accounts.google.com/o/oauth2/auth\"," >> google-credentials.json
echo "  \"token_uri\": \"https://oauth2.googleapis.com/token\"," >> google-credentials.json
echo "  \"auth_provider_x509_cert_url\": \"https://www.googleapis.com/oauth2/v1/certs\"," >> google-credentials.json
echo "  \"client_x509_cert_url\": \"https://www.googleapis.com/robot/v1/metadata/x509/gvh-library%40gvh-payment.iam.gserviceaccount.com\"" >> google-credentials.json
echo "}" >> google-credentials.json
