#!/bin/bash

# APRATIM'S AI 2.0 - Setup Script
# This script sets up the entire project for local development

set -e  # Exit on any error

echo "🚀 Setting up APRATIM'S AI 2.0..."

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
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    print_success "npm $(npm --version) is installed"
}

# Check if Docker is installed (optional)
check_docker() {
    if command -v docker &> /dev/null; then
        print_success "Docker is available"
        return 0
    else
        print_warning "Docker is not installed. You can install it for easier database setup."
        return 1
    fi
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
    cd server
    npm install
    cd ..
    print_success "Backend dependencies installed"
}

# Install Python dependencies (if needed)
install_python() {
    if [ -f "requirements.txt" ]; then
        print_status "Installing Python dependencies..."
        if command -v pip3 &> /dev/null; then
            pip3 install -r requirements.txt
        elif command -v pip &> /dev/null; then
            pip install -r requirements.txt
        else
            print_warning "Python pip not found. Skipping Python dependencies."
        fi
    fi
}

# Setup environment files
setup_env() {
    print_status "Setting up environment files..."
    
    # Create server .env if it doesn't exist
    if [ ! -f "server/.env" ]; then
        cp server/.env.example server/.env
        print_success "Created server/.env from example"
    else
        print_warning "server/.env already exists, skipping"
    fi
    
    # Create Next.js .env.local if it doesn't exist
    if [ ! -f ".env.local" ]; then
        echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
        print_success "Created .env.local for Next.js"
    else
        print_warning ".env.local already exists, skipping"
    fi
}

# Setup MongoDB with Docker
setup_mongodb() {
    if check_docker; then
        print_status "Setting up MongoDB with Docker..."
        
        # Check if MongoDB container is already running
        if docker ps | grep -q "apratim-ai-mongodb"; then
            print_warning "MongoDB container is already running"
        else
            # Start MongoDB container
            docker run -d \
                --name apratim-ai-mongodb \
                -p 27017:27017 \
                -e MONGO_INITDB_ROOT_USERNAME=admin \
                -e MONGO_INITDB_ROOT_PASSWORD=password \
                -e MONGO_INITDB_DATABASE=apratim-ai-2.0 \
                mongo:7.0
            
            # Wait for MongoDB to be ready
            print_status "Waiting for MongoDB to be ready..."
            sleep 10
            
            print_success "MongoDB is running on localhost:27017"
        fi
    else
        print_warning "Docker not available. Please install MongoDB manually or install Docker."
        print_status "To install MongoDB manually:"
        print_status "  Ubuntu/Debian: sudo apt-get install mongodb"
        print_status "  macOS: brew install mongodb-community"
        print_status "  Windows: Download from https://www.mongodb.com/try/download/community"
    fi
}

# Build the project
build_project() {
    print_status "Building the project..."
    
    # Build backend
    cd server
    npm run build
    cd ..
    
    # Build frontend
    npm run build
    
    print_success "Project built successfully"
}

# Create start script
create_start_script() {
    print_status "Creating start script..."
    
    cat > start.sh << 'EOF'
#!/bin/bash

# APRATIM'S AI 2.0 - Start Script
# This script starts both the backend and frontend servers

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to cleanup background processes
cleanup() {
    print_status "Shutting down servers..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

print_status "Starting APRATIM'S AI 2.0..."

# Start backend server
print_status "Starting backend server on port 5000..."
cd server
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
print_status "Starting frontend server on port 3000..."
cd ..
npm run dev &
FRONTEND_PID=$!

print_success "🚀 APRATIM'S AI 2.0 is running!"
print_success "Frontend: http://localhost:3000"
print_success "Backend API: http://localhost:5000"
print_success "Press Ctrl+C to stop all servers"

# Wait for both processes
wait
EOF

    chmod +x start.sh
    print_success "Created start.sh script"
}

# Main setup function
main() {
    echo "🧠 APRATIM'S AI 2.0 - Setup Script"
    echo "=================================="
    echo ""
    
    # Check prerequisites
    check_node
    check_npm
    
    # Setup environment
    setup_env
    
    # Install dependencies
    install_frontend
    install_backend
    install_python
    
    # Setup database
    setup_mongodb
    
    # Create start script
    create_start_script
    
    echo ""
    print_success "🎉 Setup completed successfully!"
    echo ""
    print_status "To start the application, run:"
    print_status "  ./start.sh"
    echo ""
    print_status "Or start manually:"
    print_status "  Backend:  cd server && npm run dev"
    print_status "  Frontend: npm run dev"
    echo ""
    print_status "The application will be available at:"
    print_status "  Frontend: http://localhost:3000"
    print_status "  Backend:  http://localhost:5000"
    echo ""
}

# Run main function
main "$@"