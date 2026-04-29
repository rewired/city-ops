import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import child_process from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const scriptPath = path.join(__dirname, 'prepare-census-grid-source.mjs');
const tempDir = path.join(rootDir, 'tmp', 'test-prepare-census');

function setup() {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
}

function cleanup() {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function runScript(args) {
  const result = child_process.spawnSync('node', [scriptPath, ...args], { encoding: 'utf8' });
  return result;
}

function testWgs84Clipping() {
  console.log('Testing WGS84 Clipping and Normalization...');
  const scenarioPath = path.join(tempDir, 'test.scenario.json');
  const inputPath = path.join(tempDir, 'input.csv');
  const outputPath = path.join(tempDir, 'output.csv');
  const manifestPath = path.join(tempDir, 'manifest.json');

  const scenario = {
    scenarioId: 'test-scenario',
    playableBounds: { west: 9.5, south: 53.0, east: 10.5, north: 54.0 }
  };
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));

  // g1: In bounds, pop 100
  // g2: In bounds, pop 200
  // g3: Out of bounds (west), pop 300
  // g4: In bounds, pop 0 (should be excluded by default)
  const csv = `grid_id,lng,lat,population
g1,10.0,53.5,100
g2,10.1,53.6,200
g3,9.0,53.5,300
g4,10.2,53.7,0`;

  fs.writeFileSync(inputPath, csv);

  const result = runScript([
    '--scenario', scenarioPath,
    '--input', inputPath,
    '--output', outputPath,
    '--manifest-output', manifestPath
  ]);

  assert.strictEqual(result.status, 0, `Script failed: ${result.stderr}`);
  assert.ok(fs.existsSync(outputPath));
  assert.ok(fs.existsSync(manifestPath));

  const outCsv = fs.readFileSync(outputPath, 'utf8');
  const lines = outCsv.trim().split('\n');
  assert.strictEqual(lines.length, 3, `Expected 3 lines (header + 2 rows), got ${lines.length}`);
  assert.ok(outCsv.includes('g1,10,53.5,100'));
  assert.ok(outCsv.includes('g2,10.1,53.6,200'));
  assert.ok(!outCsv.includes('g3'));
  assert.ok(!outCsv.includes('g4'));
}

function testDuplicateIds() {
  console.log('Testing Duplicate IDs...');
  const scenarioPath = path.join(tempDir, 'test.scenario.json');
  const inputPath = path.join(tempDir, 'input.csv');
  const outputPath = path.join(tempDir, 'output.csv');
  const manifestPath = path.join(tempDir, 'manifest.json');

  const scenario = {
    scenarioId: 'test-scenario',
    playableBounds: { west: 9.5, south: 53.0, east: 10.5, north: 54.0 }
  };
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));

  const csv = `grid_id,lng,lat,population
g1,10.0,53.5,100
g1,10.1,53.6,200`;

  fs.writeFileSync(inputPath, csv);

  const result = runScript([
    '--scenario', scenarioPath,
    '--input', inputPath,
    '--output', outputPath,
    '--manifest-output', manifestPath
  ]);

  assert.strictEqual(result.status, 1);
  assert.ok(result.stderr.includes('Duplicate grid ID detected'));
}

function testMissingColumns() {
  console.log('Testing Missing Columns...');
  const scenarioPath = path.join(tempDir, 'test.scenario.json');
  const inputPath = path.join(tempDir, 'input.csv');
  const outputPath = path.join(tempDir, 'output.csv');
  const manifestPath = path.join(tempDir, 'manifest.json');

  const scenario = {
    scenarioId: 'test-scenario',
    playableBounds: { west: 9.5, south: 53.0, east: 10.5, north: 54.0 }
  };
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));

  const csv = `grid_id,lng,lat
g1,10.0,53.5`;

  fs.writeFileSync(inputPath, csv);

  const result = runScript([
    '--scenario', scenarioPath,
    '--input', inputPath,
    '--output', outputPath,
    '--manifest-output', manifestPath
  ]);

  assert.strictEqual(result.status, 1);
  assert.ok(result.stderr.includes('Header validation failed') && result.stderr.includes('Population column "population"'));
}

