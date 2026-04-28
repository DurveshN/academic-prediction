#!/bin/bash
set -e

LOG_DIR="/var/log/academic-prediction"
CONFIG_SOURCE="./scripts/cloudwatch-agent-config.json"
CONFIG_DEST="/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json"

echo "=== CloudWatch Agent Setup for Academic Prediction ==="

echo "Creating log directory at $LOG_DIR..."
sudo mkdir -p "$LOG_DIR"
sudo chmod 755 "$LOG_DIR"

echo "Checking CloudWatch Agent installation..."
if ! command -v amazon-cloudwatch-agent-ctl &> /dev/null; then
    echo "Installing CloudWatch Agent..."
    wget -q https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb -O /tmp/amazon-cloudwatch-agent.deb
    sudo dpkg -i /tmp/amazon-cloudwatch-agent.deb
    rm -f /tmp/amazon-cloudwatch-agent.deb
else
    echo "CloudWatch Agent already installed."
fi

echo "Copying CloudWatch agent configuration..."
if [ -f "$CONFIG_SOURCE" ]; then
    sudo cp "$CONFIG_SOURCE" "$CONFIG_DEST"
    sudo chmod 644 "$CONFIG_DEST"
else
    echo "ERROR: Configuration file not found at $CONFIG_SOURCE"
    exit 1
fi

echo "Creating log files with proper permissions..."
sudo touch "$LOG_DIR/app.log"
sudo touch "$LOG_DIR/error.log"
sudo chmod 644 "$LOG_DIR"/*.log

echo "Restarting CloudWatch Agent..."
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:"$CONFIG_DEST"

echo "=== CloudWatch Agent Setup Complete ==="
echo "Logs will stream to: /academic-prediction/app"
echo "Metrics namespace: AcademicPrediction"
echo ""
echo "To verify status: sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a status"
