# Configuration
$env:AWS_PAGER="" # Disable pager
$REGION_APP_RUNNER = "eu-west-1"
$REGION_ECR = "eu-west-3"
$ACCOUNT_ID = "259493838682"
$ECR_REPO_FRONTEND = "$ACCOUNT_ID.dkr.ecr.$REGION_ECR.amazonaws.com/speedywiki-frontend:latest"
$SERVICE_SITE = "speedywiki-site"

Write-Host "Starting SpeedyWiki Frontend Deployment..." -ForegroundColor Green

# 1. Login ECR
Write-Host "Authentification ECR ($REGION_ECR)..."
aws ecr get-login-password --region $REGION_ECR | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION_ECR.amazonaws.com"

# 2. Build & Push Frontend
Write-Host "Build & Push Frontend Image..." -ForegroundColor Cyan
Set-Location site
docker build -t speedywiki-frontend .
docker tag speedywiki-frontend:latest $ECR_REPO_FRONTEND
docker push $ECR_REPO_FRONTEND
Set-Location ..

# 3. Trigger App Runner Deployment
Write-Host "Triggering App Runner deployment for $SERVICE_SITE..." -ForegroundColor Yellow

try {
    $json = aws apprunner list-services --region $REGION_APP_RUNNER --output json
    if ($json) {
        $data = $json | ConvertFrom-Json
        $ServiceArn = $data.ServiceSummaryList | Where-Object { $_.ServiceName -eq $SERVICE_SITE } | Select-Object -ExpandProperty ServiceArn

        if ($ServiceArn) {
            Write-Host "   -> Found: $ServiceArn"
            Write-Host "   -> Starting deployment..."
            aws apprunner start-deployment --service-arn $ServiceArn --region $REGION_APP_RUNNER
        } else {
            Write-Host "   Warning: Service $SERVICE_SITE not found!" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host "Deployment command sent! Check AWS Console." -ForegroundColor Green
