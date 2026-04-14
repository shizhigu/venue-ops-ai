#!/bin/bash

echo "🚀 Starting Venue Ops LangGraph Service..."

# Navigate to project directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating one..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    echo "✅ Activating virtual environment..."
    source venv/bin/activate
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your configuration"
fi

# Start the service
echo "🎯 Starting FastAPI server on http://localhost:8001"
echo "📚 API Documentation: http://localhost:8001/docs"
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn app.main:app --reload --port 8001