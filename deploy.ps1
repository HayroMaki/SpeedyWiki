# Configuration
$env:AWS_PAGER="" # Disable pager to prevent "cat not found" errors on Windows
$REGION_APP_RUNNER = "eu-west-1"
$REGION_ECR = "eu-west-3"
$ACCOUNT_ID = "259493838682"
$ECR_REPO_BACKEND = "$ACCOUNT_ID.dkr.ecr.$REGION_ECR.amazonaws.com/speedywiki-backend:latest"
$ECR_REPO_FRONTEND = "$ACCOUNT_ID.dkr.ecr.$REGION_ECR.amazonaws.com/speedywiki-frontend:latest"

# NOTE: App Runner services (names must match what you created)
$SERVICE_API = "speedywiki-api"
$SERVICE_SITE = "speedywiki-site"

Write-Host "Starting SpeedyWiki deployment..." -ForegroundColor Green

# 1. Login ECR
Write-Host "Authentification ECR ($REGION_ECR)..."
aws ecr get-login-password --region $REGION_ECR | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION_ECR.amazonaws.com"

# --- BACKEND (API) ---
Write-Host "Build & Push Backend (for API)..." -ForegroundColor Cyan
Set-Location backend
docker build -t speedywiki-backend .
docker tag speedywiki-backend:latest $ECR_REPO_BACKEND
docker push $ECR_REPO_BACKEND
Set-Location ..

# --- FRONTEND ---
Write-Host "Build & Push Frontend..." -ForegroundColor Cyan
Set-Location site
docker build -t speedywiki-frontend .
docker tag speedywiki-frontend:latest $ECR_REPO_FRONTEND
docker push $ECR_REPO_FRONTEND
Set-Location ..

# --- DEPLOYMENTS (APP RUNNER) ---
Write-Host "Triggering App Runner deployments ($REGION_APP_RUNNER)..." -ForegroundColor Yellow

function Start-Deploy {
    param ($ServiceName)
    Write-Host "Looking for service $ServiceName..."

    try {
        # Using specific query to avoid large JSON output issue if any
        $json = aws apprunner list-services --region $REGION_APP_RUNNER --output json
        if ($json) {
            $data = $json | ConvertFrom-Json
            $ServiceArn = $data.ServiceSummaryList | Where-Object { $_.ServiceName -eq $ServiceName } | Select-Object -ExpandProperty ServiceArn

            if ($ServiceArn) {
                Write-Host "   -> Found: $ServiceArn"
                Write-Host "   -> Starting deployment..."
                aws apprunner start-deployment --service-arn $ServiceArn --region $REGION_APP_RUNNER
            } else {
                Write-Host "   Warning: Service $ServiceName not found!" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "   Error: $_" -ForegroundColor Red
    }
}

Start-Deploy $SERVICE_API
Start-Deploy $SERVICE_SITE

# --- DEPLOYMENT (LIGHTSAIL WS) ---
Write-Host "Triggering Lightsail deployment (WebSocket)..." -ForegroundColor Yellow
# We call the specific script for Lightsail which handles its own build/push to Lightsail registry
powershell -ExecutionPolicy Bypass -File ./deploy-ws.ps1

Write-Host "Global Deployment commands sent! Check AWS Console." -ForegroundColor Green
