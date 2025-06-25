pipeline {
  agent any
  environment {
    AUTH_CODE = credentials('APIGEE_AUTH_BASIC') 
    GCLOUD_PROJECT = 'molten-album-461308-b8'
    ORG_NAME = 'molten-album-461308-b8'    
    PROJECT_ID = 'molten-album-461308-b8'            
  }
  stages {
    stage('Install Zip (if needed)') {
      steps {
        sh '''
          which zip || (echo "Installing zip..." && apt-get update && apt-get install -y zip newman curl)
        '''
       }
    }
    stage('Install gcloud SDK') {
      steps {
        sh '''
          curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-497.0.0-linux-x86_64.tar.gz
          tar -xf google-cloud-cli-497.0.0-linux-x86_64.tar.gz
          ./google-cloud-sdk/install.sh --quiet
          export PATH="$PWD/google-cloud-sdk/bin:$PATH"
          gcloud version
        '''
      }
    }
    stage('Install Node.js and apigeelint') {
        steps {

            sh '''
            npm install -g apigeelint
            apigeelint --version
            '''
        }
    }
    stage('Authenticate to GCP') {
      steps {
        withCredentials([file(credentialsId: 'GOOGLE_APPLICATION_CREDENTIALS', variable: 'SA_KEY')]) {
          sh '''
            export PATH="$PWD/google-cloud-sdk/bin:$PATH"
            echo "$AUTH_CODE"
            echo "Using secret file at $SA_KEY"
            echo "$AUTH_CODE" > sa-key.json
            ls -lsr
            gcloud auth activate-service-account --key-file=$SA_KEY
            gcloud config set project $PROJECT_ID
            ACCESS_TOKEN=$(gcloud auth print-access-token)
            echo $ACCESS_TOKEN > access.token
          '''
        }
      }
    }
    stage('Static Analysis') {
    
      steps {
          // send build started notifications
       //slackSend (color: '#FFFF00', message: "STARTED Static Analysis: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
        sh '''#!/bin/bash
        export PATH=/root/.nvm/versions/node/v18.19.0/bin/:$PATH
        apigeelint -s /var/jenkins_home/workspace/test3/apiproxy/ -f table.js
        '''
      }
    }
    stage('Build APIProxy Bundle') {
    
      steps {
          // send build started notifications
       //slackSend (color: '#FFFF00', message: "STARTED Build to create API PROXY Bundle: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
        sh '''#!/bin/bash
        export PATH="$PWD/google-cloud-sdk/bin:$PATH"
        pwd
        cd $WORKSPACE
        pwd
        zip -r CI_CD_PROXY apiproxy/
        '''
      }
    }

    stage('Deploy APIProxy Bundle') {
    
      steps {
          // send build started notifications
      // slackSend (color: '#FFFF00', message: "STARTED Deploying API PROXY Bundle to TEST environment: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
        sh '''#!/bin/bash
        export PATH="$PWD/google-cloud-sdk/bin:$PATH"
        //cd /Users/sjana2/.jenkins/workspace/APIGEE_CI_CD_DEMO_master/
        //cd $WORKSPACE
        pwd
        chmod 777 upload-deploy.sh
        ./upload-deploy.sh
        '''
      }
    }

    stage('Perform Integration Tests') {
    
      steps {
          // send build started notifications
    //   slackSend (color: '#FFFF00', message: "Performing Integration tests: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
        sh '''#!/bin/bash
        export PATH="$PWD/google-cloud-sdk/bin:$PATH"
        cd test
        /root/.nvm/versions/node/v18.19.0/bin/newman run CI_CD.postman_collection.json
        '''
      }
    }
  }
  /* post {
    success {
      slackSend (color: '#00FF00', message: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
    }

    failure {
      slackSend (color: '#FF0000', message: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
    }
  } */
}
