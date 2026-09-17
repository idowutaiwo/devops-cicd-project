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
        stage('Deploy to EC2') {
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ec2-ssh-key',
                    keyFileVariable: 'SSH_KEY',
                    usernameVariable: 'SSH_USER'
                )]) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@16.170.225.42" "
                            aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin 602167898189.dkr.ecr.eu-north-1.amazonaws.com &&
                            docker pull 602167898189.dkr.ecr.eu-north-1.amazonaws.com/devops-cicd-app:$BUILD_NUMBER &&
                            docker rm -f devops-cicd-app 2>/dev/null || true &&
                            docker run -d --restart unless-stopped -p 80:3000 --name devops-cicd-app 602167898189.dkr.ecr.eu-north-1.amazonaws.com/devops-cicd-app:$BUILD_NUMBER
                        "
                    '''
                }
            }
        }
    }
}
