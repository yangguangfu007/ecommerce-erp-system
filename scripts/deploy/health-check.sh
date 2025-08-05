#!/bin/bash

# ERP System Health Check Script
# Usage: ./health-check.sh [namespace]

set -e

# Configuration
NAMESPACE=${1:-"erp-system"}
TIMEOUT=${TIMEOUT:-300}
CHECK_INTERVAL=${CHECK_INTERVAL:-10}

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

# Check if namespace exists
check_namespace() {
    log_info "Checking if namespace '$NAMESPACE' exists..."
    
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_error "Namespace '$NAMESPACE' does not exist"
        exit 1
    fi
    
    log_success "Namespace '$NAMESPACE' exists"
}

# Check pod status
check_pods() {
    log_info "Checking pod status in namespace '$NAMESPACE'..."
    
    echo "=== Pod Status ==="
    kubectl get pods -n "$NAMESPACE" -o wide
    echo
    
    # Check for failed pods
    FAILED_PODS=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase=Failed --no-headers 2>/dev/null | wc -l)
    if [[ $FAILED_PODS -gt 0 ]]; then
        log_warning "$FAILED_PODS pod(s) in Failed state"
        kubectl get pods -n "$NAMESPACE" --field-selector=status.phase=Failed
    fi
    
    # Check for pending pods
    PENDING_PODS=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase=Pending --no-headers 2>/dev/null | wc -l)
    if [[ $PENDING_PODS -gt 0 ]]; then
        log_warning "$PENDING_PODS pod(s) in Pending state"
        kubectl get pods -n "$NAMESPACE" --field-selector=status.phase=Pending
    fi
    
    # Wait for all pods to be ready
    log_info "Waiting for all pods to be ready (timeout: ${TIMEOUT}s)..."
    
    if kubectl wait --for=condition=ready pod --all -n "$NAMESPACE" --timeout="${TIMEOUT}s"; then
        log_success "All pods are ready"
    else
        log_error "Some pods are not ready within timeout"
        return 1
    fi
}

# Check service status
check_services() {
    log_info "Checking service status in namespace '$NAMESPACE'..."
    
    echo "=== Service Status ==="
    kubectl get services -n "$NAMESPACE" -o wide
    echo
    
    # Check if services have endpoints
    log_info "Checking service endpoints..."
    
    SERVICES=$(kubectl get services -n "$NAMESPACE" --no-headers -o custom-columns=":metadata.name" | grep -v kubernetes || true)
    
    for service in $SERVICES; do
        ENDPOINTS=$(kubectl get endpoints "$service" -n "$NAMESPACE" -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null || echo "")
        
        if [[ -n "$ENDPOINTS" ]]; then
            log_success "Service '$service' has endpoints: $ENDPOINTS"
        else
            log_warning "Service '$service' has no endpoints"
        fi
    done
}

