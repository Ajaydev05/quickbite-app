#!/bin/bash
# master_setup.sh
#
# Run this MANUALLY on your master EC2 after installing Jenkins + Docker.
# This script:
#   1. Installs containerd + kubeadm + kubelet + kubectl
#   2. Runs kubeadm init to start the K8s control plane
#   3. Sets up kubectl for ubuntu and jenkins users
#   4. Installs Flannel for pod networking
#   5. Prints the join command — paste token and ca-hash into terraform.tfvars
#
# Usage:
#   chmod +x master_setup.sh
#   sudo bash master_setup.sh
set -e
exec > /var/log/master_setup.log 2>&1
echo "=== Master Setup Started: $(date) ==="

# Disable swap
swapoff -a
sed -i '/swap/d' /etc/fstab

# Kernel modules
cat <<EOF > /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
modprobe overlay
modprobe br_netfilter
cat <<EOF > /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
sysctl --system

# Install containerd
apt-get update -y
apt-get install -y curl gnupg lsb-release ca-certificates apt-transport-https
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | tee /etc/apt/sources.list.d/docker.list
apt-get update -y && apt-get install -y containerd.io
mkdir -p /etc/containerd
containerd config default | tee /etc/containerd/config.toml
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
systemctl restart containerd && systemctl enable containerd

# Install kubeadm, kubelet, kubectl
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key \
  | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] \
  https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /" \
  | tee /etc/apt/sources.list.d/kubernetes.list
apt-get update -y
apt-get install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl
systemctl enable kubelet

# Get this machine's private IP
MASTER_PRIVATE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)

# Initialise K8s master
kubeadm init \
  --pod-network-cidr=10.244.0.0/16 \
  --apiserver-advertise-address="$MASTER_PRIVATE_IP"

# kubectl access for ubuntu
mkdir -p /home/ubuntu/.kube
cp /etc/kubernetes/admin.conf /home/ubuntu/.kube/config
chown ubuntu:ubuntu /home/ubuntu/.kube/config

# kubectl access for jenkins (so pipeline can run kubectl commands)
mkdir -p /var/lib/jenkins/.kube
cp /etc/kubernetes/admin.conf /var/lib/jenkins/.kube/config
chown jenkins:jenkins /var/lib/jenkins/.kube/config

# Install Flannel CNI (pod networking between master and workers)
export KUBECONFIG=/etc/kubernetes/admin.conf
kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml

# Generate join command and extract values
JOIN_CMD=$(kubeadm token create --print-join-command)

TOKEN=$(echo "$JOIN_CMD"    | grep -oP '(?<=--token )\S+')
CA_HASH=$(echo "$JOIN_CMD"  | grep -oP '(?<=--discovery-token-ca-cert-hash )\S+')

echo ""
echo "============================================================"
echo "  PASTE THESE INTO terraform.tfvars THEN RUN terraform apply"
echo "============================================================"
echo ""
echo "master_private_ip = \"$MASTER_PRIVATE_IP\""
echo "cluster_token     = \"$TOKEN\""
echo "cluster_ca_hash   = \"$CA_HASH\""
echo ""
echo "=== Master Setup Done: $(date) ==="
