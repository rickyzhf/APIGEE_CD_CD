pipeline {
  agent any

  environment {
    AUTH_CODE = credentials('APIGEE_AUTH_BASIC') // Jenkins凭据ID
    ORG_NAME = 'your-apigee-org'                 // 替换为你的Apigee组织名
  }

  stages {
    stage('Install Zip and Newman (if needed)') {
      steps {
        sh '''
          which zip || (echo "Installing zip..." && apt-get update && apt-get install -y zip)
          which newman || (echo "Installing newman..." && npm install -g newman)
        '''
      }
    }

    stage('Build APIProxy Bundle') {
      steps {
        sh '''
          echo "Zipping apiproxy folder..."
          cd "$WORKSPACE"
          zip -r CI_CD_PROXY apiproxy/
        '''
      }
    }

    stage('Deploy APIProxy Bundle') {
      steps {
        sh '''
          echo "Deploying CI_CD_PROXY.zip to Apigee..."
          chmod +x ./deploy.sh
          ./deploy.sh
        '''
      }
    }

    stage('Perform Integration Tests') {
      steps {
        sh '''
          echo "Running Postman Integration Tests..."
          cd test
          newman run CI_CD.postman_collection.json
        '''
      }
    }
  }

  post {
    success {
      echo '✅ Build and deployment succeeded!'
    }
    failure {
      echo '❌ Build or deployment failed.'
    }
  }
}
