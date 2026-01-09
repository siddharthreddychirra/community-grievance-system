# AI-Powered Community Grievance Redressal System
# Quick Install Script for Windows PowerShell

Write-Host "============================================" -ForegroundColor Green
Write-Host "AI-Powered Grievance System - Setup" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
Write-Host ""

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoVersion = mongod --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ MongoDB found" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB not found. You can use MongoDB Atlas instead." -ForegroundColor Yellow
    Write-Host "   Sign up at: https://www.mongodb.com/cloud/atlas" -ForegroundColor Yellow
}
Write-Host ""

# Install Backend Dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Setup Backend .env
if (-not (Test-Path ".env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created backend/.env - Please edit with your configuration" -ForegroundColor Green
    Write-Host "   Required: MONGO_URI, JWT_SECRET" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  backend/.env already exists" -ForegroundColor Yellow
}
Write-Host ""

# Create uploads directory
if (-not (Test-Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads" | Out-Null
    Write-Host "✅ Created uploads directory" -ForegroundColor Green
} else {
    Write-Host "⚠️  uploads directory already exists" -ForegroundColor Yellow
}
Write-Host ""

# Install Frontend Dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ../grievance-citizen
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Setup Frontend .env
if (-not (Test-Path ".env")) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created grievance-citizen/.env - Please edit with your API keys" -ForegroundColor Green
    Write-Host "   Required: VITE_GOOGLE_MAPS_API_KEY" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  grievance-citizen/.env already exists" -ForegroundColor Yellow
}
Write-Host ""

# Return to root
Set-Location ..

Write-Host "============================================" -ForegroundColor Green
Write-Host "✅ INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Edit backend/.env with your MongoDB URI" -ForegroundColor White
Write-Host "2. Edit grievance-citizen/.env with your Google Maps API key" -ForegroundColor White
Write-Host "3. Run: cd backend && npm run seed" -ForegroundColor White
Write-Host "4. Start backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "5. Start frontend (new terminal): cd grievance-citizen && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📚 See QUICKSTART.md for detailed setup instructions" -ForegroundColor Yellow
Write-Host ""
