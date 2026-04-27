[CmdletBinding()]
param (
    [Parameter(Mandatory=$true)]
    [string]$Area
)

$ErrorActionPreference = "Stop"

$RootPath = (Resolve-Path ".\").Path
$AreaFilePath = Join-Path $RootPath "data\areas\${Area}.area.json"

if (-not (Test-Path $AreaFilePath)) {
    Write-Error "Area configuration file not found: $AreaFilePath"
    exit 1
}

$AreaConfig = Get-Content $AreaFilePath -Raw | ConvertFrom-Json

$ExpectedBaseFilePath = Join-Path $RootPath $AreaConfig.routing.expectedBaseFile
if (-not (Test-Path $ExpectedBaseFilePath)) {
    Write-Error "Prepared OSRM data not found at $ExpectedBaseFilePath. Please run scripts\routing\prepare-osrm.ps1 -Area $Area first."
    exit 1
}

# The volume mapped in docker-compose is data/routing/osrm -> /data.
# So we need the path relative to data/routing/osrm, with forward slashes.
$OsrmDir = Join-Path $RootPath "data\routing\osrm"
$AbsExpected = (Resolve-Path $ExpectedBaseFilePath).Path
$AbsOsrm = (Resolve-Path $OsrmDir).Path

if ($AbsExpected.StartsWith($AbsOsrm)) {
    $RelativePath = $AbsExpected.Substring($AbsOsrm.Length).TrimStart('\').TrimStart('/')
    $RelativePath = $RelativePath.Replace('\', '/')
    $env:OSRM_FILE = $RelativePath
} else {
    Write-Error "Expected OSRM file $AbsExpected is not within $AbsOsrm"
    exit 1
}

$DockerComposeDir = Join-Path $RootPath "docker\routing\osrm"

Write-Host "Checking for Docker..."
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue) -and -not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker or docker-compose is not installed or not in PATH."
    exit 1
}

Push-Location $DockerComposeDir
try {
    Write-Host "Starting OSRM container for Area $Area via docker-compose..."
    # Support both docker-compose and docker compose
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        docker-compose up -d
    } else {
        docker compose up -d
    }
    Write-Host "OSRM service is starting on http://localhost:5000" -ForegroundColor Green
} finally {
    Pop-Location
}
