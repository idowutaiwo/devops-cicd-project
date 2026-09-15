pipeline {
    agent any

    environment {
        AWS_REGION = 'eu-north-1'
        ECR_REPOSITORY = '602167898189.dkr.ecr.eu-north-1.amazonaws.com/devops-cicd-app'
    }

    stages {
        stage('Test') {
            steps {
                sh 'npm install'
                sh 'npm test'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t devops-cicd-app .'
            }
        }

        stage('Docker Test') {
            steps {
                sh '''
                    docker run -d -p 3001:3000 --name devops-cicd-test-${BUILD_NUMBER} devops-cicd-app
                    sleep 5
                    curl -f http://localhost:3001/health
                '''
            }

            post {
                always {
                    sh 'docker rm -f devops-cicd-test-${BUILD_NUMBER} 2>/dev/null || true'
                }
            }
        }

        stage('Push to ECR') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'aws-ecr-jenkins',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )]) {
                    sh '''
                        aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY
                        docker tag devops-cicd-app:latest $ECR_REPOSITORY:$BUILD_NUMBER
                        docker push $ECR_REPOSITORY:$BUILD_NUMBER
                    '''
                }
            }
        }
    }
}
