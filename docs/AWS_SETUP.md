# AWS Setup Guide

This guide walks through setting up AWS infrastructure for a solo developer deploying a FastAPI + React application for the first time. All steps use the AWS CLI and Management Console.

---

## Prerequisites

Before starting, you need:

1. **An AWS account** — Sign up at [aws.amazon.com](https://aws.amazon.com). Use the free tier where possible.
2. **AWS CLI installed** — Download from [AWS CLI installation guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
3. **AWS CLI configured** — Run `aws configure` and enter your access key, secret key, default region (e.g., `us-east-1`), and output format (`json`).

Verify your CLI setup:

```bash
aws sts get-caller-identity
```

You should see your Account, UserId, and ARN.

---

## 1. Create an IAM User for Deployment

Using your root account for daily operations is risky. Create a dedicated deployment user with limited permissions.

### Step 1.1: Create the user

```bash
aws iam create-user --user-name deploy-user
```

### Step 1.2: Attach managed policies

Attach policies that grant full access to the services your app needs:

```bash
aws iam attach-user-policy --user-name deploy-user --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess
aws iam attach-user-policy --user-name deploy-user --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess
aws iam attach-user-policy --user-name deploy-user --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
aws iam attach-user-policy --user-name deploy-user --policy-arn arn:aws:iam::aws:policy/AmazonVPCFullAccess
```

### Step 1.3: Create access keys for CLI use

```bash
aws iam create-access-key --user-name deploy-user
```

**Save the `AccessKeyId` and `SecretAccessKey` output somewhere secure (a password manager). You cannot retrieve the secret key again.**

### Step 1.4: Switch to the new user (optional but recommended)

```bash
aws configure --profile deploy-user
```

Enter the access key and secret from the previous step. To use this profile going forward:

```bash
export AWS_PROFILE=deploy-user
aws sts get-caller-identity
```

---

## 2. Create an S3 Bucket for MLflow Artifacts

MLflow needs a place to store model files, datasets, and experiment artifacts.

### Step 2.1: Create the bucket

Replace `your-app-name` with something unique (S3 bucket names are globally unique):

```bash
aws s3 mb s3://your-app-name-mlflow-artifacts --region us-east-1
```

### Step 2.2: Block all public access

```bash
aws s3api put-public-access-block \
  --bucket your-app-name-mlflow-artifacts \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### Step 2.3: Verify the bucket exists

```bash
aws s3 ls
aws s3 ls s3://your-app-name-mlflow-artifacts
```

---

## 3. Create Security Groups

Security groups act as virtual firewalls. You need two: one for your EC2 instance and one for your RDS database.

### Step 3.1: Create the EC2 security group

```bash
aws ec2 create-security-group \
  --group-name ec2-sg \
  --description "Security group for EC2 instance" \
  --vpc-id $(aws ec2 describe-vpcs --query 'Vpcs[0].VpcId' --output text)
```

Save the `GroupId` from the output.

### Step 3.2: Add inbound rules to ec2-sg

Allow SSH (port 22), HTTP (port 80), and HTTPS (port 443):

```bash
aws ec2 authorize-security-group-ingress \
  --group-name ec2-sg \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name ec2-sg \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name ec2-sg \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

### Step 3.3: Create the RDS security group

```bash
aws ec2 create-security-group \
  --group-name rds-sg \
  --description "Security group for RDS PostgreSQL" \
  --vpc-id $(aws ec2 describe-vpcs --query 'Vpcs[0].VpcId' --output text)
```

Save the `GroupId` from the output.

### Step 3.4: Add inbound rule to rds-sg (from ec2-sg only)

This allows only your EC2 instance to talk to the database on port 5432:

```bash
aws ec2 authorize-security-group-ingress \
  --group-name rds-sg \
  --protocol tcp \
  --port 5432 \
  --source-group ec2-sg
```

### Step 3.5: Verify security groups

```bash
aws ec2 describe-security-groups --group-names ec2-sg rds-sg
```

---

## 4. Create an RDS PostgreSQL Instance

### Step 4.1: Create a DB subnet group

RDS requires a subnet group spanning at least two availability zones.

```bash
aws rds create-db-subnet-group \
  --db-subnet-group-name my-db-subnet-group \
  --db-subnet-group-description "Subnet group for RDS" \
  --subnet-ids '["subnet-xxxxx", "subnet-yyyyy"]'
```

Find your subnet IDs with:

```bash
aws ec2 describe-subnets --query 'Subnets[*].SubnetId' --output table
```

### Step 4.2: Launch the RDS instance

```bash
aws rds create-db-instance \
  --db-instance-identifier my-postgres-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15 \
  --allocated-storage 20 \
  --storage-type gp2 \
  --master-username dbadmin \
  --master-user-password 'REPLACE_WITH_STRONG_PASSWORD' \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name my-db-subnet-group \
  --publicly-accessible \
  --no-multi-az \
  --backup-retention-period 7
```

Replace `sg-xxxxx` with the `GroupId` of `rds-sg` from Step 3.3.

**Important:** Use a strong password. Store it in your password manager.

### Step 4.3: Wait for the instance to become available

This takes 5 to 10 minutes:

```bash
aws rds describe-db-instances \
  --db-instance-identifier my-postgres-db \
  --query 'DBInstances[0].DBInstanceStatus'
```

Wait until it returns `available`.

### Step 4.4: Get the RDS endpoint

```bash
aws rds describe-db-instances \
  --db-instance-identifier my-postgres-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

Save this endpoint. You will need it to connect your backend.

---

## 5. Cost Estimates

These are rough monthly costs for the resources created in this guide. Prices vary by region.

| Service | Instance / Tier | Estimated Monthly Cost |
|---------|----------------|------------------------|
| RDS PostgreSQL | db.t3.micro, 20 GB | ~$13/month |
| EC2 (app server) | t3.medium | ~$30/month |
| S3 | Standard, first 50 GB | ~$1/month |
| Data transfer | Outbound | Varies by usage |

**Tips to save money:**

- Use the AWS Free Tier for the first 12 months (750 hours of t2/t3.micro EC2, 750 hours of db.t2/t3.micro RDS).
- Stop your EC2 instance when not in development.
- Use Reserved Instances or Savings Plans for long-term workloads.

---

## 6. CLI Verification Commands

Run these after setup to confirm everything is in place:

```bash
# Verify IAM user
aws iam get-user --user-name deploy-user

# Verify S3 bucket
aws s3 ls s3://your-app-name-mlflow-artifacts

# Verify security groups
aws ec2 describe-security-groups --group-names ec2-sg rds-sg

# Verify RDS instance
aws rds describe-db-instances --db-instance-identifier my-postgres-db

# Verify your identity
aws sts get-caller-identity
```

---

## Next Steps

Once this infrastructure is ready, move on to [RDS_SETUP.md](RDS_SETUP.md) to connect your backend, run migrations, and set up backups.
