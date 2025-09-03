#!/bin/bash

echo "🚀 Setting up Personal Task Manager..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Backend setup
echo "📦 Setting up backend..."
cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp env.example .env
    echo "⚠️  Please update the .env file with your database credentials and JWT secret"
fi

# Generate Prisma client
echo "Generating Prisma client..."
npm run db:generate

echo "✅ Backend setup complete!"

# Frontend setup
echo "📦 Setting up frontend..."
cd ../frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
fi

echo "✅ Frontend setup complete!"

# Return to root
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Run 'npm run db:push' in the backend directory to set up your database"
echo "3. Start the backend: cd backend && npm run dev"
echo "4. Start the frontend: cd frontend && npm run dev"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "📚 For database setup, you can use:"
echo "   - Neon PostgreSQL (recommended): https://neon.tech"
echo "   - Supabase: https://supabase.com"
echo "   - Railway: https://railway.app" 