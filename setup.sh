#!/bin/bash

# APRATIM'S AI 2.0 Setup Script
# This script sets up the development environment

set -e

echo "🧠 Setting up APRATIM'S AI 2.0..."
echo "=================================="

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

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if MongoDB is running
check_mongodb() {
    if ! command -v mongod &> /dev/null; then
        print_warning "MongoDB is not installed. Please install MongoDB 6+ first."
        print_warning "You can install it from: https://www.mongodb.com/try/download/community"
        return 1
    fi
    
    if ! pgrep -x "mongod" > /dev/null; then
        print_warning "MongoDB is not running. Please start MongoDB first."
        print_warning "You can start it with: mongod --dbpath /path/to/your/db"
        return 1
    fi
    
    print_success "MongoDB is running"
}

# Install frontend dependencies
install_frontend() {
    print_status "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
}

# Install backend dependencies
install_backend() {
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
}

# Setup environment files
setup_env() {
    print_status "Setting up environment files..."
    
    if [ ! -f .env.local ]; then
        cp .env.example .env.local
        print_success "Created .env.local file"
        print_warning "Please edit .env.local with your API keys"
    else
        print_warning ".env.local already exists, skipping..."
    fi
    
    if [ ! -f backend/.env ]; then
        cp backend/.env.example backend/.env
        print_success "Created backend/.env file"
        print_warning "Please edit backend/.env with your configuration"
    else
        print_warning "backend/.env already exists, skipping..."
    fi
}

# Build the project
build_project() {
    print_status "Building the project..."
    
    # Build frontend
    print_status "Building frontend..."
    npm run build
    
    # Build backend
    print_status "Building backend..."
    cd backend
    npm run build
    cd ..
    
    print_success "Project built successfully"
}

# Start development servers
start_dev() {
    print_status "Starting development servers..."
    print_warning "This will start both frontend and backend servers"
    print_warning "Press Ctrl+C to stop both servers"
    
    # Start both servers in background
    npm run full-dev &
    
    # Wait for user to stop
    wait
}

# Main setup function
main() {
    echo ""
    print_status "Starting APRATIM'S AI 2.0 setup..."
    echo ""
    
    # Check prerequisites
    check_node
    check_mongodb || print_warning "MongoDB check failed, but continuing..."
    
    echo ""
    
    # Install dependencies
    install_frontend
    install_backend
    
    echo ""
    
    # Setup environment
    setup_env
    
    echo ""
    
    # Build project
    build_project
    
    echo ""
    print_success "Setup completed successfully! 🎉"
    echo ""
    print_status "Next steps:"
    echo "1. Edit .env.local with your OpenAI API key"
    echo "2. Edit backend/.env with your configuration"
    echo "3. Make sure MongoDB is running"
    echo "4. Run 'npm run full-dev' to start development servers"
    echo ""
    print_status "For more information, see README.md"
    echo ""
    
    # Ask if user wants to start development servers
    read -p "Do you want to start the development servers now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_dev
    else
        print_status "You can start the servers later with: npm run full-dev"
    fi
}

# Run main function
main "$@"