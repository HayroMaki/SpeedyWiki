# Deployment Status Checker for SpeedyWiki
$ErrorActionPreference = "Stop"
$env:AWS_PAGER = ""  # Disable AWS CLI pager

$REGION_APP_RUNNER = "eu-west-1"
$REGION_LIGHTSAIL = "eu-west-1"
$APP_RUNNER_SERVICES = @("speedywiki-site", "speedywiki-api")
$LIGHTSAIL_SERVICE = "speedywiki-ws-service"

Write-Host "=== SpeedyWiki Deployment Status ===" -ForegroundColor Cyan

function Show-AppRunnerStatus {
    param (
        [string]$ServiceName,
        $ServiceSummaries,
        [string]$Region
    )

    $summary = $ServiceSummaries | Where-Object { $_.ServiceName -eq $ServiceName }
    if (-not $summary) {
        Write-Host "[App Runner] $ServiceName : Not found" -ForegroundColor Red
        return
    }

    try {
        $details = aws apprunner describe-service --service-arn $summary.ServiceArn --region $Region --output json | ConvertFrom-Json
        $service = $details.Service
        Write-Host "[App Runner] $ServiceName" -ForegroundColor Green
        Write-Host "  Status : $($service.Status)"
        if ($service.ServiceUrl) { Write-Host "  URL    : $($service.ServiceUrl)" }
        Write-Host "  Created: $($service.CreatedAt)"
        Write-Host "  Updated: $($service.UpdatedAt)"
        Write-Host ""
    } catch {
        Write-Host "[App Runner] $ServiceName : Error retrieving details -> $_" -ForegroundColor Red
    }
}

try {
    $appRunnerList = aws apprunner list-services --region $REGION_APP_RUNNER --output json | ConvertFrom-Json
    foreach ($serviceName in $APP_RUNNER_SERVICES) {
        Show-AppRunnerStatus -ServiceName $serviceName -ServiceSummaries $appRunnerList.ServiceSummaryList -Region $REGION_APP_RUNNER
    }
} catch {
    Write-Host "Failed to list App Runner services: $_" -ForegroundColor Red
}

try {
    $lsResponse = aws lightsail get-container-services --service-name $LIGHTSAIL_SERVICE --region $REGION_LIGHTSAIL --output json | ConvertFrom-Json
    $service = $lsResponse.containerServices[0]
    if ($service) {
        Write-Host "[Lightsail] $LIGHTSAIL_SERVICE" -ForegroundColor Green
        Write-Host "  State    : $($service.state)"
        Write-Host "  Scale    : $($service.scale) ($($service.power))"
        if ($service.url) { Write-Host "  URL      : $($service.url)" }
        if ($service.currentDeployment) {
            Write-Host "  Current Deployment : Version $($service.currentDeployment.version) - $($service.currentDeployment.state)"
        }
        if ($service.nextDeployment) {
            Write-Host "  Next Deployment    : Version $($service.nextDeployment.version) - $($service.nextDeployment.state)"
        }
        Write-Host ""
    } else {
        Write-Host "[Lightsail] $LIGHTSAIL_SERVICE : Service not found" -ForegroundColor Red
    }
} catch {
    Write-Host "Failed to get Lightsail service status: $_" -ForegroundColor Red
}
