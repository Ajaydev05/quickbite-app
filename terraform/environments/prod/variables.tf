# modules/ec2_workers/variables.tf

variable "project" {
  description = "Project name prefix"
  type        = string
  default     = "quickbite"
}

variable "ami_id" {
  description = "Ubuntu 22.04 AMI ID for ap-south-1"
  type        = string
}

variable "key_name" {
  description = "EC2 Key Pair name"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"
}

variable "worker_count" {
  description = "Number of worker nodes"
  type        = number
  default     = 2
}

variable "master_private_ip" {
  description = "Private IP of the K8s master node"
  type        = string
  sensitive   = true
}

variable "cluster_token" {
  description = "kubeadm bootstrap token"
  type        = string
  sensitive   = true
}

variable "cluster_ca_hash" {
  description = "kubeadm CA certificate hash"
  type        = string
  sensitive   = true
}

variable "dockerhub_username" {
  description = "DockerHub username"
  type        = string
}

variable "dockerhub_password" {
  description = "DockerHub password"
  type        = string
  sensitive   = true
}
