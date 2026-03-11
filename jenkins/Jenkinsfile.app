// jenkins/Jenkinsfile.app
// Builds Docker images, pushes to DockerHub, deploys to Kubernetes

pipeline {
  agent any

  environment {
    IMAGE_TAG      = "${GIT_COMMIT[0..7]}"
    BACKEND_IMAGE  = "ajaydev05/foodapp-backend"
    FRONTEND_IMAGE = "ajaydev05/foodapp-frontend"
    KUBECONFIG     = '/var/lib/jenkins/.kube/config'
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
        echo "Building commit: ${IMAGE_TAG} on branch: ${GIT_BRANCH}"
      }
    }

    stage('Run Tests') {
      parallel {
        stage('Backend Tests') {
          steps {
            dir('backend') {
              sh 'npm ci'
              sh 'npm test'
            }
          }
        }
        stage('Frontend Tests') {
          steps {
            dir('frontend') {
              sh 'npm ci'
              sh 'npm test -- --watchAll=false'
            }
          }
        }
      }
    }

    stage('DockerHub Login') {
      steps {
        withCredentials([
          usernamePassword(credentialsId: 'dockerhub_username',
                           usernameVariable: 'DH_USER',
                           passwordVariable: 'DH_PASS')
        ]) {
          sh 'echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin'
        }
      }
    }

    stage('Build Docker Images') {
      parallel {
        stage('Build Backend') {
          steps {
            dir('backend') {
              sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ."
            }
          }
        }
        stage('Build Frontend') {
          steps {
            dir('frontend') {
              sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ."
            }
          }
        }
      }
    }

    stage('Push to DockerHub') {
      steps {
        sh """
          docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
          docker push ${BACKEND_IMAGE}:latest
          docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
          docker push ${FRONTEND_IMAGE}:latest
        """
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        withCredentials([
          usernamePassword(credentialsId: 'dockerhub_username',
                           usernameVariable: 'DH_USER',
                           passwordVariable: 'DH_PASS')
        ]) {
          sh """
            # 1. Apply StorageClass + PV + PVC first (MongoDB needs this)
            kubectl apply -f k8s/base/storage.yaml

            # 2. Apply Services, ConfigMap, Secrets
            kubectl apply -f k8s/base/service.yaml

            # 3. Replace image placeholders with real DockerHub image names
            sed -i 's|DOCKERHUB_USER|\$DH_USER|g' k8s/base/deployment.yaml
            sed -i 's|IMAGE_TAG|${IMAGE_TAG}|g'    k8s/base/deployment.yaml
            kubectl apply -f k8s/base/deployment.yaml

            # 4. Apply autoscaling
            kubectl apply -f k8s/base/hpa.yaml

            # 5. Wait for rollouts to complete
            kubectl rollout status statefulset/mongodb --timeout=180s
            kubectl rollout status deployment/backend  --timeout=120s
            kubectl rollout status deployment/frontend --timeout=120s
          """
        }
      }
    }

    stage('Smoke Test') {
      steps {
        sh '''
          WORKER_IP=$(kubectl get nodes -o jsonpath="{.items[1].status.addresses[0].address}")
          echo "Testing http://${WORKER_IP}:30080"
          curl -f --retry 5 --retry-delay 5 http://${WORKER_IP}:30080 || exit 1
          echo "Smoke test passed"
        '''
      }
    }

  }

  post {
    success {
      echo "Deployment ${IMAGE_TAG} succeeded"
    }
    failure {
      node('') {
        sh '''
          kubectl rollout undo deployment/backend  || true
          kubectl rollout undo deployment/frontend || true
        '''
      }
    }
    always {
      script {
        if (env.BACKEND_IMAGE && env.IMAGE_TAG) {
          sh """
            docker rmi ${BACKEND_IMAGE}:${IMAGE_TAG}  || true
            docker rmi ${FRONTEND_IMAGE}:${IMAGE_TAG} || true
          """
        }
      }
    }
  }
}
