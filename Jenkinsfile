pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 1, unit: 'HOURS')
    }

    parameters {
        string(name: 'GIT_BRANCH', defaultValue: 'main', description: 'Git branch to build')
        choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'production'], description: 'Deployment environment')
        booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip tests during build')
    }

    environment {
        DOCKER_REGISTRY = "${env.DOCKER_REGISTRY ?: 'docker.io'}"
        APP_NAME = 'rentalcar'
        DOCKER_HUB_REPO = 'moamina'
        BACKEND_IMAGE = "${DOCKER_HUB_REPO}/${APP_NAME}-backend"
        FRONTEND_IMAGE = "${DOCKER_HUB_REPO}/${APP_NAME}-frontend"
        BUILD_TAG = "${BUILD_NUMBER}-${env.BUILD_TIMESTAMP}"
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        GIT_CREDENTIALS = 'credential-git'
        DOCKER_CREDENTIALS = 'docker-hub-credentials'
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "Checking out code from branch: ${params.GIT_BRANCH}"
                }
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${params.GIT_BRANCH}"]],
                    userRemoteConfigs: [[
                        url: 'https://github.com/ltmoamin/RentalCar.git',
                        credentialsId: "${GIT_CREDENTIALS}"
                    ]]
                ])
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    echo "========== Building Spring Boot Backend =========="
                    dir('backend') {
                        sh '''
                            echo "Building backend with Maven..."
                            chmod +x mvnw
                            if [ "$SKIP_TESTS" = "true" ]; then
                                ./mvnw clean package -DskipTests
                            else
                                ./mvnw clean package
                            fi
                        '''
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    echo "========== Building Angular Frontend =========="
                    dir('frontend') {
                        sh '''
                            echo "Installing dependencies..."
                            npm install
                            
                            echo "Building production bundle..."
                            npm run build
                        '''
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                expression { return params.ENVIRONMENT != 'production' }
            }
            steps {
                script {
                    echo "========== Running SonarQube Analysis =========="
                    dir('backend') {
                        sh '''
                            chmod +x mvnw
                            ./mvnw sonar:sonar \
                              -Dsonar.projectKey=rentalcar \
                              -Dsonar.sources=src/main/java \
                              -Dsonar.host.url=http://sonarqube:9000 \
                              -Dsonar.login=${SONARQUBE_TOKEN} || true
                        '''
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo "========== Building Docker Images =========="
                    
                    // Build backend image
                    sh '''
                        echo "Building backend Docker image..."
                        docker build \
                            -t ${BACKEND_IMAGE}:${BUILD_TAG} \
                            -t ${BACKEND_IMAGE}:${ENVIRONMENT}-latest \
                            -t ${BACKEND_IMAGE}:latest \
                            ./backend
                    '''
                    
                    // Build frontend image
                    sh '''
                        echo "Building frontend Docker image..."
                        docker build \
                            -t ${FRONTEND_IMAGE}:${BUILD_TAG} \
                            -t ${FRONTEND_IMAGE}:${ENVIRONMENT}-latest \
                            -t ${FRONTEND_IMAGE}:latest \
                            ./frontend
                    '''
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    echo "========== Pushing Docker Images to Registry =========="
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS}", usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh '''
                            echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin
                            
                            echo "Pushing backend image..."
                            docker push ${BACKEND_IMAGE}:${BUILD_TAG}
                            docker push ${BACKEND_IMAGE}:${ENVIRONMENT}-latest
                            
                            echo "Pushing frontend image..."
                            docker push ${FRONTEND_IMAGE}:${BUILD_TAG}
                            docker push ${FRONTEND_IMAGE}:${ENVIRONMENT}-latest
                            
                            docker logout
                        '''
                    }
                }
            }
        }

        stage('Deploy to Docker Compose') {
            steps {
                script {
                    echo "========== Deploying with Docker Compose =========="
                    sh '''
                        # Copy environment file
                        cp .env.example .env.${ENVIRONMENT}
                        
                        # Stop existing containers
                        docker-compose -f ${DOCKER_COMPOSE_FILE} down || true
                        
                        # Login to Docker Hub
                        echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin || true
                        
                        # Pull images
                        docker pull ${BACKEND_IMAGE}:${ENVIRONMENT}-latest || true
                        docker pull ${FRONTEND_IMAGE}:${ENVIRONMENT}-latest || true
                        
                        # Start services with environment file
                        docker-compose -f ${DOCKER_COMPOSE_FILE} --env-file .env.${ENVIRONMENT} up -d
                        
                        # Wait for services to be healthy
                        echo "Waiting for services to be healthy..."
                        sleep 30
                        
                        # Check service status
                        docker-compose -f ${DOCKER_COMPOSE_FILE} ps
                        
                        docker logout || true
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "========== Performing Health Checks =========="
                    sh '''
                        echo "Checking backend health..."
                        for i in {1..30}; do
                            if curl -f http://localhost:8082/actuator/health; then
                                echo "Backend is healthy"
                                break
                            fi
                            echo "Waiting for backend... ($i/30)"
                            sleep 2
                        done
                        
                        echo "Checking frontend health..."
                        for i in {1..20}; do
                            if curl -f http://localhost/health; then
                                echo "Frontend is healthy"
                                break
                            fi
                            echo "Waiting for frontend... ($i/20)"
                            sleep 2
                        done
                    '''
                }
            }
        }

        // stage('Run Integration Tests') {
        //     when {
        //         expression { return !params.SKIP_TESTS }
        //     }
        //     steps {
        //         script {
        //             echo "========== Running Integration Tests =========="
        //             sh '''
        //                 echo "Running backend API tests..."
        //                 curl -v http://localhost:8082/api/health || true
                        
        //                 echo "Running frontend tests..."
        //                 curl -v http://localhost/ || true
        //             '''
        //         }
        //     }
        // }

        stage('Generate Reports') {
            steps {
                script {
                    echo "========== Generating Build Reports =========="
                    sh '''
                        # Generate Docker image reports
                        echo "Docker Images Report:" > build-report.txt
                        docker images | grep rentalcar >> build-report.txt
                        
                        # Generate container logs
                        echo -e "\n\nContainer Logs:" >> build-report.txt
                        docker-compose logs >> build-report.txt
                    '''
                    archiveArtifacts artifacts: 'build-report.txt', allowEmptyArchive: true
                }
            }
        }
    }

    post {
        always {
            script {
                echo "========== Build Complete =========="
                echo "Workspace files preserved for debugging"
                // DO NOT USE cleanWs() - we need the files for deployment!
            }
        }

        success {
            script {
                echo "========== Build Successful =========="
                // Send success notification
                sh '''
                    echo "Deployment successful for ${ENVIRONMENT} environment"
                    echo "Build Tag: ${BUILD_TAG}"
                    echo "Timestamp: $(date)"
                '''
            }
        }

        failure {
            script {
                echo "========== Build Failed =========="
                // Rollback on failure
                sh '''
                    echo "Deployment failed. Rolling back..."
                    if command -v docker-compose &> /dev/null; then
                        docker-compose -f ${DOCKER_COMPOSE_FILE} down || true
                    else
                        echo "docker-compose not found, skipping rollback"
                    fi
                '''
            }
        }

        unstable {
            script {
                echo "========== Build Unstable =========="
            }
        }
    }
}