function testInvalidCoordinates() {
  console.log('Testing Invalid Coordinates...');
  const scenarioPath = path.join(tempDir, 'test.scenario.json');
  const inputPath = path.join(tempDir, 'input.csv');
  const outputPath = path.join(tempDir, 'output.csv');
  const manifestPath = path.join(tempDir, 'manifest.json');

  const scenario = {
    scenarioId: 'test-scenario',
    playableBounds: { west: 9.5, south: 53.0, east: 10.5, north: 54.0 }
  };
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));

  const csv = `grid_id,lng,lat,population
g1,not-a-number,53.5,100`;

  fs.writeFileSync(inputPath, csv);

  const result = runScript([
    '--scenario', scenarioPath,
    '--input', inputPath,
    '--output', outputPath,
    '--manifest-output', manifestPath
  ]);

  assert.strictEqual(result.status, 1);
  assert.ok(result.stderr.includes('Invalid or non-finite coordinate'));
}

function testNegativePopulation() {
  console.log('Testing Negative Population...');
  const scenarioPath = path.join(tempDir, 'test.scenario.json');
  const inputPath = path.join(tempDir, 'input.csv');
  const outputPath = path.join(tempDir, 'output.csv');
  const manifestPath = path.join(tempDir, 'manifest.json');

  const scenario = {
    scenarioId: 'test-scenario',
    playableBounds: { west: 9.5, south: 53.0, east: 10.5, north: 54.0 }
  };
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));

  const csv = `grid_id,lng,lat,population
g1,10.0,53.5,-50`;

  fs.writeFileSync(inputPath, csv);

  const result = runScript([
    '--scenario', scenarioPath,
    '--input', inputPath,
    '--output', outputPath,
    '--manifest-output', manifestPath
  ]);

  assert.strictEqual(result.status, 1);
  assert.ok(result.stderr.includes('Population cannot be negative'));
}

function testSemicolonDelimiter() {
  console.log('Testing Semicolon Delimiter...');
  const scenarioPath = path.join(tempDir, 'test.scenario.json');
  const inputPath = path.join(tempDir, 'input.csv');
  const outputPath = path.join(tempDir, 'output.csv');
  const manifestPath = path.join(tempDir, 'manifest.json');

  const scenario = {
    scenarioId: 'test-scenario',
    playableBounds: { west: 9.5, south: 53.0, east: 10.5, north: 54.0 }
  };
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));

  const csv = `grid_id;lng;lat;population
g1;10.0;53.5;100`;

  fs.writeFileSync(inputPath, csv);

  const result = runScript([
    '--scenario', scenarioPath,
    '--input', inputPath,
    '--output', outputPath,
    '--manifest-output', manifestPath,
    '--delimiter', ';'
  ]);

  assert.strictEqual(result.status, 0, `Script failed: ${result.stderr}`);
  const outCsv = fs.readFileSync(outputPath, 'utf8');
  assert.ok(outCsv.includes('g1,10,53.5,100'));
}

function testManifestGeneration() {
  console.log('Testing Manifest Generation...');
  const scenarioPath = path.join(tempDir, 'test.scenario.json');
  const inputPath = path.join(tempDir, 'input.csv');
  const outputPath = path.join(tempDir, 'output.csv');
  const manifestPath = path.join(tempDir, 'manifest.json');

  const scenario = {
    scenarioId: 'test-scenario',
    playableBounds: { west: 9.5, south: 53.0, east: 10.5, north: 54.0 }
  };
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));

  const csv = `grid_id,lng,lat,population\ng1,10.0,53.5,100`;
  fs.writeFileSync(inputPath, csv);

  const result = runScript([
    '--scenario', scenarioPath,
    '--input', inputPath,
    '--output', outputPath,
    '--manifest-output', manifestPath
  ]);

  assert.strictEqual(result.status, 0);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.strictEqual(manifest.schemaVersion, 1);
  assert.strictEqual(manifest.scenarioId, 'test-scenario');
  assert.strictEqual(manifest.sources.length, 1);
  assert.strictEqual(manifest.sources[0].kind, 'census-grid');
  assert.strictEqual(manifest.sources[0].path, outputPath);
  assert.ok(!manifest.sources.some(s => s.kind === 'manual-seed'));
}

