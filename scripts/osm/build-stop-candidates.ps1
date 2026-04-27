param(
    [Parameter(Mandatory=$false)]
    [string]$InputPbf = "",

    [Parameter(Mandatory=$false)]
    [string]$OutputGeoJson = ""
)

$ErrorActionPreference = "Stop"

$RootPath = (Resolve-Path ".\").Path
$ScriptDir = Join-Path $RootPath "scripts\osm"
$TempDir = Join-Path $ScriptDir "temp"

$OutputDir = Join-Path $RootPath "apps\web\public\generated"

if ($InputPbf -eq "") {
    $InputPbf = Join-Path $RootPath "data\osm\hamburg-latest.osm.pbf"
}

if ($OutputGeoJson -eq "") {
    $OutputGeoJson = Join-Path $OutputDir "osm-stop-candidates.geojson"
}

if (-not (Test-Path $InputPbf)) {
    Write-Error "Input PBF not found at $InputPbf. Please provide a valid path to an OSM PBF file."
    Write-Host "Download OSM data from https://download.geofabrik.de/ or use another source."
    exit 1
}

if (-not (Test-Path $TempDir)) {
    New-Item -ItemType Directory -Force -Path $TempDir | Out-Null
}

$TempPbf = Join-Path $TempDir "filtered.osm.pbf"
$TempGeoJsonSeq = Join-Path $TempDir "output.geojsonseq"

if (Test-Path $TempPbf) { Remove-Item -Force $TempPbf }
if (Test-Path $TempGeoJsonSeq) { Remove-Item -Force $TempGeoJsonSeq }

Write-Host "Running osmium tags-filter..." -ForegroundColor Cyan

$osmiumFilterResult = osmium tags-filter $InputPbf `
    n/highway=bus_stop `
    n/public_transport=platform `
    n/public_transport=stop_position `
    -o $TempPbf 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Error "osmium tags-filter failed. Is osmium installed? ( brew install osmium-tool or choco install osmium-tool )"
    exit 1
}

Write-Host "Running osmium export..." -ForegroundColor Cyan

$osmiumExportResult = osmium export $TempPbf `
    -f geojsonseq `
    -o $TempGeoJsonSeq 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Error "osmium export failed"
    exit 1
}

Write-Host "Running CityOps normalizer..." -ForegroundColor Cyan

$normalizeScript = Join-Path $ScriptDir "normalize-stop-candidates.mjs"

$nodeCmd = "node `"$normalizeScript`" --input `"$TempGeoJsonSeq`" --output `"$OutputGeoJson`""

Invoke-Expression $nodeCmd

if ($LASTEXITCODE -ne 0) {
    Write-Error "Normalization failed with exit code $LASTEXITCODE"
    exit 1
}

Write-Host "Stop candidate extraction complete: $OutputGeoJson" -ForegroundColor Green