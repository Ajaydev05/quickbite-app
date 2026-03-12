# terraform/environments/prod/main.tf

provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

module "k8s_workers" {
  source = "../../modules/ec2_workers"

  project            = "quickbite"
  ami_id             = var.ami_id
  key_name           = var.key_name
  instance_type      = var.instance_type_worker
  worker_count       = var.worker_count
  master_private_ip  = var.master_private_ip
  cluster_token      = var.cluster_token
  cluster_ca_hash    = var.cluster_ca_hash
  dockerhub_username = var.dockerhub_username
  dockerhub_password = var.dockerhub_password
}

output "worker_public_ips" {
  value = module.k8s_workers.worker_public_ips
}

output "worker_private_ips" {
  value = module.k8s_workers.worker_private_ips
}
