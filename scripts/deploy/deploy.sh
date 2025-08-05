#!/bin/bash

# ERP System Deployment Script
# Usage: ./deploy.sh [environment] [version]

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
NAMESPACE="erp-system"
HELM_CHART_PATH="$PROJECT_ROOT/helm/erp-system"

# Default values
ENVIRONMENT=${1:-"dev"}
VERSION=${2:-"latest"}
DRY_RUN=${DRY_RUN:-false}
SKIP_BUILD=${SKIP_BUILD:-false}

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
    
    # Check if kubectl is installed and configured
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if helm is installed
    if ! command -v helm &> /dev/null; then
        log_error "helm is not installed or not in PATH"
        exit 1
    fi
    
    # Check if docker is installed (for building images)
    if [[ "$SKIP_BUILD" != "true" ]] && ! command -v docker &> /dev/null; then
        log_error "docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check kubectl connection
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Build Maven project
build_maven_project() {
    log_info "Building Maven project..."
    
    cd "$PROJECT_ROOT"
    
    # Clean and compile the project
    if ! mvn clean compile -DskipTests; then
        log_error "Maven compile failed"
        exit 1
    fi
    
    # Package the project
    if ! mvn package -DskipTests; then
        log_error "Maven package failed"
        exit 1
    fi
    
    log_success "Maven build completed successfully"
}

# Build Docker images
build_images() {
    if [[ "$SKIP_BUILD" == "true" ]]; then
        log_info "Skipping image build (SKIP_BUILD=true)"
        return
    fi
    
    # Build Maven project first
    build_maven_project
    
    log_info "Building Docker images for version $VERSION..."
    
    # Services to build
    services=(
        "erp-gateway"
        "erp-user-service"
        "erp-product-service"
        "erp-order-service"
        "erp-inventory-service"
        "erp-platform-service"
        "erp-logistics-service"
        "erp-notification-service"
    )
    
    for service in "${services[@]}"; do
        log_info "Building $service:$VERSION..."
        
        if [[ -f "$PROJECT_ROOT/$service/Dockerfile" ]]; then
            docker build -t "erp-system/$service:$VERSION" "$PROJECT_ROOT/$service/"
            
            # Tag as latest if this is a release build
            if [[ "$VERSION" != "latest" ]]; then
                docker tag "erp-system/$service:$VERSION" "erp-system/$service:latest"
            fi
            
            log_success "Built $service:$VERSION"
        else
            log_warning "Dockerfile not found for $service, skipping..."
        fi
    done
    
    log_success "All images built successfully"
}

# Create namespace if it doesn't exist
create_namespace() {
    log_info "Creating namespace $NAMESPACE if it doesn't exist..."
    
    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_info "Namespace $NAMESPACE already exists"
    else
        kubectl create namespace "$NAMESPACE"
        log_success "Created namespace $NAMESPACE"
    fi
}

# Deploy infrastructure components
deploy_infrastructure() {
    log_info "Deploying infrastructure components..."
    
    # Apply namespace and resource quota
    kubectl apply -f "$PROJECT_ROOT/k8s/namespace.yaml"
    
    # Deploy infrastructure components
    kubectl apply -f "$PROJECT_ROOT/k8s/infrastructure/"
    
    # Wait for infrastructure to be ready
    log_info "Waiting for infrastructure components to be ready..."
    
    # Wait for MySQL
    kubectl wait --for=condition=ready pod -l app=mysql -n "$NAMESPACE" --timeout=300s
    log_success "MySQL is ready"
    
    # Wait for Redis
    kubectl wait --for=condition=ready pod -l app=redis -n "$NAMESPACE" --timeout=300s
    log_success "Redis is ready"
    
    # Wait for Kafka
    kubectl wait --for=condition=ready pod -l app=kafka -n "$NAMESPACE" --timeout=300s
    log_success "Kafka is ready"
    
    log_success "Infrastructure deployment completed"
}

