# modules/ec2_workers/main.tf

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_security_group" "worker" {
  name        = "${var.project}-worker-sg"
  description = "K8s worker node security group"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Kubelet API"
    from_port   = 10250
    to_port     = 10250
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "NodePort Services"
    from_port   = 30000
    to_port     = 32767
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Flannel VXLAN"
    from_port   = 8472
    to_port     = 8472
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Kubernetes API"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project}-worker-sg"
    Project = var.project
  }
}

resource "aws_instance" "worker" {
  count                  = var.worker_count
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = data.aws_subnets.default.ids[count.index % length(data.aws_subnets.default.ids)]
  vpc_security_group_ids = [aws_security_group.worker.id]

  root_block_device {
    volume_size = 8
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/scripts/worker_init.sh", {
    master_private_ip  = var.master_private_ip
    cluster_token      = var.cluster_token
    cluster_ca_hash    = var.cluster_ca_hash
    dockerhub_username = var.dockerhub_username
    dockerhub_password = var.dockerhub_password
  })

  tags = {
    Name    = "${var.project}-worker-${count.index + 1}"
    Project = var.project
  }
}
