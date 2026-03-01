variable "aws_region" {
  description = "AWS region"
  default     = "ap-south-1"
}

variable "project" {
  description = "Project name — used as prefix on resource names"
  default     = "foodapp"
}

variable "aws_access_key" {
  description = "AWS Access Key ID"
  sensitive   = true
}

variable "aws_secret_key" {
  description = "AWS Secret Access Key"
  sensitive   = true
}

variable "ami_id" {
  description = "Ubuntu 22.04 LTS AMI — ap-south-1"
  default     = "ami-0f58b397bc5c1f2e8"
}

variable "key_name" {
  description = "EC2 Key Pair name — must already exist in your AWS account"
}

variable "instance_type_worker" {
  description = "Worker node instance type"
  default     = "t3.small"
}

# ── After you run 'kubeadm init' on the master, fill these 3 values ──────────
# Run this on your master:  kubeadm token create --print-join-command
# It prints something like:
#   kubeadm join 172.31.x.x:6443 --token abc.xyz --discovery-token-ca-cert-hash sha256:...

variable "master_private_ip" {
  description = "Private IP of your master EC2 (from AWS console)"
}

variable "cluster_token" {
  description = "Token from: kubeadm token create --print-join-command"
  sensitive   = true
}

variable "cluster_ca_hash" {
  description = "CA hash from join command — the sha256:... value"
  sensitive   = true
}

# ── DockerHub — images are pushed here by Jenkins and pulled here by K8s ──────
variable "dockerhub_username" {
  description = "Your DockerHub username"
}

variable "dockerhub_password" {
  description = "Your DockerHub password or access token"
  sensitive   = true
}
