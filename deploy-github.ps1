# WalletLedger Hub GitHub Pages Deploy Helper Script

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "Preparing to deploy WalletLedger Hub to GitHub Pages..." -ForegroundColor Cyan
Write-Host "For GitHub Account: Reazul94" -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host ""

Write-Host "IMPORTANT STEP:" -ForegroundColor Yellow
Write-Host "Please make sure you have created an empty repository named 'expense-loan-ledger' on your GitHub account (https://github.com/new)." -ForegroundColor Yellow
Write-Host "Do NOT initialize it with a README, license, or .gitignore." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Have you created the repository on GitHub? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Please create the repository first, then run this script again." -ForegroundColor Red
    exit
}

# 1. Rename branch to main
Write-Host "1. Setting branch to main..." -ForegroundColor Yellow
git branch -M main

# 2. Add remote origin
Write-Host "2. Linking local repository to GitHub remote..." -ForegroundColor Yellow
$remoteExists = git remote | Select-String "origin"
if ($remoteExists) {
    git remote remove origin
}
git remote add origin https://github.com/Reazul94/expense-loan-ledger.git

# 3. Push code to GitHub
Write-Host "3. Pushing code to GitHub (main branch)..." -ForegroundColor Yellow
Write-Host "If prompted, please authenticate with your GitHub credentials." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to push code to GitHub. Please check your network or GitHub authentication." -ForegroundColor Red
    exit
}

# 4. Deploy to GitHub Pages
Write-Host "4. Initiating deployment to GitHub Pages..." -ForegroundColor Yellow
npm run deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "GitHub Pages deployment failed. Please check build logs." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "SUCCESS!" -ForegroundColor Green
Write-Host "Your website is live at: https://Reazul94.github.io/expense-loan-ledger/" -ForegroundColor Green
Write-Host "Note: It might take 1-2 minutes for GitHub to finish building the Pages site after push." -ForegroundColor Yellow
