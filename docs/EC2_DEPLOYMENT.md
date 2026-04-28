# EC2 Deployment Guide

This guide walks through launching an EC2 instance, setting it up for Docker-based deployment, and deploying the Multimodal Academic Performance Prediction System for production.

---

## Prerequisites

Before starting, complete the steps in [AWS_SETUP.md](AWS_SETUP.md):

- IAM user (`deploy-user`) with EC2, RDS, and S3 access
- S3 bucket for MLflow artifacts
- Security groups (`ec2-sg`, `rds-sg`)
- RDS PostgreSQL instance running and accessible
- AWS CLI configured locally

You also need:

- Your EC2 key pair `.pem` file downloaded and permissions set (`chmod 400`)
- The RDS endpoint and master password from [RDS_SETUP.md](RDS_SETUP.md)
- A generated JWT secret (use `scripts/generate_secrets.py`)

---

## 1. Launch the EC2 Instance

### 1.1 Create the instance

```bash
aws ec2 run-instances \
  --image-id ami-0c7217cdde317cfec \
  --instance-type t3.medium \
  --key-name your-key-pair-name \
  --security-group-ids $(aws ec2 describe-security-groups --group-names ec2-sg --query 'SecurityGroups[0].GroupId' --output text) \
  --iam-instance-profile Name=ec2-s3-access-role \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":20,"VolumeType":"gp3"}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=academic-prediction-app}]' \
  --count 1
```

**Important instance specifications:**

| Setting | Value | Reason |
|---------|-------|--------|
| AMI | `ami-0c7217cdde317cfec` | Ubuntu 22.04 LTS (us-east-1) |
| Instance type | `t3.medium` | 2 vCPU, 4 GB RAM — minimum for DistilBERT |
| Storage | 20 GB gp3 | Fast, cost-effective SSD |
| Security group | `ec2-sg` | Allows SSH (22), HTTP (80), HTTPS (443) |
| IAM role | `ec2-s3-access-role` | Grants S3 access for MLflow artifacts |

> **Warning: Do NOT use `t3.small` or `t3.micro`.** The DistilBERT model and ML workloads will cause Out-Of-Memory (OOM) kills on instances with less than 4 GB RAM. Always use `t3.medium` or larger for production.

Save the `InstanceId` from the output.

### 1.2 Wait for the instance to reach `running` state

```bash
aws ec2 describe-instances \
  --instance-ids i-xxxxxxxxxxxxxxxxx \
  --query 'Reservations[0].Instances[0].State.Name'
```

Wait until it returns `running`.

### 1.3 Get the public IP address

```bash
aws ec2 describe-instances \
  --instance-ids i-xxxxxxxxxxxxxxxxx \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text
```

Save this IP. You will use it to SSH into the instance.

---

## 2. Allocate and Associate an Elastic IP

An Elastic IP gives your instance a static public IP address that persists across reboots.

### 2.1 Allocate an Elastic IP

```bash
aws ec2 allocate-address --domain vpc
```

Save the `AllocationId` from the output.

### 2.2 Associate the Elastic IP with your instance

```bash
aws ec2 associate-address \
  --instance-id i-xxxxxxxxxxxxxxxxx \
  --allocation-id eipalloc-xxxxxxxxxxxxxxxxx
```

### 2.3 Verify the Elastic IP

```bash
aws ec2 describe-addresses \
  --filters Name=instance-id,Values=i-xxxxxxxxxxxxxxxxx
```

---

## 3. Set Up the EC2 Instance

### 3.1 SSH into the instance

```bash
chmod 400 your-key-pair-name.pem
ssh -i your-key-pair-name.pem ubuntu@YOUR_ELASTIC_IP
```

### 3.2 Update system packages

```bash
sudo apt-get update && sudo apt-get upgrade -y
```

### 3.3 Install Docker

```bash
# Install Docker CE
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 3.4 Add ubuntu user to docker group

```bash
sudo usermod -aG docker ubuntu
newgrp docker
```

### 3.5 Verify Docker installation

```bash
docker --version
docker compose version
```

### 3.6 Install AWS CLI v2

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt-get install -y unzip
unzip awscliv2.zip
sudo ./aws/install
aws --version
rm -rf awscliv2.zip aws
```

### 3.7 Configure AWS CLI on the instance (optional)

If your IAM role does not provide sufficient access, configure the CLI with your deploy-user credentials:

```bash
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region name: `us-east-1`
- Default output format: `json`

---

## 4. Deploy the Application

### 4.1 Copy application files to EC2

**Option A: Clone from GitHub**

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git ~/app
cd ~/app
```

**Option B: SCP from local machine**

From your local machine:

