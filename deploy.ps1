# WalletLedger Hub Vercel Deploy Helper Script

Write-Host "--------------------------------------------------" -ForegroundColor Indigo
Write-Host "Preparing to deploy WalletLedger Hub to Vercel..." -ForegroundColor Indigo
Write-Host "--------------------------------------------------" -ForegroundColor Indigo

# 1. Run production build
Write-Host "1. Running production build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Please check your code for errors." -ForegroundColor Red
    exit
}

Write-Host "Build successful!" -ForegroundColor Green
Write-Host ""

# 2. Deploy to Vercel
Write-Host "2. Initiating Vercel deployment..." -ForegroundColor Yellow
Write-Host "If this is your first time, Vercel will open a browser window for you to log in." -ForegroundColor Green
Write-Host "Follow the prompts in your terminal (press Enter to accept defaults)." -ForegroundColor Cyan
Write-Host ""

npx vercel
