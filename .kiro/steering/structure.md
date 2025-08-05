# Project Structure & Organization

## Root Level Organization

```
ecommerce-erp-system/
├── erp-common/              # Shared utilities and common code
├── erp-gateway/             # API Gateway (Spring Cloud Gateway)
├── erp-*-service/           # Microservices (8 core services)
├── erp-frontend/            # Vue.js frontend application
├── k8s/                     # Kubernetes deployment manifests
├── helm/                    # Helm charts for K8s deployment
├── scripts/                 # Automation and utility scripts
│   ├── dev-hot-reload.sh    # Hot reload development script
│   ├── build-selective.sh   # Selective build and deploy script
├── docs/                    # Project documentation
├── monitoring/              # Monitoring configurations
├── docker-compose.yml       # Local development environment
└── pom.xml                  # Maven parent POM
```

## Microservices Architecture

Each service follows the same structure pattern:

```
erp-{service}-service/
├── src/main/java/com/erp/{service}/
│   ├── {Service}Application.java    # Spring Boot main class
│   ├── controller/                  # REST controllers
│   ├── service/                     # Business logic layer
│   │   └── impl/                    # Service implementations
│   ├── entity/                      # JPA entities
│   ├── dto/                         # Data transfer objects
│   ├── mapper/                      # MyBatis mappers
│   ├── config/                      # Configuration classes
│   └── event/                       # Event handlers (if applicable)
├── src/main/resources/
│   ├── application.yml              # Service configuration
│   ├── mapper/                      # MyBatis XML mappers
│   └── sql/                         # Database initialization scripts
├── src/test/                        # Unit and integration tests
├── Dockerfile                       # Container build instructions
└── pom.xml                          # Service-specific dependencies
```

## Core Services

| Service | Port | Purpose |
|---------|------|---------|
| **erp-gateway** | 8080 | API Gateway, routing, authentication |
| **erp-user-service** | 8001 | User management, RBAC, authentication |
| **erp-product-service** | 8002 | Product catalog, categories, attributes |
| **erp-order-service** | 8003 | Order processing, status tracking |
| **erp-inventory-service** | 8004 | Stock management, alerts, adjustments |
| **erp-platform-service** | 8005 | E-commerce platform integrations |
| **erp-logistics-service** | 8006 | Shipping, tracking, label generation |
| **erp-notification-service** | 8007 | Email, SMS, system notifications |

## Frontend Structure

```
erp-frontend/
├── src/
│   ├── views/                       # Page components
│   │   ├── auth/                    # Login, registration
│   │   ├── dashboard/               # Main dashboard
│   │   ├── users/                   # User management
│   │   ├── products/                # Product management
│   │   ├── orders/                  # Order management
│   │   ├── inventory/               # Inventory management
│   │   ├── platforms/               # Platform integration
│   │   ├── logistics/               # Logistics management
│   │   ├── notifications/           # Notification center
│   │   └── settings/                # System settings
│   ├── components/                  # Reusable Vue components
│   ├── stores/                      # Pinia state management
│   ├── api/                         # API service layer
│   ├── utils/                       # Utility functions
│   ├── types/                       # TypeScript type definitions
│   ├── styles/                      # Global styles and themes
│   └── layouts/                     # Layout components
├── public/                          # Static assets
└── package.json                     # Frontend dependencies
```

## Configuration Management

### Environment-specific configs:
- `application.yml` - Default configuration
- `application-dev.yml` - Development environment
- `application-prod.yml` - Production environment
- `application-test.yml` - Testing environment

### Docker Compose services:
- Infrastructure: MySQL, Redis, Kafka, Nacos
- Monitoring: Prometheus, Grafana, ELK Stack
- Storage: MinIO object storage

## Naming Conventions

### Java Classes:
- **Controllers**: `{Entity}Controller.java`
- **Services**: `{Entity}Service.java` (interface) + `{Entity}ServiceImpl.java`
- **Entities**: `{Entity}.java`
- **DTOs**: `{Entity}DTO.java`
- **Mappers**: `{Entity}Mapper.java`

### Database Tables:
- Use snake_case: `user_roles`, `order_items`
- Primary keys: `id` (Long, auto-increment)
- Timestamps: `created_at`, `updated_at`

### API Endpoints:
- RESTful pattern: `/api/{service}/{resource}`
- Examples: `/api/users`, `/api/products/{id}`, `/api/orders/{id}/items`

### Vue Components:
- PascalCase for components: `UserManagement.vue`
- kebab-case for files in views: `user-management.vue`

## Testing Structure

```
src/test/java/
├── {service}/
│   ├── controller/                  # Controller tests
│   ├── service/                     # Service layer tests
│   ├── integration/                 # Integration tests
│   └── config/                      # Test configurations
```

## Deployment Structure

### Kubernetes:
```
k8s/
├── infrastructure/                  # Database, cache, messaging
├── monitoring/                      # Prometheus, Grafana
└── namespace.yaml                   # Kubernetes namespace
```

### Helm Charts:
```
helm/erp-system/
├── templates/                       # K8s resource templates
├── values.yaml                      # Default values
├── values-dev.yaml                  # Development values
└── values-prod.yaml                 # Production values
```

## Key Architectural Patterns

- **Database per Service**: Each microservice has its own database
- **API Gateway Pattern**: Single entry point for all client requests
- **Event-Driven Architecture**: Kafka for async communication
- **CQRS**: Separate read/write models where appropriate
- **Circuit Breaker**: Resilience4j for fault tolerance
- **Distributed Tracing**: Zipkin for request tracking