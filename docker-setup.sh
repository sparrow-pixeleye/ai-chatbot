#!/bin/bash

# APRATIM'S AI 2.0 - Docker Setup Script
# This script sets up the entire project using Docker for maximum compatibility

set -e  # Exit on any error

echo "🐳 Setting up APRATIM'S AI 2.0 with Docker..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker from https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose."
        exit 1
    fi
    
    print_success "Docker $(docker --version) is installed"
    print_success "Docker Compose $(docker-compose --version) is installed"
}

# Create environment file for Docker
setup_docker_env() {
    print_status "Setting up Docker environment..."
    
    cat > .env << 'EOF'
# Docker Environment Variables
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:password@mongodb:27017/apratim-ai-2.0?authSource=admin

# AI API Keys (using placeholder values for development)
OPENAI_API_KEY=sk-placeholder-key-for-development
ANTHROPIC_API_KEY=sk-ant-placeholder-key-for-development
GOOGLE_API_KEY=AIzaSy-placeholder-key-for-development

# JWT Secret
JWT_SECRET=dev-jwt-secret-change-in-production

# CORS
CORS_ORIGIN=http://localhost:3000

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:5000
EOF

    print_success "Created .env file for Docker"
}

# Create MongoDB initialization script
setup_mongo_init() {
    print_status "Setting up MongoDB initialization..."
    
    mkdir -p server/mongo-init
    
    cat > server/mongo-init.js << 'EOF'
// MongoDB initialization script
db = db.getSiblingDB('apratim-ai-2.0');

// Create collections
db.createCollection('chats');
db.createCollection('users');

// Create indexes
db.chats.createIndex({ "userId": 1 });
db.chats.createIndex({ "createdAt": -1 });
db.users.createIndex({ "email": 1 }, { unique: true });

print('MongoDB initialized successfully');
EOF

    print_success "Created MongoDB initialization script"
}

# Build and start services
start_services() {
    print_status "Building and starting services with Docker Compose..."
    
    # Stop any existing containers
    docker-compose down 2>/dev/null || true
    
    # Build and start services
    docker-compose up --build -d
    
    print_success "Services started successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for MongoDB
    print_status "Waiting for MongoDB..."
    timeout=60
    while ! docker-compose exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            print_error "MongoDB failed to start within 60 seconds"
            exit 1
        fi
    done
    print_success "MongoDB is ready"
    
    # Wait for backend
    print_status "Waiting for backend server..."
    timeout=60
    while ! curl -s http://localhost:5000/api/health > /dev/null 2>&1; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            print_error "Backend server failed to start within 60 seconds"
            exit 1
        fi
    done
    print_success "Backend server is ready"
    
    # Wait for frontend
    print_status "Waiting for frontend server..."
    timeout=60
    while ! curl -s http://localhost:3000 > /dev/null 2>&1; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            print_error "Frontend server failed to start within 60 seconds"
            exit 1
        fi
    done
    print_success "Frontend server is ready"
}

# Show service status
show_status() {
    print_status "Service Status:"
    echo ""
    docker-compose ps
    echo ""
    print_success "🎉 APRATIM'S AI 2.0 is running with Docker!"
    echo ""
    print_status "Access the application:"
    print_status "  Frontend: http://localhost:3000"
    print_status "  Backend:  http://localhost:5000"
    print_status "  MongoDB:  localhost:27017"
    echo ""
    print_status "To stop the services:"
    print_status "  docker-compose down"
    echo ""
    print_status "To view logs:"
    print_status "  docker-compose logs -f"
    echo ""
}

# Main setup function
main() {
    echo "🧠 APRATIM'S AI 2.0 - Docker Setup"
    echo "==================================="
    echo ""
    
    # Check prerequisites
    check_docker
    
    # Setup environment
    setup_docker_env
    setup_mongo_init
    
    # Start services
    start_services
    
    # Wait for services
    wait_for_services
    
    # Show status
    show_status
}

# Run main function
main "$@"