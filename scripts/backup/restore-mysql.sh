#!/bin/bash

# MySQL Restore Script for ERP System
# Usage: ./restore-mysql.sh [backup-file] [namespace]

set -e

# Configuration
BACKUP_FILE=${1}
NAMESPACE=${2:-"erp-system"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

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
    
    if [[ -z "$BACKUP_FILE" ]]; then
        log_error "Backup file not specified"
        show_help
        exit 1
    fi
    
    if [[ ! -f "$BACKUP_FILE" ]]; then
        log_error "Backup file '$BACKUP_FILE' does not exist"
        exit 1
    fi
    
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

# Verify backup file
verify_backup_file() {
    log_info "Verifying backup file..."
    
    # Check if file is gzipped
    if file "$BACKUP_FILE" | grep -q "gzip compressed"; then
        IS_COMPRESSED=true
        log_info "Backup file is compressed"
        
        # Test gzip integrity
        if ! gzip -t "$BACKUP_FILE"; then
            log_error "Backup file is corrupted (gzip test failed)"
            exit 1
        fi
        
        # Check SQL content
        if ! zcat "$BACKUP_FILE" | head -20 | grep -q "MySQL dump"; then
            log_error "Backup file does not appear to be a valid MySQL dump"
            exit 1
        fi
    else
        IS_COMPRESSED=false
        log_info "Backup file is not compressed"
        
        # Check SQL content
        if ! head -20 "$BACKUP_FILE" | grep -q "MySQL dump"; then
            log_error "Backup file does not appear to be a valid MySQL dump"
            exit 1
        fi
    fi
    
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log_success "Backup file verification passed (Size: $BACKUP_SIZE)"
}

# Create pre-restore backup
create_pre_restore_backup() {
    log_warning "Creating pre-restore backup as safety measure..."
    
    MYSQL_POD=$(kubectl get pods -l app=mysql -n "$NAMESPACE" -o jsonpath='{.items[0].metadata.name}')
    DB_ROOT_PASSWORD=$(kubectl get secret mysql-secret -n "$NAMESPACE" -o jsonpath='{.data.root-password}' | base64 -d)
    
    PRE_RESTORE_BACKUP="/tmp/pre_restore_backup_${TIMESTAMP}.sql"
    
    kubectl exec "$MYSQL_POD" -n "$NAMESPACE" -- mysqldump \
        -u root \
        -p"$DB_ROOT_PASSWORD" \
        --single-transaction \
        --routines \
        --triggers \
        --all-databases \
        > "$PRE_RESTORE_BACKUP"
    
    gzip "$PRE_RESTORE_BACKUP"
    PRE_RESTORE_BACKUP="${PRE_RESTORE_BACKUP}.gz"
    
    log_success "Pre-restore backup created: $PRE_RESTORE_BACKUP"
}

# Stop application services
stop_application_services() {
    log_warning "Stopping application services to prevent data corruption..."
    
    # Scale down all application deployments
    DEPLOYMENTS=$(kubectl get deployments -n "$NAMESPACE" -o jsonpath='{.items[*].metadata.name}' | grep -v mysql | grep -v redis | grep -v kafka | grep -v zookeeper || true)
    
    for deployment in $DEPLOYMENTS; do
        log_info "Scaling down deployment: $deployment"
        kubectl scale deployment "$deployment" --replicas=0 -n "$NAMESPACE"
    done
    
    # Wait for pods to terminate
    log_info "Waiting for application pods to terminate..."
    sleep 30
    
    log_success "Application services stopped"
}

# Perform database restore
perform_restore() {
    log_info "Starting database restore..."
    
    MYSQL_POD=$(kubectl get pods -l app=mysql -n "$NAMESPACE" -o jsonpath='{.items[0].metadata.name}')
    DB_ROOT_PASSWORD=$(kubectl get secret mysql-secret -n "$NAMESPACE" -o jsonpath='{.data.root-password}' | base64 -d)
    
    log_info "Using MySQL pod: $MYSQL_POD"
    
    # Copy backup file to MySQL pod
    TEMP_BACKUP_FILE="/tmp/restore_backup_${TIMESTAMP}.sql"
    
    if [[ "$IS_COMPRESSED" == "true" ]]; then
        log_info "Decompressing and copying backup to MySQL pod..."
        zcat "$BACKUP_FILE" | kubectl exec -i "$MYSQL_POD" -n "$NAMESPACE" -- tee "$TEMP_BACKUP_FILE" > /dev/null
    else
        log_info "Copying backup to MySQL pod..."
        kubectl cp "$BACKUP_FILE" "$NAMESPACE/$MYSQL_POD:$TEMP_BACKUP_FILE"
    fi
    
    # Restore database
    log_info "Restoring database from backup..."
    kubectl exec "$MYSQL_POD" -n "$NAMESPACE" -- mysql \
        -u root \
        -p"$DB_ROOT_PASSWORD" \
        < "$TEMP_BACKUP_FILE"
    
    # Clean up temporary file
    kubectl exec "$MYSQL_POD" -n "$NAMESPACE" -- rm -f "$TEMP_BACKUP_FILE"
    
    log_success "Database restore completed"
}

# Verify restore
verify_restore() {
    log_info "Verifying database restore..."
    
    MYSQL_POD=$(kubectl get pods -l app=mysql -n "$NAMESPACE" -o jsonpath='{.items[0].metadata.name}')
    DB_ROOT_PASSWORD=$(kubectl get secret mysql-secret -n "$NAMESPACE" -o jsonpath='{.data.root-password}' | base64 -d)
    
    # Check if databases exist
    DATABASES=$(kubectl exec "$MYSQL_POD" -n "$NAMESPACE" -- mysql -u root -p"$DB_ROOT_PASSWORD" -e "SHOW DATABASES;" | grep -v -E "(Database|information_schema|performance_schema|mysql|sys)")
    
    if [[ -n "$DATABASES" ]]; then
        log_success "Database verification passed. Found databases:"
        echo "$DATABASES" | sed 's/^/  - /'
    else
        log_error "Database verification failed - no application databases found"
        exit 1
    fi
    
    # Check specific ERP database
    if echo "$DATABASES" | grep -q "erp_system"; then
        log_success "ERP system database found"
        
        # Check table count
        TABLE_COUNT=$(kubectl exec "$MYSQL_POD" -n "$NAMESPACE" -- mysql -u root -p"$DB_ROOT_PASSWORD" -e "USE erp_system; SHOW TABLES;" | wc -l)
        log_info "ERP database contains $((TABLE_COUNT - 1)) tables"
    else
        log_warning "ERP system database not found in restore"
    fi
}

# Restart application services
restart_application_services() {
    log_info "Restarting application services..."
    
    # Scale up all application deployments
    DEPLOYMENTS=$(kubectl get deployments -n "$NAMESPACE" -o jsonpath='{.items[*].metadata.name}' | grep -v mysql | grep -v redis | grep -v kafka | grep -v zookeeper || true)
    
    for deployment in $DEPLOYMENTS; do
        log_info "Scaling up deployment: $deployment"
        kubectl scale deployment "$deployment" --replicas=2 -n "$NAMESPACE"
    done
    
    # Wait for pods to be ready
    log_info "Waiting for application services to be ready..."
    sleep 60
    
    # Check deployment status
    kubectl get deployments -n "$NAMESPACE"
    
    log_success "Application services restarted"
}

# Create restore report
create_restore_report() {
    log_info "Creating restore report..."
    
    REPORT_FILE="/tmp/restore_report_${TIMESTAMP}.txt"
    
    cat > "$REPORT_FILE" << EOF
ERP MySQL Restore Report
========================
Restore Timestamp: $TIMESTAMP
Namespace: $NAMESPACE
Backup File: $BACKUP_FILE
Backup Size: $(du -h "$BACKUP_FILE" | cut -f1)
Pre-restore Backup: $PRE_RESTORE_BACKUP
Restored By: $(whoami)
Hostname: $(hostname)
Kubernetes Context: $(kubectl config current-context)

Database Status After Restore:
$(kubectl exec "$MYSQL_POD" -n "$NAMESPACE" -- mysql -u root -p"$DB_ROOT_PASSWORD" -e "SHOW DATABASES;" 2>/dev/null || echo "Could not retrieve database list")

Application Status:
$(kubectl get deployments -n "$NAMESPACE" 2>/dev/null || echo "Could not retrieve deployment status")

Restore completed successfully.
EOF
    
    log_success "Restore report created: $REPORT_FILE"
    cat "$REPORT_FILE"
}

# Main function
main() {
    log_warning "=== ERP MySQL Database Restore ==="
    log_warning "This operation will restore the database from backup."
    log_warning "All current data will be replaced with backup data."
    log_warning "Application services will be temporarily stopped."
    
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Restore operation cancelled by user"
        exit 0
    fi
    
    log_info "Starting ERP MySQL restore process..."
    log_info "Backup File: $BACKUP_FILE"
    log_info "Namespace: $NAMESPACE"
    log_info "Timestamp: $TIMESTAMP"
    
    check_prerequisites
    verify_backup_file
    create_pre_restore_backup
    stop_application_services
    perform_restore
    verify_restore
    restart_application_services
    create_restore_report
    
    log_success "MySQL restore process completed successfully!"
    log_info "Pre-restore backup saved at: $PRE_RESTORE_BACKUP"
    log_info "Restore report: $REPORT_FILE"
}

# Help function
show_help() {
    cat << EOF
ERP MySQL Restore Script

Usage: $0 <backup-file> [namespace]

Arguments:
  backup-file      Path to the MySQL backup file (.sql or .sql.gz)
  namespace        Kubernetes namespace [default: erp-system]

Examples:
  $0 /backup/mysql/erp_mysql_backup_20231201_120000.sql.gz
  $0 backup.sql erp-prod

WARNING: This operation will:
- Stop all application services
- Replace current database with backup data
- Restart application services

A pre-restore backup will be created automatically for safety.

EOF
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    "")
        log_error "Backup file not specified"
        show_help
        exit 1
        ;;
    *)
        main "$@"
        ;;
esac