# ERP System Makefile
# Provides convenient commands for development and deployment

.PHONY: help build deploy dev clean test docker-build docker-push

# Default target
help:
	@echo "ERP System - Available Commands:"
	@echo ""
	@echo "🚀 Deployment Commands:"
	@echo "  make deploy          - One-click deployment (auto-detect platform)"
	@echo "  make deploy-quick    - Quick deployment (skip build)"
	@echo "  make deploy-dev      - Development environment setup"
	@echo "  make build-all       - Build all services (multi-platform)"
	@echo ""
	@echo "🛠️  Development Commands:"
	@echo "  make dev             - Start development environment"
	@echo "  make dev-hot         - Start hot reload development (recommended)"
	@echo "  make dev-backend     - Start backend services only"
	@echo "  make dev-frontend    - Start frontend only"
	@echo "  make dev-infra       - Start infrastructure only"
	@echo ""
	@echo "🔨 Build Commands:"
	@echo "  make build           - Build backend services"
	@echo "  make build-selective - Selective build and deploy"
	@echo "  make build-frontend  - Build frontend application"
	@echo "  make docker-build    - Build Docker images"
	@echo ""
	@echo "🧪 Testing Commands:"
	@echo "  make test            - Run all tests"
	@echo "  make test-backend    - Run backend tests"
	@echo "  make test-frontend   - Run frontend tests"
	@echo "  make test-e2e        - Run end-to-end tests"
	@echo ""
	@echo "🧹 Maintenance Commands:"
	@echo "  make clean           - Clean build artifacts"
	@echo "  make clean-docker    - Clean Docker resources"
	@echo "  make logs            - View service logs"
	@echo "  make health          - Check service health"
	@echo "  make stop            - Stop all services"
	@echo ""
	@echo "📊 Monitoring Commands:"
	@echo "  make status          - Show service status"
	@echo "  make monitor         - Start monitoring stack"
	@echo ""

# Deployment Commands
deploy:
	@echo "🚀 Starting one-click deployment..."
	@chmod +x scripts/deploy/one-click-deploy.sh
	@./scripts/deploy/one-click-deploy.sh

deploy-quick:
	@echo "⚡ Starting quick deployment..."
	@chmod +x scripts/deploy/one-click-deploy.sh
	@QUICK_START=true ./scripts/deploy/one-click-deploy.sh

deploy-dev:
	@echo "🛠️  Setting up development environment..."
	@chmod +x scripts/deploy/quick-dev.sh
	@./scripts/deploy/quick-dev.sh

build-all:
	@echo "🔨 Building all services (multi-platform)..."
	@chmod +x scripts/deploy/build-all.sh
	@./scripts/deploy/build-all.sh

# Development Commands
dev:
	@echo "🛠️  Starting full development environment..."
	@chmod +x scripts/dev-all.sh
	@./scripts/dev-all.sh

dev-hot:
	@echo "🔥 Starting hot reload development environment..."
	@chmod +x scripts/dev-hot-reload.sh
	@./scripts/dev-hot-reload.sh

dev-backend:
	@echo "⚙️  Starting backend services..."
	@chmod +x scripts/dev-backend.sh
	@./scripts/dev-backend.sh

dev-frontend:
	@echo "🎨 Starting frontend development server..."
	@chmod +x scripts/dev-frontend.sh
	@./scripts/dev-frontend.sh

dev-infra:
	@echo "🏗️  Starting infrastructure services..."
	@chmod +x scripts/deploy/quick-dev.sh
	@./scripts/deploy/quick-dev.sh --infra-only

# Build Commands
build:
	@echo "🔨 Building backend services..."
	@mvn clean package -DskipTests

build-selective:
	@echo "🎯 Selective build and deploy..."
	@chmod +x scripts/build-selective.sh
	@./scripts/build-selective.sh

build-frontend:
	@echo "🎨 Building frontend application..."
	@cd erp-frontend && npm install && npm run build

docker-build:
	@echo "🐳 Building Docker images..."
	@docker-compose build

# Testing Commands
test:
	@echo "🧪 Running all tests..."
	@mvn test
	@cd erp-frontend && npm run test:unit

