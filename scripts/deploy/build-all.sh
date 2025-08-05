#!/bin/bash

# Build All Services Script with Docker Buildx
# Supports multi-platform builds (amd64, arm64)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGISTRY=${REGISTRY:-"localhost:5000"}
TAG=${TAG:-"latest"}
PLATFORMS=${PLATFORMS:-"linux/amd64,linux/arm64"}
BUILD_ARGS=${BUILD_ARGS:-""}

# Services to build
SERVICES=(
    "erp-gateway"
    "erp-user-service"
    "erp-product-service"
    "erp-order-service"
    "erp-inventory-service"
    "erp-platform-service"
    "erp-logistics-service"
    "erp-notification-service"
)

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  ERP System Multi-Platform Build${NC}"
    echo -e "${BLUE}================================${NC}"
    echo -e "Registry: ${GREEN}${REGISTRY}${NC}"
    echo -e "Tag: ${GREEN}${TAG}${NC}"
    echo -e "Platforms: ${GREEN}${PLATFORMS}${NC}"
    echo ""
}

check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed${NC}"
        exit 1
    fi
    
    # Check Docker Buildx
    if ! docker buildx version &> /dev/null; then
        echo -e "${RED}Error: Docker Buildx is not available${NC}"
        exit 1
    fi
    
    # Create buildx builder if not exists
    if ! docker buildx inspect erp-builder &> /dev/null; then
        echo -e "${YELLOW}Creating buildx builder...${NC}"
        docker buildx create --name erp-builder --use
    else
        docker buildx use erp-builder
    fi
    
    echo -e "${GREEN}Prerequisites check passed${NC}"
    echo ""
}

build_backend_services() {
    echo -e "${YELLOW}Building backend services...${NC}"
    
    # Build Maven project first
    echo -e "${BLUE}Building Maven project...${NC}"
    mvn clean package -DskipTests -q
    
    for service in "${SERVICES[@]}"; do
        echo -e "${BLUE}Building ${service}...${NC}"
        
        if [ -d "$service" ]; then
            docker buildx build \
                --platform "$PLATFORMS" \
                --tag "${REGISTRY}/${service}:${TAG}" \
                --push \
                $BUILD_ARGS \
                "./$service"
            
            echo -e "${GREEN}✓ ${service} built successfully${NC}"
        else
            echo -e "${RED}✗ Directory $service not found${NC}"
        fi
    done
}

build_frontend() {
    echo -e "${YELLOW}Building frontend...${NC}"
    
    if [ -d "erp-frontend" ]; then
        cd erp-frontend
        
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            echo -e "${BLUE}Installing frontend dependencies...${NC}"
            npm install
        fi
        
        # Build frontend
        echo -e "${BLUE}Building frontend application...${NC}"
        npm run build
        
        # Build Docker image
        docker buildx build \
            --platform "$PLATFORMS" \
            --tag "${REGISTRY}/erp-frontend:${TAG}" \
            --push \
            $BUILD_ARGS \
            .
        
        cd ..
        echo -e "${GREEN}✓ Frontend built successfully${NC}"
    else
        echo -e "${RED}✗ Frontend directory not found${NC}"
    fi
}

create_docker_compose_override() {
    echo -e "${YELLOW}Creating docker-compose override...${NC}"
    
    cat > docker-compose.override.yml << EOF
version: '3.8'

services:
  erp-gateway:
    image: ${REGISTRY}/erp-gateway:${TAG}
  
  erp-user-service:
    image: ${REGISTRY}/erp-user-service:${TAG}
  
  erp-product-service:
    image: ${REGISTRY}/erp-product-service:${TAG}
  
  erp-order-service:
    image: ${REGISTRY}/erp-order-service:${TAG}
  
  erp-inventory-service:
    image: ${REGISTRY}/erp-inventory-service:${TAG}
  
  erp-platform-service:
    image: ${REGISTRY}/erp-platform-service:${TAG}
  
  erp-logistics-service:
    image: ${REGISTRY}/erp-logistics-service:${TAG}
  
  erp-notification-service:
    image: ${REGISTRY}/erp-notification-service:${TAG}
  
  erp-frontend:
    image: ${REGISTRY}/erp-frontend:${TAG}
EOF
    
    echo -e "${GREEN}✓ Docker compose override created${NC}"
}

main() {
    print_header
    check_prerequisites
    build_backend_services
    build_frontend
    create_docker_compose_override
    
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}  Build completed successfully!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo -e "Next steps:"
    echo -e "1. Start services: ${BLUE}./scripts/deploy/one-click-deploy.sh${NC}"
    echo -e "2. Check health: ${BLUE}./scripts/deploy/health-check.sh${NC}"
    echo -e "3. View logs: ${BLUE}docker-compose logs -f${NC}"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Environment variables:"
        echo "  REGISTRY    Docker registry (default: localhost:5000)"
        echo "  TAG         Image tag (default: latest)"
        echo "  PLATFORMS   Target platforms (default: linux/amd64,linux/arm64)"
        echo "  BUILD_ARGS  Additional build arguments"
        echo ""
        echo "Examples:"
        echo "  $0                                    # Build with defaults"
        echo "  REGISTRY=myregistry.com TAG=v1.0 $0   # Custom registry and tag"
        echo "  PLATFORMS=linux/amd64 $0             # Build for amd64 only"
        exit 0
        ;;
    *)
        main
        ;;
esac