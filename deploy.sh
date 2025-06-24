#!/bin/bash

set -e

if [ -z "$AUTH_CODE" ] || [ -z "$ORG_NAME" ]; then
  echo "Missing required environment variables: AUTH_CODE and ORG_NAME"
  exit 1
fi

API_NAME="CI_CD_DEMO"
ZIP_FILE="CI_CD_PROXY.zip"

echo "Importing API Proxy to Apigee..."

response=$(curl --silent --write-out "HTTPSTATUS:%{http_code}" \
  -X POST \
  --header "Authorization: Basic ${AUTH_CODE}" \
  -F "file=@${ZIP_FILE}" \
  "https://api.enterprise.apigee.com/v1/organizations/${ORG_NAME}/apis?action=import&name=${API_NAME}")

echo "$response"