# Deploy application using Helm
deploy_application() {
    log_info "Deploying ERP application using Helm..."
    
    # Prepare Helm values file for environment
    VALUES_FILE="$PROJECT_ROOT/helm/erp-system/values-$ENVIRONMENT.yaml"
    
    if [[ ! -f "$VALUES_FILE" ]]; then
        log_warning "Environment-specific values file not found: $VALUES_FILE"
        log_info "Using default values.yaml"
        VALUES_FILE="$PROJECT_ROOT/helm/erp-system/values.yaml"
    fi
    
    # Helm command arguments
    HELM_ARGS=(
        "upgrade"
        "--install"
        "erp-system"
        "$HELM_CHART_PATH"
        "--namespace" "$NAMESPACE"
        "--values" "$VALUES_FILE"
        "--set" "global.imageTag=$VERSION"
        "--wait"
        "--timeout" "10m"
    )
    
    # Add dry-run flag if specified
    if [[ "$DRY_RUN" == "true" ]]; then
        HELM_ARGS+=("--dry-run")
        log_info "Running Helm in dry-run mode"
    fi
    
    # Execute Helm deployment
    helm "${HELM_ARGS[@]}"
    
    if [[ "$DRY_RUN" != "true" ]]; then
        log_success "Application deployed successfully"
    else
        log_success "Dry-run completed successfully"
    fi
}

# Verify deployment
verify_deployment() {
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Skipping verification in dry-run mode"
        return
    fi
    
    log_info "Verifying deployment..."
    
    # Check pod status
    log_info "Checking pod status..."
    kubectl get pods -n "$NAMESPACE"
    
    # Check service status
    log_info "Checking service status..."
    kubectl get services -n "$NAMESPACE"
    
    # Check ingress status
    log_info "Checking ingress status..."
    kubectl get ingress -n "$NAMESPACE"
    
    # Wait for all deployments to be ready
    log_info "Waiting for all deployments to be ready..."
    kubectl wait --for=condition=available deployment --all -n "$NAMESPACE" --timeout=600s
    
    # Health check
    log_info "Performing health checks..."
    
    # Get gateway service endpoint
    GATEWAY_SERVICE=$(kubectl get service erp-gateway -n "$NAMESPACE" -o jsonpath='{.spec.clusterIP}')
    GATEWAY_PORT=$(kubectl get service erp-gateway -n "$NAMESPACE" -o jsonpath='{.spec.ports[0].port}')
    
    if [[ -n "$GATEWAY_SERVICE" && -n "$GATEWAY_PORT" ]]; then
        # Port forward for health check
        kubectl port-forward service/erp-gateway 8080:$GATEWAY_PORT -n "$NAMESPACE" &
        PORT_FORWARD_PID=$!
        
        sleep 5
        
        # Health check
        if curl -f http://localhost:8080/actuator/health &> /dev/null; then
            log_success "Gateway health check passed"
        else
            log_warning "Gateway health check failed"
        fi
        
        # Clean up port forward
        kill $PORT_FORWARD_PID 2>/dev/null || true
    fi
    
    log_success "Deployment verification completed"
}

# Rollback function
rollback_deployment() {
    log_warning "Rolling back deployment..."
    
    helm rollback erp-system --namespace "$NAMESPACE"
    
    log_success "Rollback completed"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    # Kill any background processes
    jobs -p | xargs -r kill 2>/dev/null || true
    
    log_info "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting ERP System deployment..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Version: $VERSION"
    log_info "Dry Run: $DRY_RUN"
    
    # Set up cleanup trap
    trap cleanup EXIT
    
    # Execute deployment steps
    check_prerequisites
    
    if [[ "$DRY_RUN" != "true" ]]; then
        build_images
        create_namespace
        deploy_infrastructure
    fi
    
    deploy_application
    verify_deployment
    
    log_success "ERP System deployment completed successfully!"
    
    if [[ "$DRY_RUN" != "true" ]]; then
        log_info "Access the application at:"
        kubectl get ingress -n "$NAMESPACE" -o jsonpath='{.items[0].spec.rules[0].host}' 2>/dev/null || echo "Check ingress configuration"
    fi
}

# Help function
show_help() {
    cat << EOF
ERP System Deployment Script

Usage: $0 [environment] [version] [options]

Arguments:
  environment    Target environment (dev, staging, prod) [default: dev]
  version        Image version to deploy [default: latest]

Environment Variables:
  DRY_RUN        Set to 'true' to perform a dry run [default: false]
  SKIP_BUILD     Set to 'true' to skip image building [default: false]

Examples:
  $0                          # Deploy dev environment with latest version
  $0 prod v1.2.3             # Deploy prod environment with version v1.2.3
  DRY_RUN=true $0 staging     # Dry run for staging environment
  SKIP_BUILD=true $0 dev      # Deploy without building images

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