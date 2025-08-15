#!/bin/bash
# complete-linux-setup.sh - Complete Student Portal Setup for Linux

set -e  # Exit on any error

echo "🐧 Complete Student Portal Setup for Linux"
echo "=========================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js
install_nodejs() {
    if ! command_exists node; then
        echo "📦 Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        echo "✅ Node.js already installed: $(node --version)"
    fi
}

# Function to install Python
install_python() {
    if ! command_exists python3; then
        echo "🐍 Installing Python..."
        sudo apt install -y python3 python3-pip
    else
        echo "✅ Python already installed: $(python3 --version)"
    fi
}

# Function to install PostgreSQL
install_postgresql() {
    if ! command_exists psql; then
        echo "🗄️ Installing PostgreSQL..."
        sudo apt install -y postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    else
        echo "✅ PostgreSQL already installed: $(psql --version | head -n1)"
    fi
}

# Function to setup database
setup_database() {
    echo "🗄️ Setting up PostgreSQL database..."
    
    # Check if user already exists
    if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='postgres'" | grep -q 1; then
        echo "✅ PostgreSQL user 'postgres' already exists"
    else
        echo "Creating PostgreSQL user..."
        sudo -u postgres psql << EOF
CREATE USER postgres WITH PASSWORD '1234';
ALTER USER postgres CREATEDB;
EOF
    fi
    
    # Check if database already exists
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw autograder; then
        echo "✅ Database 'autograder' already exists"
    else
        echo "Creating database..."
        sudo -u postgres psql << EOF
CREATE DATABASE autograder OWNER postgres;
GRANT ALL PRIVILEGES ON DATABASE autograder TO postgres;
EOF
    fi
}

# Function to create environment files
create_env_files() {
    echo "📝 Creating environment files..."
    
    # Server .env
    if [ ! -f "server/.env" ]; then
        cat > server/.env << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:1234@localhost:5432/autograder?schema=public"

# Server Configuration
PORT=5000
SESSION_SECRET="2f1675a8d2ba367fede9a8f1805c4f27100471791c3a1c8c1436b465b97ea6a8"
SERVER_URL=http://localhost:5000/api
CLIENT_URL=http://localhost:3000
FLASK_API_URL=http://localhost:5001

# GitHub OAuth (Development)
GITHUB_CLIENT_ID=Ov23liVEq0B0c2ctvNVH
GITHUB_CLIENT_SECRET=be110f9ffc3e71dc7016bbf011c5d9ac93b505da

# Node Environment
NODE_ENV=development
EOF
        echo "✅ Created server/.env"
    else
        echo "✅ server/.env already exists"
    fi
    
    # Client .env
    if [ ! -f "client/.env" ]; then
        cat > client/.env << 'EOF'
GENERATE_SOURCEMAP=false
ESLINT_NO_DEV_ERRORS=true
REACT_APP_API_URL=http://localhost:5000/api
EOF
        echo "✅ Created client/.env"
    else
        echo "✅ client/.env already exists"
    fi
    
    # Flask .env
    if [ ! -f "scripts/google-docs/.env" ]; then
        cat > scripts/google-docs/.env << 'EOF'
FLASK_ENV=development
FLASK_DEBUG=True
GOOGLE_SCOPES=https://www.googleapis.com/auth/documents.readonly
EOF
        echo "✅ Created scripts/google-docs/.env"
    else
        echo "✅ scripts/google-docs/.env already exists"
    fi
}

# Function to setup Prisma
setup_prisma() {
    echo "🔧 Setting up Prisma..."
    cd server
    
    # Generate Prisma client
    echo "Generating Prisma client..."
    npx prisma generate
    
    # Push database schema
    echo "Pushing database schema..."
    npx prisma db push
    
    cd ..
    echo "✅ Prisma setup complete"
}

# Function to install project dependencies
install_dependencies() {
    echo "📦 Installing project dependencies..."
    
    # Root dependencies (if any)
    if [ -f "package.json" ]; then
        echo "Installing root dependencies..."
        npm install
    fi
    
    # Backend dependencies
    echo "🌐 Installing backend dependencies..."
    cd server && npm install && cd ..
    
    # Frontend dependencies
    echo "⚛️ Installing frontend dependencies..."
    cd client && npm install && cd ..
    
    # Python dependencies
    echo "🐍 Installing Python dependencies..."
    cd scripts/google-docs
    pip3 install -r requirements.txt || pip install -r requirements.txt
    cd ../..
    
    echo "✅ All dependencies installed!"
}

# Function to create startup script
create_startup_script() {
    echo "🚀 Creating startup script..."
    
    cat > start-dev.sh << 'EOF'
#!/bin/bash
# start-dev.sh - Start all Student Portal services

echo "🚀 Starting Student Portal..."
echo "=============================="

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID $FRONTEND_PID $FLASK_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Start backend
echo "🌐 Starting backend server..."
cd server && npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "⚛️ Starting frontend server..."
cd client && npm start &
FRONTEND_PID=$!
cd ..

# Start Flask API
echo "🐍 Starting Flask API..."
cd scripts/google-docs && python3 docs_api.py &
FLASK_PID=$!
cd ../..

echo ""
echo "✅ All services started!"
echo "================================"
echo "📱 Frontend:  http://localhost:3000"
echo "🌐 Backend:   http://localhost:5000/api"
echo "🐍 Flask API: http://localhost:5001"
echo "================================"
echo "Press Ctrl+C to stop all services"

# Wait for all processes
wait
EOF
    
    chmod +x start-dev.sh
    echo "✅ Created start-dev.sh"
}

# Function to create credentials directory
create_credentials_dir() {
    echo "📁 Creating credentials directory..."
    mkdir -p credentials
    
    cat > credentials/README.md << 'EOF'
# Credentials Directory

## Google Service Account
Place your Google Service Account JSON file here as:
`doc_reader_service_account.json`

To get this file:
1. Go to Google Cloud Console
2. Create a Service Account
3. Download the JSON key file
4. Rename it to `doc_reader_service_account.json`
5. Place it in this directory

## Security Note
This directory should be added to .gitignore to prevent committing sensitive credentials.
EOF
    
    echo "✅ Created credentials directory with README"
}

# Main setup function
main() {
    echo "Starting setup process..."
    echo ""
    
    # Update system
    echo "📋 Updating system packages..."
    sudo apt update
    
    # Install prerequisites
    install_nodejs
    install_python
    install_postgresql
    
    # Setup database
    setup_database
    
    # Install project dependencies
    install_dependencies
    
    # Create environment files
    create_env_files
    
    # Setup Prisma
    setup_prisma
    
    # Create startup script
    create_startup_script
    
    # Create credentials directory
    create_credentials_dir
    
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    echo "📋 Next Steps:"
    echo "1. Add your Google Service Account JSON to credentials/"
    echo "2. Run: ./start-dev.sh"
    echo "3. Visit http://localhost:3000"
    echo ""
    echo "🔧 Manual Commands:"
    echo "• Start all services: ./start-dev.sh"
    echo "• Start backend only: cd server && npm run dev"
    echo "• Start frontend only: cd client && npm start"
    echo "• Start Flask API only: cd scripts/google-docs && python3 docs_api.py"
    echo ""
    echo "🗄️ Database Info:"
    echo "• Host: localhost"
    echo "• Port: 5432"
    echo "• Database: autograder"
    echo "• User: postgres"
    echo "• Password: 1234"
    echo ""
    echo "Happy coding! 🚀"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please don't run this script as root (without sudo)"
    echo "The script will ask for sudo when needed"
    exit 1
fi

# Run main function
main "$@"
EOF