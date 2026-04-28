#!/bin/bash
set -euo pipefail

# Production Deployment Script for EC2
# Usage: ./scripts/deploy.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
BACKEND_CONTAINER="app-backend-prod"
HEALTH_URL="http://localhost:8000/health"
MAX_RETRIES=30
RETRY_DELAY=5

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Optional: Check if running on EC2
check_ec2() {
    if command -v ec2-metadata &> /dev/null; then
        log_info "Running on EC2 instance"
        ec2-metadata --instance-id
    elif curl -s --max-time 2 http://169.254.169.254/latest/meta-data/instance-id &> /dev/null; then
        log_info "Running on EC2 instance"
        curl -s http://169.254.169.254/latest/meta-data/instance-id
    else
        log_warn "Not running on EC2. Continuing anyway..."
    fi
}

# Pull latest code
pull_code() {
    log_info "Pulling latest code..."
    if [ -d ".git" ]; then
        git pull origin main || git pull origin master
    else
        log_warn "Not a git repository. Skipping git pull."
    fi
}

# Build and start containers
build_and_start() {
    log_info "Building and starting containers with ${COMPOSE_FILE}..."
    docker compose -f "${COMPOSE_FILE}" pull
    docker compose -f "${COMPOSE_FILE}" up --build -d
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    docker compose -f "${COMPOSE_FILE}" exec -T backend alembic upgrade head
}

# Health check
health_check() {
    log_info "Waiting for backend to be healthy..."
    local retries=0

    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -sf "${HEALTH_URL}" &> /dev/null; then
            log_info "Health check passed!"
            return 0
        fi

        retries=$((retries + 1))
        log_warn "Health check failed. Retry ${retries}/${MAX_RETRIES}..."
        sleep $RETRY_DELAY
    done

    log_error "Health check failed after ${MAX_RETRIES} attempts."
    return 1
}

# Show container status
show_status() {
    log_info "Container status:"
    docker ps --filter "name=${BACKEND_CONTAINER}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Main deployment flow
main() {
    log_info "Starting production deployment..."

    check_ec2
    pull_code
    build_and_start
    run_migrations

    if health_check; then
        show_status
        log_info "Deployment completed successfully!"
        log_info "Backend is running at ${HEALTH_URL}"
    else
        log_error "Deployment failed. Check logs with: docker logs ${BACKEND_CONTAINER}"
        exit 1
    fi
}

main "$@"
