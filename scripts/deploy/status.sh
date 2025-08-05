#!/bin/bash

# Deployment Status Check Script
# Shows the current status of all services and infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║                    📊 System Status 📊                       ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_docker_services() {
    echo -e "${YELLOW}Docker Services Status:${NC}"
    echo "========================"
    
    if command -v docker-compose &> /dev/null; then
        if [ -f "docker-compose.yml" ]; then
            docker-compose ps
        else
            echo -e "${RED}docker-compose.yml not found${NC}"
        fi
    else
        echo -e "${RED}Docker Compose not available${NC}"
    fi
    echo ""
}

check_development_processes() {
    echo -e "${YELLOW}Development Processes:${NC}"
    echo "======================"
    
    # Check for Spring Boot processes
    SPRING_PROCESSES=$(pgrep -f "spring-boot:run" 2>/dev/null || true)
    if [ ! -z "$SPRING_PROCESSES" ]; then
        echo -e "${GREEN}✓ Backend services running${NC}"
        echo "PIDs: $SPRING_PROCESSES"
    else
        echo -e "${RED}✗ No backend services running${NC}"
    fi
    
    # Check for npm dev processes
    NPM_PROCESSES=$(pgrep -f "npm run dev" 2>/dev/null || true)
    if [ ! -z "$NPM_PROCESSES" ]; then
        echo -e "${GREEN}✓ Frontend dev server running${NC}"
        echo "PIDs: $NPM_PROCESSES"
    else
        echo -e "${RED}✗ No frontend dev server running${NC}"
    fi
    echo ""
}

check_ports() {
    echo -e "${YELLOW}Port Status:${NC}"
    echo "============"
    
    PORTS=(3000 8080 8001 8002 8003 8004 8005 8006 8007 3306 6379 9092 8848)
    
    for port in "${PORTS[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            PROCESS=$(lsof -Pi :$port -sTCP:LISTEN | tail -n 1 | awk '{print $1}')
            echo -e "Port $port: ${GREEN}✓ OPEN${NC} ($PROCESS)"
        else
            echo -e "Port $port: ${RED}✗ CLOSED${NC}"
        fi
    done
    echo ""
}

check_service_health() {
    echo -e "${YELLOW}Service Health:${NC}"
    echo "==============="
    
    # Check API Gateway
    if curl -s http://localhost:8080/actuator/health >/dev/null 2>&1; then
        echo -e "API Gateway: ${GREEN}✓ HEALTHY${NC}"
    else
        echo -e "API Gateway: ${RED}✗ UNHEALTHY${NC}"
    fi
    
    # Check Frontend
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "Frontend: ${GREEN}✓ ACCESSIBLE${NC}"
    else
        echo -e "Frontend: ${RED}✗ NOT ACCESSIBLE${NC}"
    fi
    
    # Check Nacos
    if curl -s http://localhost:8848/nacos/v1/console/health/readiness >/dev/null 2>&1; then
        echo -e "Nacos: ${GREEN}✓ READY${NC}"
    else
        echo -e "Nacos: ${RED}✗ NOT READY${NC}"
    fi
    echo ""
}

show_access_info() {
    echo -e "${BLUE}Access Information:${NC}"
    echo "==================="
    echo -e "Frontend:           ${GREEN}http://localhost:3000${NC}"
    echo -e "API Gateway:        ${GREEN}http://localhost:8080${NC}"
    echo -e "Nacos Console:      ${GREEN}http://localhost:8848/nacos${NC}"
    echo -e "Health Check:       ${GREEN}http://localhost:8080/actuator/health${NC}"
    echo ""
}

show_useful_commands() {
    echo -e "${BLUE}Useful Commands:${NC}"
    echo "================"
    echo -e "Deploy system:      ${YELLOW}make deploy${NC}"
    echo -e "Start development:  ${YELLOW}make dev${NC}"
    echo -e "View logs:          ${YELLOW}make logs${NC}"
    echo -e "Stop services:      ${YELLOW}make stop${NC}"
    echo -e "Health check:       ${YELLOW}make health${NC}"
    echo ""
}

main() {
    print_header
    check_docker_services
    check_development_processes
    check_ports
    check_service_health
    show_access_info
    show_useful_commands
}

main