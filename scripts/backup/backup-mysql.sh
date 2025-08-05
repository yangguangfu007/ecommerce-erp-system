#!/bin/bash

# MySQL Backup Script for ERP System
# Usage: ./backup-mysql.sh [namespace] [backup-location]

set -e

# Configuration
NAMESPACE=${1:-"erp-system"}
BACKUP_LOCATION=${2:-"/backup/mysql"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="erp_mysql_backup_${TIMESTAMP}.sql"
RETENTION_DAYS=${RETENTION_DAYS:-7}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_error "Namespace '$NAMESPACE' does not exist"
        exit 1
    fi
    
    if ! kubectl get pod -l app=mysql -n "$NAMESPACE" &> /dev/null; then
        log_error "MySQL pod not found in namespace '$NAMESPACE'"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Create backup directory
create_backup_directory() {
    log_info "Creating backup directory..."
    
    mkdir -p "$BACKUP_LOCATION"
    
    if [[ ! -w "$BACKUP_LOCATION" ]]; then
        log_error "Backup location '$BACKUP_LOCATION' is not writable"
        exit 1
    fi
    
    log_success "Backup directory ready: $BACKUP_LOCATION"
}

# Perform MySQL backup
perform_backup() {
    log_info "Starting MySQL backup..."
    
    # Get MySQL pod name
    MYSQL_POD=$(kubectl get pods -l app=mysql -n "$NAMESPACE" -o jsonpath='{.items[0].metadata.name}')
    
    if [[ -z "$MYSQL_POD" ]]; then
        log_error "Could not find MySQL pod"
        exit 1
    fi
    
    log_info "Using MySQL pod: $MYSQL_POD"
    
    # Get database credentials
    DB_ROOT_PASSWORD=$(kubectl get secret mysql-secret -n "$NAMESPACE" -o jsonpath='{.data.root-password}' | base64 -d)
    
    # Perform backup
    log_info "Creating database dump..."
    
    kubectl exec "$MYSQL_POD" -n "$NAMESPACE" -- mysqldump \
        -u root \
        -p"$DB_ROOT_PASSWORD" \
        --single-transaction \
        --routines \
        --triggers \
        --all-databases \
        --add-drop-database \
        --add-drop-table \
        --create-options \
        --disable-keys \
        --extended-insert \
        --quick \
        --lock-tables=false \
        > "$BACKUP_LOCATION/$BACKUP_FILE"
    
    # Compress backup
    log_info "Compressing backup..."
    gzip "$BACKUP_LOCATION/$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    # Verify backup
    if [[ -f "$BACKUP_LOCATION/$BACKUP_FILE" ]]; then
        BACKUP_SIZE=$(du -h "$BACKUP_LOCATION/$BACKUP_FILE" | cut -f1)
        log_success "Backup completed: $BACKUP_FILE (Size: $BACKUP_SIZE)"
    else
        log_error "Backup file not found after creation"
        exit 1
    fi
}

# Create backup metadata
create_metadata() {
    log_info "Creating backup metadata..."
    
    METADATA_FILE="$BACKUP_LOCATION/backup_${TIMESTAMP}.json"
    
    cat > "$METADATA_FILE" << EOF
{
  "timestamp": "$TIMESTAMP",
  "namespace": "$NAMESPACE",
  "backup_file": "$BACKUP_FILE",
  "backup_size": "$(stat -c%s "$BACKUP_LOCATION/$BACKUP_FILE")",
  "mysql_version": "$(kubectl exec "$MYSQL_POD" -n "$NAMESPACE" -- mysql --version)",
  "databases": [
    $(kubectl exec "$MYSQL_POD" -n "$NAMESPACE" -- mysql -u root -p"$DB_ROOT_PASSWORD" -e "SHOW DATABASES;" | grep -v -E "(Database|information_schema|performance_schema|mysql|sys)" | sed 's/^/    "/' | sed 's/$/"/' | paste -sd ',' -)
  ],
  "created_by": "$(whoami)",
  "hostname": "$(hostname)",
  "kubernetes_context": "$(kubectl config current-context)"
}
EOF
    
    log_success "Metadata created: backup_${TIMESTAMP}.json"
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups (retention: $RETENTION_DAYS days)..."
    
    # Find and remove old backup files
    find "$BACKUP_LOCATION" -name "erp_mysql_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_LOCATION" -name "backup_*.json" -mtime +$RETENTION_DAYS -delete
    
    REMAINING_BACKUPS=$(find "$BACKUP_LOCATION" -name "erp_mysql_backup_*.sql.gz" | wc -l)
    log_success "Cleanup completed. Remaining backups: $REMAINING_BACKUPS"
}

# Test backup integrity
test_backup_integrity() {
    log_info "Testing backup integrity..."
    
    # Test gzip integrity
    if gzip -t "$BACKUP_LOCATION/$BACKUP_FILE"; then
        log_success "Backup file integrity check passed"
    else
        log_error "Backup file integrity check failed"
        exit 1
    fi
    
    # Test SQL syntax (basic check)
    if zcat "$BACKUP_LOCATION/$BACKUP_FILE" | head -20 | grep -q "MySQL dump"; then
        log_success "Backup content validation passed"
    else
        log_warning "Backup content validation failed - file may be corrupted"
    fi
}

# Send notification
send_notification() {
    log_info "Sending backup notification..."
    
    # This is a placeholder for notification integration
    # You can integrate with your notification system here
    
    BACKUP_STATUS="SUCCESS"
    BACKUP_SIZE=$(du -h "$BACKUP_LOCATION/$BACKUP_FILE" | cut -f1)
    
    cat << EOF > "/tmp/backup_notification_${TIMESTAMP}.txt"
ERP MySQL Backup Report
=======================
Status: $BACKUP_STATUS
Timestamp: $TIMESTAMP
Namespace: $NAMESPACE
Backup File: $BACKUP_FILE
Backup Size: $BACKUP_SIZE
Location: $BACKUP_LOCATION
Retention: $RETENTION_DAYS days

This is an automated backup notification.
EOF
    
    log_success "Backup notification prepared"
}

# Main function
main() {
    log_info "Starting ERP MySQL backup process..."
    log_info "Namespace: $NAMESPACE"
    log_info "Backup Location: $BACKUP_LOCATION"
    log_info "Timestamp: $TIMESTAMP"
    
    check_prerequisites
    create_backup_directory
    perform_backup
    create_metadata
    test_backup_integrity
    cleanup_old_backups
    send_notification
    
    log_success "MySQL backup process completed successfully!"
    log_info "Backup file: $BACKUP_LOCATION/$BACKUP_FILE"
}

# Help function
show_help() {
    cat << EOF
ERP MySQL Backup Script

Usage: $0 [namespace] [backup-location]

Arguments:
  namespace        Kubernetes namespace [default: erp-system]
  backup-location  Directory to store backups [default: /backup/mysql]

Environment Variables:
  RETENTION_DAYS   Number of days to retain backups [default: 7]

Examples:
  $0                                    # Backup erp-system to /backup/mysql
  $0 erp-prod /backup/prod/mysql       # Backup erp-prod to custom location
  RETENTION_DAYS=30 $0                 # Backup with 30-day retention

EOF
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac