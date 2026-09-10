pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

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
    }
}
