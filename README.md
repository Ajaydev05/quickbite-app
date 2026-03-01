# QuickBite — Food Delivery App

A production-grade food delivery application built with a full GitOps-driven DevOps pipeline.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Query, React Router v6 |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Containerization | Docker, Docker Compose |
| Orchestration | Kubernetes (self-managed on EC2) |
| CI/CD | Jenkins (infra + app pipelines) |
| Infrastructure | Terraform (VPC, EC2, ECR, IAM) |
| Cloud | AWS (EC2, ECR, S3, IAM) |

## Project Structure

```
foodapp/
├── backend/          # Node.js REST API
├── frontend/         # React SPA
├── terraform/        # AWS infrastructure as code
├── k8s/              # Kubernetes manifests
├── jenkins/          # Jenkinsfiles
├── scripts/          # Python automation
└── docker-compose.yml
```

## Quick Start (Local)

```bash
# Clone and run everything with Docker Compose
git clone https://github.com/Ajaydev05/quickbite
cd quickbite
docker-compose up --build
```

App: http://localhost:3000
API: http://localhost:5000

## Key Features

- JWT authentication with role-based access (customer, restaurant owner, admin)
- Restaurant browsing with cuisine/city/rating filters
- Full cart management with coupon support
- Real-time order status tracking
- Review & rating system
- HPA auto-scaling on Kubernetes
- Zero-downtime rolling deployments
- Automatic rollback on health check failure
- Slack notifications on every deployment

## DevOps Flow

1. Push code → GitHub webhook triggers Jenkins
2. **App changes:** tests → Docker build → ECR push → K8s deploy → health check → Slack notify
3. **Infra changes:** Terraform plan → manual approval gate → apply → EC2 provisioned

## Author

Ajaydev A | [GitHub](https://github.com/Ajaydev05) | [LinkedIn](https://linkedin.com/in/ajaydev-a-)
