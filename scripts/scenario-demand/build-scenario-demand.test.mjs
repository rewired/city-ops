import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import child_process from 'child_process';
import { parseScenarioDemandArtifact } from '../../apps/web/src/domain/scenario/scenarioDemandArtifact.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const generatorScript = path.join(__dirname, 'build-scenario-demand.mjs');

const tempDir = path.join(rootDir, 'tmp', 'test-demand');

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

function runGenerator(args) {
  const result = child_process.spawnSync('node', [generatorScript, ...args], { encoding: 'utf8' });
  return result;
}

function testValidSeed() {
  console.log('Testing valid seed...');
  const inputPath = path.join(tempDir, 'valid.seed.json');
  const outputPath = path.join(tempDir, 'output.demand.json');

  const seed = {
    scenarioId: 'test-scenario',
    generatorName: 'test-generator',
    sourceMetadata: {
      generatedFrom: [{ sourceKind: 'manual', label: 'test' }],
      notes: 'test notes'
    },
    nodes: [{
      id: 'n1',
      position: { lng: 10, lat: 50 },
      role: 'origin',
      class: 'residential',
      baseWeight: 1,
      timeBandWeights: {
        'morning-rush': 1, 'late-morning': 1, 'midday': 1, 'afternoon': 1, 'evening-rush': 1, 'evening': 1, 'night': 1
      }
    }],
    attractors: [{
      id: 'a1',
      position: { lng: 10.1, lat: 50.1 },
      category: 'workplace',
      scale: 'local',
      sourceWeight: 1,
      sinkWeight: 1,
      timeBandWeights: {
        'morning-rush': 1, 'late-morning': 1, 'midday': 1, 'afternoon': 1, 'evening-rush': 1, 'evening': 1, 'night': 1
      }
    }],
    gateways: [{
      id: 'g1',
      position: { lng: 10.2, lat: 50.2 },
      kind: 'rail-station',
      scale: 'local',
      sourceWeight: 1,
      sinkWeight: 1,
      transferWeight: 1,
      timeBandWeights: {
        'morning-rush': 1, 'late-morning': 1, 'midday': 1, 'afternoon': 1, 'evening-rush': 1, 'evening': 1, 'night': 1
      }
    }]
  };

  fs.writeFileSync(inputPath, JSON.stringify(seed, null, 2));

  const result = runGenerator(['--input', inputPath, '--output', outputPath]);
  assert.strictEqual(result.status, 0, `Generator failed: ${result.stderr}`);

  assert.ok(fs.existsSync(outputPath), 'Output file not created');

  const generated = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  assert.strictEqual(generated.schemaVersion, 1);
  assert.strictEqual(generated.scenarioId, 'test-scenario');
  assert.ok(generated.generatedAt);
  assert.strictEqual(generated.sourceMetadata.generatorName, 'test-generator');
  assert.strictEqual(generated.sourceMetadata.generatorVersion, '0.1.0');
  assert.strictEqual(generated.nodes.length, 1);
  assert.strictEqual(generated.attractors.length, 1);
  assert.strictEqual(generated.gateways.length, 1);

  // Validate through parser
  try {
    const parsed = parseScenarioDemandArtifact(generated);
    assert.ok(parsed, 'Parser returned null or undefined');
  } catch (e) {
    assert.fail(`Parser failed to validate generated artifact: ${e.message}`);
  }
}

function testMissingInput() {
  console.log('Testing missing input file...');
  const result = runGenerator(['--input', 'non-existent.json', '--output', 'out.json']);
  assert.strictEqual(result.status, 1);
  assert.ok(result.stderr.includes('Input file not found'));
}

function testInvalidSeedShape() {
  console.log('Testing invalid seed shape...');
  const inputPath = path.join(tempDir, 'invalid.seed.json');
  fs.writeFileSync(inputPath, '{"scenarioId": "test"}'); // Missing arrays

  const result = runGenerator(['--input', inputPath, '--output', 'out.json']);
  assert.strictEqual(result.status, 1);
  assert.ok(result.stderr.includes('Seed missing valid sourceMetadata') || result.stderr.includes('Seed missing valid'));
}

function testDuplicateIds() {
  console.log('Testing duplicate entity IDs...');
  const inputPath = path.join(tempDir, 'duplicate.seed.json');
  const seed = {
    scenarioId: 'test-scenario',
    sourceMetadata: { generatedFrom: [] },
    nodes: [
      { id: 'dup', position: { lng: 10, lat: 50 }, role: 'origin', class: 'residential', baseWeight: 1, timeBandWeights: { 'morning-rush': 1, 'late-morning': 1, 'midday': 1, 'afternoon': 1, 'evening-rush': 1, 'evening': 1, 'night': 1 } }
    ],
    attractors: [
      { id: 'dup', position: { lng: 10, lat: 50 }, category: 'workplace', scale: 'local', sourceWeight: 1, sinkWeight: 1 }
    ],
    gateways: []
  };
  fs.writeFileSync(inputPath, JSON.stringify(seed, null, 2));

  const result = runGenerator(['--input', inputPath, '--output', 'out.json']);
  assert.strictEqual(result.status, 1);
  assert.ok(result.stderr.includes('Duplicate entity ID detected'));
}

function testCreateOutputDir() {
  console.log('Testing output directory creation...');
  const inputPath = path.join(tempDir, 'valid.seed.json');
  const outputPath = path.join(tempDir, 'nested', 'dir', 'output.demand.json');

  const seed = {
    scenarioId: 'test-scenario',
    sourceMetadata: { generatedFrom: [] },
    nodes: [], attractors: [], gateways: []
  };
  fs.writeFileSync(inputPath, JSON.stringify(seed, null, 2));

  const result = runGenerator(['--input', inputPath, '--output', outputPath]);
  assert.strictEqual(result.status, 0);
  assert.ok(fs.existsSync(outputPath));
}

function runAll() {
  try {
    setup();
    testValidSeed();
    testMissingInput();
    testInvalidSeedShape();
    testDuplicateIds();
    testCreateOutputDir();
    console.log('--- All Generator Tests Passed ---');
  } finally {
    cleanup();
  }
}

runAll();
