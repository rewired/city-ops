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

# Validate required shape
if (-not $AreaConfig.sourcePbfFile) { Write-Error "Missing 'sourcePbfFile' in $AreaFilePath"; exit 1 }
if (-not $AreaConfig.routing) { Write-Error "Missing 'routing' configuration in $AreaFilePath"; exit 1 }
if ($AreaConfig.routing.engine -ne "osrm") { Write-Error "Routing engine is not 'osrm' in $AreaFilePath"; exit 1 }
if ($AreaConfig.routing.profile -ne "car") { Write-Error "Routing profile is not 'car' in $AreaFilePath"; exit 1 }
if ($AreaConfig.routing.algorithm -ne "mld") { Write-Error "Routing algorithm is not 'mld' in $AreaFilePath"; exit 1 }
if (-not $AreaConfig.routing.baseName) { Write-Error "Missing 'routing.baseName' in $AreaFilePath"; exit 1 }
if (-not $AreaConfig.routing.expectedBaseFile) { Write-Error "Missing 'routing.expectedBaseFile' in $AreaFilePath"; exit 1 }

$PbfFilePath = Join-Path $RootPath $AreaConfig.sourcePbfFile
if (-not (Test-Path $PbfFilePath)) {
    Write-Error "Source PBF not found at $PbfFilePath."
    exit 1
}

$ExpectedBaseFilePath = Join-Path $RootPath $AreaConfig.routing.expectedBaseFile
$AreaOsrmDir = Split-Path $ExpectedBaseFilePath -Parent

Write-Host "Checking for Docker..."
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in PATH."
    exit 1
}

Write-Host "Ensuring area OSRM directory exists at $AreaOsrmDir..."
if (-not (Test-Path $AreaOsrmDir)) {
    New-Item -ItemType Directory -Force -Path $AreaOsrmDir | Out-Null
    Write-Host "Created directory."
}

$BaseName = $AreaConfig.routing.baseName

# Docker mounts:
# - area-specific OSRM output directory as /data
# - configured source PBF into /data/${BaseName}.osm.pbf (read-only input)
$DockerRunBase = "docker run -t --rm -v ""${AreaOsrmDir}:/data"" -v ""${PbfFilePath}:/data/${BaseName}.osm.pbf:ro"" osrm/osrm-backend"

Write-Host "Running osrm-extract..."
Invoke-Expression "$DockerRunBase osrm-extract -p /opt/car.lua /data/${BaseName}.osm.pbf"

Write-Host "Running osrm-partition..."
Invoke-Expression "$DockerRunBase osrm-partition /data/${BaseName}.osrm"

Write-Host "Running osrm-customize..."
Invoke-Expression "$DockerRunBase osrm-customize /data/${BaseName}.osrm"

Write-Host "OSRM area asset preparation complete." -ForegroundColor Green
