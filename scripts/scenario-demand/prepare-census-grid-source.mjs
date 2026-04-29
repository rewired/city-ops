import fs from 'node:fs';
import path from 'node:path';
import proj4 from 'proj4';

// Define EPSG:3035
proj4.defs('EPSG:3035', '+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

function fail(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

function splitCsvLine(line, delimiter) {
  const result = [];
  let inQuotes = false;
  let currentStr = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(currentStr);
      currentStr = '';
    } else {
      currentStr += char;
    }
  }
  result.push(currentStr);

  if (inQuotes) {
    throw new Error('Unclosed quotes in CSV line');
  }

  return result;
}

function main() {
  const args = process.argv.slice(2);
  
  let scenarioPath = null;
  let inputPath = null;
  let outputPath = null;
  let manifestOutputPath = null;
  
  let idColumn = 'grid_id';
  let populationColumn = 'population';
  let longitudeColumn = 'lng';
  let latitudeColumn = 'lat';
  let delimiter = ',';
  let inputCrs = 'epsg:4326';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--scenario') {
      scenarioPath = args[i + 1];
      i++;
    } else if (args[i] === '--input') {
      inputPath = args[i + 1];
      i++;
    } else if (args[i] === '--output') {
      outputPath = args[i + 1];
      i++;
    } else if (args[i] === '--manifest-output') {
      manifestOutputPath = args[i + 1];
      i++;
    } else if (args[i] === '--id-column') {
      idColumn = args[i + 1];
      i++;
    } else if (args[i] === '--population-column') {
      populationColumn = args[i + 1];
      i++;
    } else if (args[i] === '--longitude-column') {
      longitudeColumn = args[i + 1];
      i++;
    } else if (args[i] === '--latitude-column') {
      latitudeColumn = args[i + 1];
      i++;
    } else if (args[i] === '--delimiter') {
      delimiter = args[i + 1];
      i++;
    } else if (args[i] === '--input-crs') {
      inputCrs = args[i + 1].toLowerCase();
      i++;
    }
  }

  if (!scenarioPath || !inputPath || !outputPath || !manifestOutputPath) {
    fail('Missing required arguments: --scenario, --input, --output, --manifest-output');
  }

  if (!fs.existsSync(scenarioPath)) {
    fail(`Scenario file not found: ${scenarioPath}`);
  }
  if (!fs.existsSync(inputPath)) {
    fail(`Input file not found: ${inputPath}`);
  }

  let scenario;
  try {
    scenario = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
  } catch (err) {
    fail(`Failed to parse scenario JSON: ${err.message}`);
  }

  const bounds = scenario.playableBounds;
  if (!bounds) {
    fail('Scenario is missing playableBounds.');
  }

  const csvContent = fs.readFileSync(inputPath, 'utf8');
  const lines = csvContent.split(/\r?\n/);

  let headerRow = null;
  let headerIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      headerRow = line;
      headerIndex = i;
      break;
    }
  }

  if (headerRow === null) {
    fail('CSV file is empty or missing header row');
  }

  const headers = splitCsvLine(headerRow, delimiter).map(h => h.trim());

  const idColIdx = headers.indexOf(idColumn);
  const popColIdx = headers.indexOf(populationColumn);
  const lonColIdx = headers.indexOf(longitudeColumn);
  const latColIdx = headers.indexOf(latitudeColumn);

  if (idColIdx === -1) fail(`Missing configured ID column: ${idColumn}`);
  if (popColIdx === -1) fail(`Missing configured population column: ${populationColumn}`);
  if (lonColIdx === -1) fail(`Missing configured longitude/X column: ${longitudeColumn}`);
  if (latColIdx === -1) fail(`Missing configured latitude/Y column: ${latitudeColumn}`);

  const records = [];
  const knownIds = new Set();

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const rowNumber = i + 1;
    let cols;
    try {
      cols = splitCsvLine(line, delimiter);
    } catch (err) {
      fail(`Row ${rowNumber}: ${err.message}`);
    }

    if (cols.length < Math.max(idColIdx, popColIdx, lonColIdx, latColIdx) + 1) {
      fail(`Row ${rowNumber}: fewer columns than required by headers.`);
    }

    const id = cols[idColIdx].trim();
    if (!id) {
      fail(`Row ${rowNumber}: Grid ID is empty.`);
    }

    if (knownIds.has(id)) {
      fail(`Row ${rowNumber}: Duplicate grid ID detected: ${id}`);
    }
    knownIds.add(id);

    const popRaw = cols[popColIdx].trim();
    const population = Number(popRaw);

    if (!Number.isFinite(population)) {
      fail(`Row ${rowNumber}: Invalid or non-finite population: ${popRaw}`);
    }
    if (population < 0) {
      fail(`Row ${rowNumber}: Population cannot be negative: ${population}`);
    }

    // Omit population 0 records by default
    if (population === 0) {
      continue;
    }

    const xRaw = cols[lonColIdx].trim();
    const yRaw = cols[latColIdx].trim();
    const x = Number(xRaw);
    const y = Number(yRaw);

    if (!Number.isFinite(x)) {
      fail(`Row ${rowNumber}: Invalid or non-finite coordinate X/longitude: ${xRaw}`);
    }
    if (!Number.isFinite(y)) {
      fail(`Row ${rowNumber}: Invalid or non-finite coordinate Y/latitude: ${yRaw}`);
    }

    let lng, lat;
    if (inputCrs === 'epsg:3035') {
      try {
        const converted = proj4('EPSG:3035', 'EPSG:4326', [x, y]);
        lng = converted[0];
        lat = converted[1];
      } catch (err) {
        fail(`Row ${rowNumber}: Projection failed: ${err.message}`);
      }
    } else if (inputCrs === 'epsg:4326') {
      lng = x;
      lat = y;
    } else {
      fail(`Unsupported input CRS: ${inputCrs}`);
    }

    if (lng < -180 || lng > 180) {
      fail(`Row ${rowNumber}: Computed longitude out of range: ${lng}`);
    }
    if (lat < -90 || lat > 90) {
      fail(`Row ${rowNumber}: Computed latitude out of range: ${lat}`);
    }

    // Clip to playable bounds
    if (lng >= bounds.west && lng <= bounds.east && lat >= bounds.south && lat <= bounds.north) {
      records.push({ id, lng, lat, population });
    }
  }

  // Write CSV
  const csvRows = ['grid_id,lng,lat,population'];
  for (const r of records) {
    csvRows.push(`${r.id},${r.lng},${r.lat},${r.population}`);
  }

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, csvRows.join('\n') + '\n', 'utf8');
  console.log(`Normalized census CSV created: ${outputPath} (${records.length} rows retained)`);

  // Generate Manifest
  const scenarioId = scenario.scenarioId;
  const manifestDir = path.dirname(manifestOutputPath);
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }

  // Try to pick up existing workplace attractors
  const originalManifestPath = `data/scenario-source-material/${scenarioId}.source-material.json`;
  let workplaceSources = [];
  if (fs.existsSync(originalManifestPath)) {
    try {
      const orig = JSON.parse(fs.readFileSync(originalManifestPath, 'utf8'));
      if (Array.isArray(orig.sources)) {
        workplaceSources = orig.sources.filter(s => s.kind === 'workplace-attractors');
      }
    } catch (e) {
      console.warn(`Warning: Failed to read original source-material to pull workplace attractors: ${e.message}`);
    }
  }

  const generatedManifest = {
    schemaVersion: 1,
    scenarioId,
    manifestId: `${scenarioId}-local-census-source-material`,
    description: `Local census grid source material manifest for ${scenarioId}.`,
    sources: [
      {
        id: `${scenarioId}-residential-grid-local-census`,
        kind: 'census-grid',
        label: 'Local Census Grid',
        path: outputPath,
        adapter: 'census-grid-csv',
        enabled: true,
        options: {
          idColumn: 'grid_id',
          longitudeColumn: 'lng',
          latitudeColumn: 'lat',
          populationColumn: 'population',
          delimiter: ','
        }
      },
      ...workplaceSources
    ],
    output: {
      demandArtifactPath: `apps/web/public/generated/scenarios/${scenarioId}.demand.json`
    }
  };

  fs.writeFileSync(manifestOutputPath, JSON.stringify(generatedManifest, null, 2), 'utf8');
  console.log(`Generated local manifest: ${manifestOutputPath}`);
}

main();
