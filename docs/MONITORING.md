# Monitoring and Observability

This document describes the monitoring setup for the Academic Performance Prediction system, including structured logging, system metrics, and CloudWatch integration.

## Overview

The application uses structured JSON logging for all requests and system events. Logs are streamed to AWS CloudWatch for centralized monitoring and alerting.

## Structured Logging

### Log Format

All application logs in production are emitted as JSON with the following fields:

| Field | Description |
|-------|-------------|
| `timestamp` | ISO 8601 timestamp |
| `level` | Log level (INFO, WARNING, ERROR) |
| `logger` | Logger name |
| `environment` | Deployment environment (local, staging, production) |
| `request_id` | Unique UUID for each HTTP request |
| `endpoint` | HTTP method and path (e.g., `GET /api/predictions`) |
| `response_time` | Request duration in seconds |
| `user_id` | Authenticated user ID (null for unauthenticated requests) |
| `status_code` | HTTP response status code |
| `message` | Log message |

### Log Levels

| Level | Trigger |
|-------|---------|
| **INFO** | Normal request completion (response time <= 1s) |
| **WARNING** | Slow response (response time > 1s) |
| **ERROR** | Unhandled exception or 5xx response |

### Sensitive Data Redaction

The logging system automatically redacts values for keys containing:
- `password`
- `token`
- `jwt`
- `secret`
- `authorization`

Full SHAP arrays, JWT tokens, and passwords are never logged.

## Health Endpoint Metrics

The `/health` endpoint returns real-time system metrics:

```json
{
  "status": "ok",
  "db": "ok",
  "models": "ok",
  "memory_mb": 256,
  "cpu_percent": 12.5,
  "memory_percent": 45.2,
  "disk_percent": 67.8
}
```

| Metric | Source | Description |
|--------|--------|-------------|
| `cpu_percent` | psutil | CPU utilization percentage |
| `memory_percent` | psutil | System memory utilization percentage |
| `disk_percent` | psutil | Root disk utilization percentage |
| `memory_mb` | psutil | Application RSS memory in MB |

## CloudWatch Integration

### Agent Configuration

The CloudWatch agent configuration is located at `scripts/cloudwatch-agent-config.json`. It defines:

- **Log Groups**:
  - `/academic-prediction/app` - Application logs
  - `/academic-prediction/error` - Error logs

- **Metrics Namespace**: `AcademicPrediction`

- **Collected Metrics**:
  - CPU usage (idle, iowait, user, system)
  - Disk usage (used_percent, inodes_free)
  - Disk I/O (io_time, read/write bytes)
  - Memory (used_percent, available_percent, cached, buffered)
  - Network (tcp_established, tcp_time_wait)
  - Swap (used_percent)
  - Processes (running, sleeping, dead, zombies)

### Setup

Run the setup script on the EC2 instance:

```bash
chmod +x scripts/setup_cloudwatch.sh
./scripts/setup_cloudwatch.sh
```

This script will:
1. Create the log directory `/var/log/academic-prediction`
2. Install the CloudWatch agent (if not present)
3. Copy the agent configuration
4. Start the agent

### Verification

Check the agent status:
```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a status
```

View logs in CloudWatch:
```bash
aws logs tail /academic-prediction/app --follow
```

## CloudWatch Alarms

### Health Check Failure Alarm

Create an alarm for health check failures lasting more than 5 minutes:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name academic-prediction-health-check-failure \
  --alarm-description "Health check non-200 for > 5 minutes" \
  --namespace AcademicPrediction \
  --metric-name HealthCheckStatus \
  --statistic Average \
  --period 60 \
  --evaluation-periods 5 \
  --threshold 1 \
  --comparison-operator LessThanThreshold \
  --alarm-actions arn:aws:sns:REGION:ACCOUNT_ID:alarm-topic
```

### High CPU Alarm

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name academic-prediction-high-cpu \
  --alarm-description "CPU > 80% for 5 minutes" \
  --namespace AcademicPrediction \
  --metric-name cpu_usage_user \
  --statistic Average \
  --period 60 \
  --evaluation-periods 5 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:REGION:ACCOUNT_ID:alarm-topic
```

## Local Development

In local development, logs are output as plain text for readability:

```
2024-01-15 10:30:00 - app.middleware - INFO - Request completed
```

JSON formatting is enabled automatically when `ENVIRONMENT` is set to `production` or `staging`.

## Troubleshooting

### Logs not appearing in CloudWatch

1. Verify the agent is running:
   ```bash
   sudo systemctl status amazon-cloudwatch-agent
   ```

2. Check agent logs:
   ```bash
   sudo tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log
   ```

3. Ensure the IAM role has the `CloudWatchAgentServerPolicy` attached

4. Verify log files exist and are readable:
   ```bash
   ls -la /var/log/academic-prediction/
   ```

### High memory usage alerts

If `memory_percent` consistently exceeds 80%:
1. Check for memory leaks in application logs
2. Review model loading patterns (models may be loaded multiple times)
3. Consider upgrading the EC2 instance type