function testEpsg3035Projection() {
  console.log('Testing EPSG:3035 Projection...');
  const scenarioPath = path.join(tempDir, 'test.scenario.json');
  const inputPath = path.join(tempDir, 'input.csv');
  const outputPath = path.join(tempDir, 'output.csv');
  const manifestPath = path.join(tempDir, 'manifest.json');

  // Hamburg bounds approx
  const scenario = {
    scenarioId: 'test-scenario',
    playableBounds: { west: 9.5, south: 53.0, east: 10.5, north: 54.0 }
  };
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));

  // EPSG:3035 for approx Hamburg: X=4321000, Y=3210000 gives 10.0, 52.0
  // Let's use coordinates targeting central Hamburg approx
  // EPSG:3035 E: 4321000, N: 3380000 maps approx to 10.0, 53.5 (central Hamburg)
  const csv = `grid_id,x_easting,y_northing,population
g1,4321000,3380000,100`;

  fs.writeFileSync(inputPath, csv);

  const result = runScript([
    '--scenario', scenarioPath,
    '--input', inputPath,
    '--output', outputPath,
    '--manifest-output', manifestPath,
    '--longitude-column', 'x_easting',
    '--latitude-column', 'y_northing',
    '--input-crs', 'epsg:3035'
  ]);

  assert.strictEqual(result.status, 0, `Script failed: ${result.stderr}`);
  
  const outCsv = fs.readFileSync(outputPath, 'utf8');
  const lines = outCsv.trim().split('\n');
  const cols = lines[1].split(',');
  const lng = parseFloat(cols[1]);
  const lat = parseFloat(cols[2]);

  // Should fall within scenario bounds
  assert.ok(lng >= 9.5 && lng <= 10.5, `Longitude ${lng} out of bounds`);
  assert.ok(lat >= 53.0 && lat <= 54.0, `Latitude ${lat} out of bounds`);
}

function testDestatisAutodetect() {
  console.log('Testing Destatis Autodetect...');
  const scenarioPath = path.join(tempDir, 'test.scenario.json');
  const inputPath = path.join(tempDir, 'input.csv');
  const outputPath = path.join(tempDir, 'output.csv');
  const manifestPath = path.join(tempDir, 'manifest.json');

  const scenario = {
    scenarioId: 'test-scenario',
    playableBounds: { west: 9.5, south: 53.0, east: 10.5, north: 54.0 }
  };
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));

  const csv = `GITTER_ID_1km;x_mp_1km;y_mp_1km;Einwohner
CRS3035RES1000mN2689000E4337000;4321000;3380000;100`;

  fs.writeFileSync(inputPath, csv);

  const result = runScript([
    '--scenario', scenarioPath,
    '--input', inputPath,
    '--output', outputPath,
    '--manifest-output', manifestPath
  ]);

  assert.strictEqual(result.status, 0, `Script failed: ${result.stderr}`);
  assert.ok(fs.existsSync(outputPath));
  
  const outCsv = fs.readFileSync(outputPath, 'utf8');
  assert.ok(outCsv.includes('CRS3035RES1000mN2689000E4337000'));
}

function testDestatisPreset() {
  console.log('Testing Destatis Preset...');
  const scenarioPath = path.join(tempDir, 'test.scenario.json');
  const inputPath = path.join(tempDir, 'input.csv');
  const outputPath = path.join(tempDir, 'output.csv');
  const manifestPath = path.join(tempDir, 'manifest.json');

  const scenario = {
    scenarioId: 'test-scenario',
    playableBounds: { west: 9.5, south: 53.0, east: 10.5, north: 54.0 }
  };
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));

  const csv = `GITTER_ID_1km;x_mp_1km;y_mp_1km;Einwohner
CRS3035RES1000mN2689000E4337000;4321000;3380000;100`;

  fs.writeFileSync(inputPath, csv);

  const result = runScript([
    '--scenario', scenarioPath,
    '--input', inputPath,
    '--output', outputPath,
    '--manifest-output', manifestPath,
    '--source-preset', 'destatis-zensus-2022-1km-population'
  ]);

  assert.strictEqual(result.status, 0, `Script failed: ${result.stderr}`);
}