```bash
scp -i your-key-pair-name.pem -r ./app ubuntu@YOUR_ELASTIC_IP:~/app
```

### 4.2 Copy the production Docker Compose file

Ensure `docker-compose.prod.yml` is in the project root on the EC2 instance. It should already be there if you cloned or copied the full repo.

### 4.3 Create the environment file

```bash
cd ~/app
nano .env
```

Paste the following, replacing placeholders with your actual values:

```bash
DATABASE_URL=postgresql+asyncpg://dbadmin:YOUR_RDS_PASSWORD@YOUR_RDS_ENDPOINT:5432/postgres
JWT_SECRET_KEY=YOUR_GENERATED_JWT_SECRET
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
MLFLOW_TRACKING_URI=https://your-mlflow-tracking-uri
ENVIRONMENT=production
```

**Do not hardcode real credentials in this file if you plan to commit it.** Add `.env` to `.gitignore`.

### 4.4 Build and start the containers

```bash
cd ~/app
docker compose -f docker-compose.prod.yml up --build -d
```

This command:
- Builds the backend Docker image
- Starts the container in detached mode
- Runs `alembic upgrade head` automatically (as defined in `docker-compose.prod.yml`)

### 4.5 Verify the deployment

```bash
# Check running containers
docker ps

# Check backend logs
docker logs app-backend-prod

# Check health endpoint
curl http://localhost:8000/health
```

You should see the backend container running and the health endpoint returning a 200 status.

---

## 5. Post-Deployment Steps

### 5.1 Verify backend is accessible externally

From your local machine:

```bash
curl http://YOUR_ELASTIC_IP:8000/health
```

If this fails, check that the EC2 security group `ec2-sg` allows inbound traffic on port 8000 (if testing directly) or port 80/443 (if using a reverse proxy).

### 5.2 Set up log rotation (optional but recommended)

```bash
sudo nano /etc/logrotate.d/docker-container-logs
```

Add:

```
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  missingok
  delaycompress
  copytruncate
}
```

### 5.3 Enable Docker auto-start on reboot

```bash
sudo systemctl enable docker
```

---

## 6. Rollback

If a deployment fails or introduces issues, roll back using one of these methods.

### 6.1 Database rollback (Alembic)

To revert the most recent database migration:

```bash
docker compose -f docker-compose.prod.yml exec backend alembic downgrade -1
```

To check the current migration version:

```bash
docker compose -f docker-compose.prod.yml exec backend alembic current
```

### 6.2 Container rollback (using Docker image tags)

If you tagged your previous Docker image before deploying:

```bash
# Stop current containers
docker compose -f docker-compose.prod.yml down

# Run the previous image version
docker run -d --name app-backend-prod \
  --env-file .env \
  -p 8000:8000 \
  your-dockerhub-username/app-backend:PREVIOUS_TAG
```

### 6.3 Full rollback script

For a more automated rollback, use the provided script:

```bash
./scripts/rollback.sh
```

See [scripts/rollback.sh](../scripts/rollback.sh) for details.

---

## 7. Useful Commands

| Task | Command |
|------|---------|
| View running containers | `docker ps` |
| View backend logs | `docker logs -f app-backend-prod` |
| Restart backend | `docker compose -f docker-compose.prod.yml restart backend` |
| Stop all services | `docker compose -f docker-compose.prod.yml down` |
| Rebuild and restart | `docker compose -f docker-compose.prod.yml up --build -d` |
| Enter backend container | `docker exec -it app-backend-prod /bin/sh` |
| Check disk usage | `df -h` |
| Check memory usage | `free -h` |

---

## 8. Troubleshooting

| Problem | Likely Cause | Fix |
|---------|--------------|-----|
| Cannot SSH | Wrong key permissions or security group | Ensure `.pem` is `chmod 400` and `ec2-sg` allows port 22 |
| Docker command not found | Docker not installed or user not in docker group | Re-run install steps and `newgrp docker` |
| `docker compose` fails | Plugin not installed | Install `docker-compose-plugin` |
| Backend container exits | Missing `.env` or wrong `DATABASE_URL` | Check `docker logs app-backend-prod` |
| Cannot reach RDS | Security group blocks port 5432 | Verify `rds-sg` allows inbound from `ec2-sg` |
| OOM kills | Instance too small | **Upgrade to `t3.medium` or larger** |
| Port 8000 refused | Container not running or crashed | Check `docker ps` and logs |

---

## Next Steps

- Set up a reverse proxy (nginx) and SSL certificate — see Task 31
- Configure CloudWatch monitoring for the EC2 instance
- Set up automated backups for the RDS database (see [RDS_SETUP.md](RDS_SETUP.md))
