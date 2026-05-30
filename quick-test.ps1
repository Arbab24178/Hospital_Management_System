param(
  [string]$Email = "admin@medicore.com",
  [string]$Password = "admin123"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Quick Test: Login Verification ===" -ForegroundColor Cyan

# 1. Ensure PostgreSQL is running
Write-Host "[1/5] Checking PostgreSQL..." -NoNewline
$dbContainer = docker ps --filter "name=db-db" --format "{{.Names}}" 2>$null
if (-not $dbContainer) {
  Write-Host " starting via Docker..." -ForegroundColor Yellow
  docker compose -f DB/docker-compose.yml up -d
  Start-Sleep -Seconds 3
} else {
  Write-Host " running" -ForegroundColor Green
}

# 2. Push Prisma schema
Write-Host "[2/5] Syncing database schema..." -NoNewline
npx prisma db push --skip-generate 2>&1 | Out-Null
Write-Host " done" -ForegroundColor Green

# 3. Seed database
Write-Host "[3/5] Seeding database..." -NoNewline
npm run db:seed 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host " FAILED" -ForegroundColor Red; exit 1 }
Write-Host " done" -ForegroundColor Green

# 4. Start dev server if not already running
Write-Host "[4/5] Checking dev server..." -NoNewline
$portProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if (-not $portProcess) {
  Write-Host " starting..." -ForegroundColor Yellow
  $job = Start-Job -ScriptBlock { npx next dev -p 3000 }
  $job | Wait-Job -Timeout 15 | Out-Null
  Start-Sleep -Seconds 3
} else {
  Write-Host " running" -ForegroundColor Green
}

# 5. Test login
Write-Host "[5/5] Testing login..." -ForegroundColor Cyan
$body = @{ email = $Email; password = $Password } | ConvertTo-Json
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 10
  $data = $response.Content | ConvertFrom-Json
  Write-Host "  User: $($data.user.name) ($($data.user.role))" -ForegroundColor Green
  Write-Host "  Token: $($data.token.Substring(0, 50))..." -ForegroundColor Green
  Write-Host "LOGIN SUCCESS" -ForegroundColor Green
} catch {
  Write-Host "  FAILED: $_" -ForegroundColor Red
  exit 1
}

Write-Host "=== All checks passed ===" -ForegroundColor Cyan
