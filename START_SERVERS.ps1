# 🚀 Community Grievance System - Quick Start Script

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Community Grievance System" -ForegroundColor Yellow
Write-Host "Starting Both Servers..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing processes on ports 5000 and 5173/5174
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
try {
    $port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
    if ($port5000) {
        Get-Process -Id $port5000.OwningProcess | Stop-Process -Force
        Write-Host "✅ Killed process on port 5000" -ForegroundColor Green
    }
} catch {
    Write-Host "Port 5000 is free" -ForegroundColor Gray
}

try {
    $port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
    if ($port5173) {
        Get-Process -Id $port5173.OwningProcess | Stop-Process -Force
        Write-Host "✅ Killed process on port 5173" -ForegroundColor Green
    }
} catch {
    Write-Host "Port 5173 is free" -ForegroundColor Gray
}

try {
    $port5174 = Get-NetTCPConnection -LocalPort 5174 -ErrorAction SilentlyContinue
    if ($port5174) {
        Get-Process -Id $port5174.OwningProcess | Stop-Process -Force
        Write-Host "✅ Killed process on port 5174" -ForegroundColor Green
    }
} catch {
    Write-Host "Port 5174 is free" -ForegroundColor Gray
}

Start-Sleep -Seconds 2
Write-Host ""

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend Server
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Cyan
$backendPath = Join-Path $scriptPath "backend"
$backendCmd = "cd `"$backendPath`"; Write-Host 'Backend Server' -ForegroundColor Green; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Cyan
$frontendPath = Join-Path $scriptPath "grievance-citizen"
$frontendCmd = "cd `"$frontendPath`"; Write-Host 'Frontend Server' -ForegroundColor Blue; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Servers Starting!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Check the new terminal windows for server logs" -ForegroundColor Gray
Write-Host ""
Write-Host "Wait 10-15 seconds for servers to fully start," -ForegroundColor Magenta
Write-Host "then open http://localhost:5173 in your browser" -ForegroundColor Magenta
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🔑 Quick Login Credentials:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Admin:" -ForegroundColor Yellow
Write-Host "  Email: admin@example.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Staff (Jangaon):" -ForegroundColor Yellow
Write-Host "  Email: jangaon_staff@example.com" -ForegroundColor White
Write-Host "  Password: staff123" -ForegroundColor White
Write-Host ""
Write-Host "Citizen:" -ForegroundColor Yellow
Write-Host "  Register new account at /register" -ForegroundColor White
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "- FEATURES_COMPLETE.md  - All features implemented" -ForegroundColor White
Write-Host "- TESTING_GUIDE.md      - Complete testing guide" -ForegroundColor White
Write-Host "- README.md             - Project overview" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop this script (servers continue running)" -ForegroundColor Gray
Write-Host ""

# Keep script running
while ($true) {
    Start-Sleep -Seconds 60
}
