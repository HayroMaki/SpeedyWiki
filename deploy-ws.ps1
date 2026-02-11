# Configuration
$env:AWS_PAGER=""
$REGION = "eu-west-1"
$SERVICE_NAME = "speedywiki-ws-service"
$IMAGE_LABEL = "speedywiki-ws"
$LOCAL_IMAGE = "speedywiki-backend:latest"

# Ensure lightsailctl is in path (assuming it's in the current directory)
$currentDir = Get-Location
$env:Path += ";$currentDir"

Write-Host "Starting SpeedyWiki WebSocket Deployment to Lightsail..." -ForegroundColor Green

# 1. Build Backend
Write-Host "Building Backend Image..." -ForegroundColor Cyan
Set-Location backend
docker build -t $LOCAL_IMAGE .
Set-Location ..

# 2. Push to Lightsail
Write-Host "Pushing image to Lightsail (this may take a while)..." -ForegroundColor Cyan
# The output is text, not JSON, because of the lightsailctl plugin.
# We capture both stdout and stderr.
$pushOutput = aws lightsail push-container-image --region $REGION --service-name $SERVICE_NAME --label $IMAGE_LABEL --image $LOCAL_IMAGE 2>&1 | Out-String

Write-Host "Raw Push Output: $pushOutput"

# Extract the image identifier using regex
# Pattern: Refer to this image as ":speedywiki-ws-service.speedywiki-ws.1"
if ($pushOutput -match 'Refer to this image as "([^"]+)"') {
    $imageIdentifier = $matches[1]
    Write-Host "Image pushed successfully: $imageIdentifier" -ForegroundColor Green
} else {
    Write-Host "Error: Could not find image identifier in push output." -ForegroundColor Red
    exit 1
}

# Load .env variables
$envParams = @{}
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^\s*([^#=]+)\s*=\s*(.*)") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            $envParams[$name] = $value
        }
    }
} else {
    Write-Host "Error: .env file not found in root directory!" -ForegroundColor Red
    exit 1
}

# 3. Create Deployment
Write-Host "Creating Deployment..." -ForegroundColor Yellow

$containerConfig = @{
    containers = @{
        ($SERVICE_NAME) = @{
            image = $imageIdentifier
            command = @("node", "websocket.js")
            environment = @{
                "WS_PORT" = "3002"
                "MONGO_URI" = $envParams["MONGO_URI"]
                "REDIS_USERNAME" = $envParams["REDIS_USERNAME"]
                "REDIS_PASSWORD" = $envParams["REDIS_PASSWORD"]
                "REDIS_HOST" = $envParams["REDIS_HOST"]
                "REDIS_PORT" = $envParams["REDIS_PORT"]
            }
            ports = @{
                "3002" = "HTTP"
            }
        }
    }
    publicEndpoint = @{
        containerName = $SERVICE_NAME
        containerPort = 3002
        healthCheck = @{
            path = "/"
            intervalSeconds = 10
        }
    }
}

# Save config to temp json file because passing complex json via CLI args in PS is a nightmare
$configJson = $containerConfig | ConvertTo-Json -Depth 4
$configJson | Out-File -FilePath "lightsail-deploy-config.json" -Encoding ASCII

try {
    aws lightsail create-container-service-deployment --region $REGION --service-name $SERVICE_NAME --cli-input-json file://lightsail-deploy-config.json
    Write-Host "Deployment triggered successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error triggering deployment: $_" -ForegroundColor Red
} finally {
    Remove-Item "lightsail-deploy-config.json" -ErrorAction SilentlyContinue
}

Write-Host "Monitor deployment status with: aws lightsail get-container-services --service-name $SERVICE_NAME --region $REGION" -ForegroundColor Gray
