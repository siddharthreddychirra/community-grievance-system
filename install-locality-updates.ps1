# Installation Script for Locality System Updates

Write-Host "Installing required dependencies for locality system..." -ForegroundColor Green

# Navigate to backend directory
Set-Location backend

Write-Host "`nInstalling @google/generative-ai for image validation..." -ForegroundColor Yellow
npm install @google/generative-ai

Write-Host "`n✅ Dependencies installed successfully!" -ForegroundColor Green

Write-Host "`n📝 Important: Update your .env file with:" -ForegroundColor Cyan
Write-Host "GEMINI_API_KEY=your_google_gemini_api_key" -ForegroundColor White

Write-Host "`nTo get a Gemini API key:" -ForegroundColor Yellow
Write-Host "1. Visit https://makersuite.google.com/app/apikey" -ForegroundColor White
Write-Host "2. Click 'Create API Key'" -ForegroundColor White
Write-Host "3. Copy and paste it in your .env file" -ForegroundColor White

# Navigate back
Set-Location ..

Write-Host "`n🚀 Setup complete! Start the backend server with: npm run dev" -ForegroundColor Green
