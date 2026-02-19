#!/bin/bash

# Kill any existing processes on ports 8000 (PHP) and 5173 (Vite)
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

echo "🚀 Starting SAP Security Expert (Local)..."

# Start PHP Server in background
echo "🐘 Starting PHP Server on localhost:8000..."
npm run php-server > php-server.log 2>&1 &
PHP_PID=$!

# Wait for PHP server
sleep 2

# Start Vite Dev Server
echo "⚡ Starting Vite Frontend on localhost:5173..."
npm run dev

# Cleanup on exit
trap "kill $PHP_PID" EXIT
