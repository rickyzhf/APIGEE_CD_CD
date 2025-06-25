#!/bin/bash

# 变量，改成你的值
PROXY_NAME="test2"
ZIP_FILE="./my-api-proxy.zip"
ORG_NAME="molten-album-461308-b8"
ENV_NAME="dev1"       
ACCESS_TOKEN=$AUTH_CODE 
# ACCESS_TOKEN=$(gcloud auth print-access-token)

# 1. Import API Proxy zip 包（上传并创建revision）
echo "Importing API proxy..."
IMPORT_RESPONSE=$(curl --silent --write-out "HTTPSTATUS:%{http_code}" \
  -X POST \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -F "file=@${ZIP_FILE}" \
  "https://apigee.googleapis.com/v1/organizations/${ORG_NAME}/apis?action=import&name=${PROXY_NAME}")

HTTP_BODY=$(echo "$IMPORT_RESPONSE" | sed -e 's/HTTPSTATUS\:.*//g')
HTTP_STATUS=$(echo "$IMPORT_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_STATUS" -ne 200 ]; then
  echo "Import failed: status $HTTP_STATUS"
  echo "$HTTP_BODY"
  # exit 1
fi

# 从响应提取revision号
REVISION=$(echo "$HTTP_BODY" | grep -o '"revision":[0-9]*' | grep -o '[0-9]*')
echo "Imported revision: $REVISION"

# 2. 部署 revision 到指定环境
echo "Deploying revision $REVISION to environment $ENV_NAME..."
DEPLOY_RESPONSE=$(curl --silent --write-out "HTTPSTATUS:%{http_code}" \
  -X POST \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{}" \
  "https://apigee.googleapis.com/v1/organizations/${ORG_NAME}/environments/${ENV_NAME}/apis/${PROXY_NAME}/revisions/${REVISION}/deployments")

DEPLOY_BODY=$(echo "$DEPLOY_RESPONSE" | sed -e 's/HTTPSTATUS\:.*//g')
DEPLOY_STATUS=$(echo "$DEPLOY_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$DEPLOY_STATUS" -ne 200 ]; then
  echo "Deployment failed: status $DEPLOY_STATUS"
  echo "$DEPLOY_BODY"
  # exit 1
fi

echo "Successfully deployed revision $REVISION to $ENV_NAME"
