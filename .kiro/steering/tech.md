# Technology Stack & Build System

## Backend Stack

- **Java**: OpenJDK 17 LTS
- **Framework**: Spring Boot 3.2.0 with Spring Cloud 2023.0.0
- **Gateway**: Spring Cloud Gateway for API routing and security
- **Database**: MySQL 8.0.35 with MyBatis Plus 3.5.4
- **Cache**: Redis 7.2.3 for session storage and caching
- **Message Queue**: Apache Kafka 3.6.0 for async processing
- **Service Discovery**: Nacos 2.3.0
- **Security**: Spring Security with JWT authentication

## Frontend Stack

- **Framework**: Vue 3.4+ with TypeScript 5.0+
- **UI Library**: Element Plus 2.10+
- **State Management**: Pinia 3.0+
- **Build Tool**: Vite 7.0+
- **HTTP Client**: Axios 1.10+
- **Router**: Vue Router 4.5+

## Infrastructure

- **Containerization**: Docker with Docker Compose
- **Orchestration**: Kubernetes with Helm charts
- **Monitoring**: Prometheus + Grafana + ELK Stack
- **Tracing**: Zipkin with Spring Cloud Sleuth
- **Storage**: MinIO for object storage

## Build System

### Hot Reload Development (Recommended)
```bash
# Start hot reload environment
make dev-hot

# Start specific services
make dev-gateway     # Gateway only
make dev-user        # User service only
SERVICES="gateway,user,product" ./scripts/dev-hot-reload.sh

# Selective build and deploy
make build-selective
SERVICES=gateway ./scripts/build-selective.sh
BUILD_TYPE=prod SERVICES=all ./scripts/build-selective.sh
```

### Maven (Backend)
```bash
# Clean and compile
mvn clean compile

# Run tests
mvn test

# Package without tests
mvn package -DskipTests

# Hot reload development
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Code quality checks
mvn checkstyle:check
mvn spotbugs:check

# Build all modules
mvn clean install
```

### NPM (Frontend)
```bash
# Install dependencies
npm install

# Development server (with HMR)
npm run dev

# Build for production
npm run build

# Run tests
npm run test:unit

# Lint and format
npm run lint
npm run format
```

### Docker
```bash
# Build all services
docker-compose build

# Start development environment
docker-compose up -d

# Start with hot reload
make dev-hot

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Quick Build Scripts
```bash
# Traditional build script
./scripts/build-and-test.sh

# Hot reload development
./scripts/dev-hot-reload.sh

# Selective build
./scripts/build-selective.sh
```

## Common Development Commands

### Local Development Setup
```bash
# 1. Start infrastructure services
docker-compose up -d mysql redis kafka nacos

# 2. Build backend services
mvn clean package -DskipTests

# 3. Start frontend
cd erp-frontend && npm run dev

# 4. Access services
# Frontend: http://localhost:3000
# Gateway: http://localhost:8080
# Nacos: http://localhost:8848
```

### Testing
```bash
# Backend unit tests
mvn test

# Frontend tests
cd erp-frontend && npm run test:unit

# Integration tests
cd scripts/testing && ./test-orchestrator.sh test all

# Performance tests
cd scripts/testing && ./performance-test.sh
```

### Deployment
```bash
# Local deployment
./scripts/deploy/deploy.sh local

# Kubernetes deployment
helm install erp-system ./helm/erp-system

# Health check
./scripts/deploy/health-check.sh
```

## Code Quality Standards

- **Java**: Follow Google Java Style Guide with Checkstyle
- **TypeScript**: ESLint + Prettier configuration
- **Test Coverage**: Backend >80%, Frontend >70%
- **Documentation**: All public APIs must have Swagger/OpenAPI docs