function testPrecedence() {
  console.log('Testing Precedence (CLI > Preset > Autodetect)...');
  const scenarioPath = path.join(tempDir, 'test.scenario.json');
  const inputPath = path.join(tempDir, 'input.csv');
  const outputPath = path.join(tempDir, 'output.csv');
  const manifestPath = path.join(tempDir, 'manifest.json');

  const scenario = {
    scenarioId: 'test-scenario',
    playableBounds: { west: 9.5, south: 53.0, east: 10.5, north: 54.0 }
  };
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));

  const csv = `GITTER_ID_1km;x_mp_1km;y_mp_1km;Einwohner
CRS3035RES1000mN2689000E4337000;4321000;3380000;100`;

  fs.writeFileSync(inputPath, csv);

  const result = runScript([
    '--scenario', scenarioPath,
    '--input', inputPath,
    '--output', outputPath,
    '--manifest-output', manifestPath,
    '--delimiter', ',',
    '--id-column', 'wrong_id'
  ]);

  assert.strictEqual(result.status, 1);
  assert.ok(result.stderr.includes('Missing: ID column "wrong_id"'));
}

function testActionableErrors() {
  console.log('Testing Actionable Errors...');
  const scenarioPath = path.join(tempDir, 'test.scenario.json');
  const inputPath = path.join(tempDir, 'input.csv');
  const outputPath = path.join(tempDir, 'output.csv');
  const manifestPath = path.join(tempDir, 'manifest.json');

  const scenario = {
    scenarioId: 'test-scenario',
    playableBounds: { west: 9.5, south: 53.0, east: 10.5, north: 54.0 }
  };
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));

  const csv = `unknown_id,unknown_x,unknown_y,unknown_pop
g1,10.0,53.5,100`;

  fs.writeFileSync(inputPath, csv);

  const result = runScript([
    '--scenario', scenarioPath,
    '--input', inputPath,
    '--output', outputPath,
    '--manifest-output', manifestPath
  ]);

  assert.strictEqual(result.status, 1);
  assert.ok(result.stderr.includes('Header validation failed'));
  assert.ok(result.stderr.includes('Detected columns: unknown_id, unknown_x, unknown_y, unknown_pop'));
  assert.ok(result.stderr.includes('Expected Normalized columns'));
  assert.ok(result.stderr.includes('Expected Destatis Zensus columns'));
}

function testMissingEinwohner() {
  console.log('Testing Missing Einwohner...');
  const scenarioPath = path.join(tempDir, 'test.scenario.json');
  const inputPath = path.join(tempDir, 'input.csv');
  const outputPath = path.join(tempDir, 'output.csv');
  const manifestPath = path.join(tempDir, 'manifest.json');

  const scenario = {
    scenarioId: 'test-scenario',
    playableBounds: { west: 9.5, south: 53.0, east: 10.5, north: 54.0 }
  };
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));

  const csv = `GITTER_ID_1km;x_mp_1km;y_mp_1km;MissingPop
g1;4321000;3380000;100`;

  fs.writeFileSync(inputPath, csv);

  const result = runScript([
    '--scenario', scenarioPath,
    '--input', inputPath,
    '--output', outputPath,
    '--manifest-output', manifestPath
  ]);

  assert.strictEqual(result.status, 1);
  assert.ok(result.stderr.includes('missing required population column "Einwohner"'));
}

function runAll() {
  try {
    setup();
    testWgs84Clipping();
    testDuplicateIds();
    testMissingColumns();
    testInvalidCoordinates();
    testNegativePopulation();
    testSemicolonDelimiter();
    testManifestGeneration();
    testEpsg3035Projection();
    testDestatisAutodetect();
    testDestatisPreset();
    testPrecedence();
    testActionableErrors();
    testMissingEinwohner();
    console.log('--- All Prepare Census Script Tests Passed ---');
  } finally {
    cleanup();
  }
}

runAll();