# Check deployment status
check_deployments() {
    log_info "Checking deployment status in namespace '$NAMESPACE'..."
    
    echo "=== Deployment Status ==="
    kubectl get deployments -n "$NAMESPACE" -o wide
    echo
    
    # Check deployment readiness
    DEPLOYMENTS=$(kubectl get deployments -n "$NAMESPACE" --no-headers -o custom-columns=":metadata.name" 2>/dev/null || echo "")
    
    for deployment in $DEPLOYMENTS; do
        READY=$(kubectl get deployment "$deployment" -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
        DESIRED=$(kubectl get deployment "$deployment" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
        
        if [[ "$READY" == "$DESIRED" && "$READY" -gt 0 ]]; then
            log_success "Deployment '$deployment' is ready ($READY/$DESIRED)"
        else
            log_warning "Deployment '$deployment' is not ready ($READY/$DESIRED)"
        fi
    done
}

# Check ingress status
check_ingress() {
    log_info "Checking ingress status in namespace '$NAMESPACE'..."
    
    if kubectl get ingress -n "$NAMESPACE" &> /dev/null; then
        echo "=== Ingress Status ==="
        kubectl get ingress -n "$NAMESPACE" -o wide
        echo
        
        # Check ingress endpoints
        INGRESSES=$(kubectl get ingress -n "$NAMESPACE" --no-headers -o custom-columns=":metadata.name" 2>/dev/null || echo "")
        
        for ingress in $INGRESSES; do
            ADDRESS=$(kubectl get ingress "$ingress" -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
            
            if [[ -n "$ADDRESS" ]]; then
                log_success "Ingress '$ingress' has address: $ADDRESS"
            else
                log_warning "Ingress '$ingress' has no address assigned"
            fi
        done
    else
        log_info "No ingress resources found in namespace '$NAMESPACE'"
    fi
}

# Check persistent volume claims
check_pvcs() {
    log_info "Checking PVC status in namespace '$NAMESPACE'..."
    
    if kubectl get pvc -n "$NAMESPACE" &> /dev/null; then
        echo "=== PVC Status ==="
        kubectl get pvc -n "$NAMESPACE" -o wide
        echo
        
        # Check PVC status
        PVCS=$(kubectl get pvc -n "$NAMESPACE" --no-headers -o custom-columns=":metadata.name" 2>/dev/null || echo "")
        
        for pvc in $PVCS; do
            STATUS=$(kubectl get pvc "$pvc" -n "$NAMESPACE" -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
            
            if [[ "$STATUS" == "Bound" ]]; then
                log_success "PVC '$pvc' is bound"
            else
                log_warning "PVC '$pvc' status: $STATUS"
            fi
        done
    else
        log_info "No PVC resources found in namespace '$NAMESPACE'"
    fi
}

# Application health checks
check_application_health() {
    log_info "Performing application health checks..."
    
    # Services to check
    services=(
        "erp-gateway:8080"
        "erp-user-service:8001"
        "erp-product-service:8002"
        "erp-order-service:8003"
        "erp-inventory-service:8004"
        "erp-platform-service:8005"
        "erp-logistics-service:8006"
        "erp-notification-service:8007"
    )
    
    # Special check for Gateway service (most critical)
    log_info "Performing detailed Gateway health check..."
    if curl -f -s "http://localhost:8080/actuator/health" > /dev/null 2>&1; then
        log_success "Gateway service is healthy"
        
        # Check Gateway routes
        if curl -f -s "http://localhost:8080/actuator/gateway/routes" > /dev/null 2>&1; then
            log_success "Gateway routes are accessible"
        else
            log_warning "Gateway routes endpoint not accessible"
        fi
        
        # Check Nacos registration
        if curl -f -s "http://localhost:8080/actuator/nacosdiscovery" > /dev/null 2>&1; then
            log_success "Gateway is registered with Nacos"
        else
            log_warning "Gateway Nacos registration check failed"
        fi
    else
        log_error "Gateway service health check failed - this is critical!"
        return 1
    fi
    
    for service_port in "${services[@]}"; do
        IFS=':' read -r service port <<< "$service_port"
        
        log_info "Checking health of $service..."
        
        # Check if service exists
        if ! kubectl get service "$service" -n "$NAMESPACE" &> /dev/null; then
            log_warning "Service '$service' not found, skipping health check"
            continue
        fi
        
        # Port forward and health check
        kubectl port-forward "service/$service" "$port:$port" -n "$NAMESPACE" &
        PORT_FORWARD_PID=$!
        
        # Wait for port forward to establish
        sleep 3
        
        # Perform health check
        if curl -f -s "http://localhost:$port/actuator/health" > /dev/null 2>&1; then
            log_success "$service health check passed"
        else
            log_warning "$service health check failed"
        fi
        
        # Clean up port forward
        kill $PORT_FORWARD_PID 2>/dev/null || true
        sleep 1
    done
}

# Check resource usage
check_resource_usage() {
    log_info "Checking resource usage in namespace '$NAMESPACE'..."
    
    echo "=== Resource Usage ==="
    
    # Check if metrics server is available
    if kubectl top nodes &> /dev/null; then
        echo "Node Resource Usage:"
        kubectl top nodes
        echo
        
        echo "Pod Resource Usage:"
        kubectl top pods -n "$NAMESPACE" --sort-by=memory 2>/dev/null || log_warning "Cannot get pod metrics (metrics-server may not be installed)"
        echo
    else
        log_warning "Metrics server not available, skipping resource usage check"
    fi
    
    # Check resource quotas
    if kubectl get resourcequota -n "$NAMESPACE" &> /dev/null; then
        echo "Resource Quotas:"
        kubectl describe resourcequota -n "$NAMESPACE"
        echo
    fi
}

# Check logs for errors
check_logs() {
    log_info "Checking recent logs for errors in namespace '$NAMESPACE'..."
    
    # Get all pods
    PODS=$(kubectl get pods -n "$NAMESPACE" --no-headers -o custom-columns=":metadata.name" 2>/dev/null || echo "")
    
    for pod in $PODS; do
        log_info "Checking logs for pod '$pod'..."
        
        # Check for error patterns in recent logs
        ERROR_COUNT=$(kubectl logs "$pod" -n "$NAMESPACE" --tail=100 2>/dev/null | grep -i -E "(error|exception|failed|fatal)" | wc -l || echo "0")
        
        if [[ $ERROR_COUNT -gt 0 ]]; then
            log_warning "Found $ERROR_COUNT error(s) in logs for pod '$pod'"
            echo "Recent errors:"
            kubectl logs "$pod" -n "$NAMESPACE" --tail=100 2>/dev/null | grep -i -E "(error|exception|failed|fatal)" | tail -5
            echo
        else
            log_success "No recent errors found in logs for pod '$pod'"
        fi
    done
}

# Generate health report
generate_report() {
    log_info "Generating health report..."
    
    REPORT_FILE="/tmp/erp-health-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "ERP System Health Report"
        echo "========================"
        echo "Timestamp: $(date)"
        echo "Namespace: $NAMESPACE"
        echo
        
        echo "Pod Status:"
        kubectl get pods -n "$NAMESPACE" -o wide
        echo
        
        echo "Service Status:"
        kubectl get services -n "$NAMESPACE" -o wide
        echo
        
        echo "Deployment Status:"
        kubectl get deployments -n "$NAMESPACE" -o wide
        echo
        
        echo "Ingress Status:"
        kubectl get ingress -n "$NAMESPACE" -o wide 2>/dev/null || echo "No ingress resources found"
        echo
        
        echo "PVC Status:"
        kubectl get pvc -n "$NAMESPACE" -o wide 2>/dev/null || echo "No PVC resources found"
        echo
        
        echo "Events (last 10):"
        kubectl get events -n "$NAMESPACE" --sort-by='.lastTimestamp' | tail -10
        
    } > "$REPORT_FILE"
    
    log_success "Health report generated: $REPORT_FILE"
}

# Main function
main() {
    log_info "Starting ERP System health check for namespace '$NAMESPACE'..."
    
    check_namespace
    check_pods
    check_services
    check_deployments
    check_ingress
    check_pvcs
    check_application_health
    check_resource_usage
    check_logs
    generate_report
    
    log_success "Health check completed!"
}

# Help function
show_help() {
    cat << EOF
ERP System Health Check Script

Usage: $0 [namespace]

Arguments:
  namespace      Kubernetes namespace to check [default: erp-system]

Environment Variables:
  TIMEOUT        Timeout for waiting operations in seconds [default: 300]
  CHECK_INTERVAL Check interval in seconds [default: 10]

Examples:
  $0                    # Check erp-system namespace
  $0 erp-prod          # Check erp-prod namespace
  TIMEOUT=600 $0       # Check with 10 minute timeout

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