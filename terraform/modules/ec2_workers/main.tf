# ─────────────────────────────────────────────────────────────────────────────
# ec2_workers module
#
# Creates:
#   1. Security Group for the 2 worker nodes
#   2. 2 worker EC2 instances in the default VPC
#
# Each worker on first boot:
#   - Installs containerd + kubelet + kubeadm
#   - Configures DockerHub credentials in containerd so K8s can pull images
#   - Runs kubeadm join to connect to YOUR master node
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_security_group" "worker" {
  name        = "${var.project}-worker-sg"
  description = "K8s worker nodes"
  vpc_id      = var.vpc_id

  # SSH — to log in and debug if needed
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Kubelet — master calls this port to schedule and manage pods
  ingress {
    description = "Kubelet API (master -> worker)"
    from_port   = 10250
    to_port     = 10250
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # NodePort — this is how users access the app in browser
  # http://WORKER_PUBLIC_IP:30080  →  frontend
  ingress {
    description = "NodePort services (app access)"
    from_port   = 30000
    to_port     = 32767
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Flannel VXLAN — pod-to-pod networking across nodes
  ingress {
    description = "Flannel overlay network"
    from_port   = 8472
    to_port     = 8472
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound — workers need internet to pull DockerHub images + apt packages
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project}-worker-sg" }
}

resource "aws_instance" "worker" {
  count = 2

  ami           = var.ami_id
  instance_type = var.instance_type

  # Spread across available subnets (different AZs for HA)
  subnet_id = var.subnet_ids[count.index % length(var.subnet_ids)]

  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.worker.id]
  associate_public_ip_address = true

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    tags        = { Name = "${var.project}-worker-${count.index + 1}-disk" }
  }

  user_data = templatefile("${path.module}/scripts/worker_init.sh", {
    master_private_ip  = var.master_private_ip
    cluster_token      = var.cluster_token
    cluster_ca_hash    = var.cluster_ca_hash
    dockerhub_username = var.dockerhub_username
    dockerhub_password = var.dockerhub_password
  })

  tags = {
    Name = "${var.project}-worker-${count.index + 1}"
    Role = "k8s-worker"
  }
}

# ── Variables ─────────────────────────────────────────────────────────────────
variable "project"            {}
variable "ami_id"             {}
variable "key_name"           {}
variable "instance_type"      { default = "t3.small" }
variable "subnet_ids"         { type = list(string) }
variable "vpc_id"             {}
variable "master_private_ip"  {}
variable "cluster_token"      { sensitive = true }
variable "cluster_ca_hash"    { sensitive = true }
variable "dockerhub_username" {}
variable "dockerhub_password" { sensitive = true }

# ── Outputs ───────────────────────────────────────────────────────────────────
output "worker_public_ips"  { value = aws_instance.worker[*].public_ip }
output "worker_private_ips" { value = aws_instance.worker[*].private_ip }
