terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # No backend — state saved locally as terraform.tfstate
  # No S3, no DynamoDB required
}

provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

# ── Reuse the default VPC — every AWS account already has one ─────────────────
data "aws_vpc" "default" { default = true }

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ── Terraform creates ONLY the 2 worker EC2s ──────────────────────────────────
# You create the master manually and install Jenkins + Docker + kubeadm on it.
# After running kubeadm init on the master, run:
#   kubeadm token create --print-join-command
# Paste the token and ca-hash into terraform.tfvars, then run terraform apply.
# Workers will boot and automatically join your master.
module "k8s_workers" {
  source = "../../modules/ec2_workers"

  project            = var.project
  ami_id             = var.ami_id
  key_name           = var.key_name
  instance_type      = var.instance_type_worker
  subnet_ids         = data.aws_subnets.default.ids
  vpc_id             = data.aws_vpc.default.id
  master_private_ip  = var.master_private_ip
  cluster_token      = var.cluster_token
  cluster_ca_hash    = var.cluster_ca_hash
  dockerhub_username = var.dockerhub_username
  dockerhub_password = var.dockerhub_password
}

# ── Outputs ───────────────────────────────────────────────────────────────────
output "worker_public_ips" {
  description = "App is accessible at http://WORKER_IP:30080"
  value       = module.k8s_workers.worker_public_ips
}

output "worker_private_ips" {
  description = "Private IPs — used for internal cluster communication"
  value       = module.k8s_workers.worker_private_ips
}
