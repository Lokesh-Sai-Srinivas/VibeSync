# Helper script to start VibeSync with Docker

Write-Host "Checking if Docker is running..." -ForegroundColor Cyan
try {
    docker ps > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    }
} catch {
    Write-Error "Docker command not found. Please install Docker Desktop."
    exit 1
}

Write-Host "Building and starting VibeSync containers..." -ForegroundColor Green
docker-compose up --build -d

Write-Host "VibeSync is starting!" -ForegroundColor Green
Write-Host "To view logs, run: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "To stop the app, run: docker-compose down" -ForegroundColor Yellow

$hostIp = (ipconfig | Select-String -Pattern "IPv4 Address" | Select-Object -First 1).ToString().Split(":")[1].Trim()
Write-Host "`nYour Host IP is: $hostIp" -ForegroundColor Cyan
Write-Host "Make sure your phone is on the same Wi-Fi network." -ForegroundColor Green