test-backend:
	@echo "⚙️  Running backend tests..."
	@mvn test

test-frontend:
	@echo "🎨 Running frontend tests..."
	@cd erp-frontend && npm run test:unit

test-e2e:
	@echo "🔄 Running end-to-end tests..."
	@./scripts/testing/e2e-test-runner.sh

# Maintenance Commands
clean:
	@echo "🧹 Cleaning build artifacts..."
	@mvn clean
	@cd erp-frontend && rm -rf dist node_modules/.cache

clean-docker:
	@echo "🐳 Cleaning Docker resources..."
	@docker system prune -f
	@docker volume prune -f

logs:
	@echo "📋 Viewing service logs..."
	@docker-compose logs -f

health:
	@echo "🏥 Checking service health..."
	@./scripts/deploy/health-check.sh

stop:
	@echo "🛑 Stopping all services..."
	@docker-compose down
	@pkill -f "spring-boot:run" 2>/dev/null || true
	@pkill -f "npm run dev" 2>/dev/null || true

# Monitoring Commands
status:
	@echo "📊 Checking system status..."
	@./scripts/deploy/status.sh

monitor:
	@echo "📊 Starting monitoring stack..."
	@docker-compose up -d prometheus grafana

# Platform-specific targets
deploy-amd64:
	@echo "🚀 Deploying for AMD64..."
	PLATFORMS=linux/amd64 ./scripts/deploy/build-all.sh
	./scripts/deploy/one-click-deploy.sh

deploy-arm64:
	@echo "🚀 Deploying for ARM64..."
	PLATFORMS=linux/arm64 ./scripts/deploy/build-all.sh
	./scripts/deploy/one-click-deploy.sh

# Production targets
prod-build:
	@echo "🏭 Building for production..."
	REGISTRY=${REGISTRY} TAG=${TAG} ./scripts/deploy/build-all.sh

prod-deploy:
	@echo "🏭 Deploying to production..."
	helm install erp-system ./helm/erp-system --values ./helm/erp-system/values-prod.yaml

# Service-specific development targets
dev-gateway:
	@echo "🚪 Starting gateway service in hot reload mode..."
	@SERVICES=gateway ./scripts/dev-hot-reload.sh

dev-user:
	@echo "👤 Starting user service in hot reload mode..."
	@SERVICES=user ./scripts/dev-hot-reload.sh

dev-product:
	@echo "📦 Starting product service in hot reload mode..."
	@SERVICES=product ./scripts/dev-hot-reload.sh

dev-order:
	@echo "🛒 Starting order service in hot reload mode..."
	@SERVICES=order ./scripts/dev-hot-reload.sh

dev-inventory:
	@echo "📊 Starting inventory service in hot reload mode..."
	@SERVICES=inventory ./scripts/dev-hot-reload.sh

# Service-specific build targets
build-gateway:
	@echo "🚪 Building gateway service..."
	@SERVICES=gateway ./scripts/build-selective.sh

build-user:
	@echo "👤 Building user service..."
	@SERVICES=user ./scripts/build-selective.sh

build-product:
	@echo "📦 Building product service..."
	@SERVICES=product ./scripts/build-selective.sh

build-order:
	@echo "🛒 Building order service..."
	@SERVICES=order ./scripts/build-selective.sh

build-inventory:
	@echo "📊 Building inventory service..."
	@SERVICES=inventory ./scripts/build-selective.sh

# Utility targets
install-deps:
	@echo "📦 Installing dependencies..."
	cd erp-frontend && npm install

format:
	@echo "✨ Formatting code..."
	mvn spotless:apply
	cd erp-frontend && npm run format

lint:
	@echo "🔍 Linting code..."
	mvn checkstyle:check
	cd erp-frontend && npm run lint

# Database operations
db-reset:
	@echo "🗄️  Resetting database..."
	docker-compose down -v mysql
	docker-compose up -d mysql

db-backup:
	@echo "💾 Backing up database..."
	./scripts/backup/backup-mysql.sh

db-restore:
	@echo "🔄 Restoring database..."
	./scripts/backup/restore-mysql.sh

# Quick shortcuts
up: deploy
down: stop
restart: stop deploy
rebuild: clean build deploy