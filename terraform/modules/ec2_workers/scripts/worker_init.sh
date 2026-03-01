#!/bin/bash
# worker_init.sh — runs automatically on each worker EC2 on first boot
#
# What this does:
#   1. Installs containerd (container runtime)
#   2. Installs kubelet + kubeadm + kubectl
#   3. Configures DockerHub credentials in containerd
#      so Kubernetes can pull your private images without any extra login step
#   4. Runs kubeadm join to connect this worker to your master node
set -e
exec > /var/log/worker_init.log 2>&1
echo "=== Worker Init Started: $(date) ==="

# ── 1. System prep ────────────────────────────────────────────────────────────
apt-get update -y
apt-get install -y curl wget gnupg lsb-release ca-certificates \
                   apt-transport-https unzip

# Disable swap — K8s will refuse to start if swap is on
swapoff -a
sed -i '/swap/d' /etc/fstab

# Kernel modules required for K8s networking
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

# ── 2. Install containerd ─────────────────────────────────────────────────────
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | tee /etc/apt/sources.list.d/docker.list

apt-get update -y
apt-get install -y containerd.io

# Use systemd cgroup driver — required for K8s 1.22+
mkdir -p /etc/containerd
containerd config default | tee /etc/containerd/config.toml
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
systemctl restart containerd
systemctl enable containerd

# ── 3. Configure DockerHub credentials in containerd ─────────────────────────
# This is how Kubernetes pulls your private DockerHub images.
# We add auth directly to containerd config so every pod can pull
# yourdockerhubusername/foodapp-backend and yourdockerhubusername/foodapp-frontend
# without needing imagePullSecrets in every deployment manifest.
DOCKERHUB_USER="${dockerhub_username}"
DOCKERHUB_PASS="${dockerhub_password}"
DOCKERHUB_AUTH=$(echo -n "$DOCKERHUB_USER:$DOCKERHUB_PASS" | base64)

# Write docker config.json with DockerHub credentials
mkdir -p /root/.docker
cat <<DOCKEREOF > /root/.docker/config.json
{
  "auths": {
    "https://index.docker.io/v1/": {
      "auth": "$DOCKERHUB_AUTH"
    }
  }
}
DOCKEREOF

# Tell containerd to use this config.json for pulling images
# This patches the [plugins."io.containerd.grpc.v1.cri".registry] section
cat <<CTREOF >> /etc/containerd/config.toml

# DockerHub credentials — allows kubelet to pull private images
[plugins."io.containerd.grpc.v1.cri".registry.configs."registry-1.docker.io".auth]
  username = "$DOCKERHUB_USER"
  password = "$DOCKERHUB_PASS"
CTREOF

systemctl restart containerd

# ── 4. Install kubeadm, kubelet, kubectl ──────────────────────────────────────
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key \
  | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] \
  https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /" \
  | tee /etc/apt/sources.list.d/kubernetes.list

apt-get update -y
apt-get install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl
systemctl enable kubelet

# ── 5. Join the Kubernetes cluster ────────────────────────────────────────────
# These values are injected by Terraform from your terraform.tfvars
MASTER_IP="${master_private_ip}"
TOKEN="${cluster_token}"
CA_HASH="${cluster_ca_hash}"

echo "Joining master at $MASTER_IP ..."

# Retry 5 times — master API may take a moment to be ready
for i in 1 2 3 4 5; do
  kubeadm join "$MASTER_IP:6443" \
    --token "$TOKEN" \
    --discovery-token-ca-cert-hash "$CA_HASH" && break
  echo "Attempt $i failed, retrying in 20s..."
  sleep 20
done

echo "=== Worker Init Done: $(date) ==="
