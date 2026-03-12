# terraform/environments/prod/variables.tf

# ── AWS Credentials ──────────────────────────────────────────
variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-south-1"
}

variable "aws_access_key" {
  description = "AWS Access Key ID"
  type        = string
  sensitive   = true
}

variable "aws_secret_key" {
  description = "AWS Secret Access Key"
  type        = string
  sensitive   = true
}

# ── EC2 Config ───────────────────────────────────────────────
variable "ami_id" {
  description = "Ubuntu 22.04 AMI ID for ap-south-1"
  type        = string
  default     = "ami-0f58b397bc5c1f2e8"   # Ubuntu 22.04 ap-south-1
}

variable "key_name" {
  description = "EC2 Key Pair name"
  type        = string
}

variable "instance_type_worker" {
  description = "EC2 instance type for worker nodes"
  type        = string
  default     = "t3.small"
}

variable "worker_count" {
  description = "Number of worker nodes to create"
  type        = number
  default     = 2
}

# ── Kubernetes Join Config ────────────────────────────────────
variable "master_private_ip" {
  description = "Private IP of the K8s master EC2"
  type        = string
  sensitive   = true
}

variable "cluster_token" {
  description = "kubeadm bootstrap token from master"
  type        = string
  sensitive   = true
}

variable "cluster_ca_hash" {
  description = "kubeadm CA cert hash from master (sha256:...)"
  type        = string
  sensitive   = true
}

# ── DockerHub ─────────────────────────────────────────────────
variable "dockerhub_username" {
  description = "DockerHub username"
  type        = string
}

variable "dockerhub_password" {
  description = "DockerHub password or access token"
  type        = string
  sensitive   = true
}
