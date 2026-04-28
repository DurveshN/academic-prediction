#!/bin/bash
set -euo pipefail

# Rollback Script for Production Deployment
# Usage: ./scripts/rollback.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.prod.yml"
BACKEND_CONTAINER="app-backend-prod"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Stop running containers
stop_containers() {
    log_info "Stopping current containers..."
    docker compose -f "${COMPOSE_FILE}" down
}

# Rollback database migration
rollback_migration() {
    log_info "Rolling back database migration (alembic downgrade -1)..."
    docker compose -f "${COMPOSE_FILE}" run --rm backend alembic downgrade -1 || {
        log_error "Migration rollback failed. You may need to manually inspect the database state."
        exit 1
    }
}

# Restart previous version using docker image tags
restart_previous() {
    log_warn "To restart a previous Docker image version, you must specify the image tag."
    log_warn "Example: docker run -d --name ${BACKEND_CONTAINER} --env-file .env -p 8000:8000 your-image:PREVIOUS_TAG"
    log_warn "Or checkout the previous git commit and re-run deploy.sh"
}

# Manual rollback steps
manual_rollback() {
    log_warn "Manual rollback steps:"
    echo ""
    echo "1. Stop current containers:"
    echo "   docker compose -f ${COMPOSE_FILE} down"
    echo ""
    echo "2. Revert database (if needed):"
    echo "   docker compose -f ${COMPOSE_FILE} run --rm backend alembic downgrade -1"
    echo ""
    echo "3. Checkout previous git commit:"
    echo "   git log --oneline -5"
    echo "   git checkout <previous-commit-hash>"
    echo ""
    echo "4. Re-deploy previous version:"
    echo "   ./scripts/deploy.sh"
    echo ""
    echo "5. Or use a tagged Docker image:"
    echo "   docker run -d --name ${BACKEND_CONTAINER} --env-file .env -p 8000:8000 your-image:PREVIOUS_TAG"
}

# Main rollback flow
main() {
    log_warn "Starting rollback procedure..."
    echo ""

    read -p "Are you sure you want to rollback? This will stop containers and revert the DB migration. [y/N]: " confirm

    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log_info "Rollback cancelled."
        exit 0
    fi

    stop_containers
    rollback_migration

    log_info "Rollback completed."
    log_warn "You must now restart the previous application version manually."
    echo ""
    manual_rollback
}

main "$@"
