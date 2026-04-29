import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseWorkplaceAttractorGeoJson } from './workplace-attractor-geojson.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, '../../../tmp/test-workplace-adapter');

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

function testValidFixture() {
  console.log('Testing valid GeoJSON fixture...');
  const fixturePath = path.join(__dirname, 'workplace-attractor-geojson.fixture.geojson');
  
  const records = parseWorkplaceAttractorGeoJson(fixturePath);
  
  assert.strictEqual(records.length, 3);

  assert.strictEqual(records[0].id, 'point-1');
  assert.strictEqual(records[0].label, 'Point Attractor');
  assert.strictEqual(records[0].weight, 150);
  assert.strictEqual(records[0].scale, 'district');
  assert.ok(Math.abs(records[0].longitude - 10.0) < 1e-7);
  assert.ok(Math.abs(records[0].latitude - 53.5) < 1e-7);

  assert.strictEqual(records[1].id, 'poly-1');
  assert.strictEqual(records[1].label, 'Polygon Attractor');
  assert.strictEqual(records[1].weight, 300);
  assert.strictEqual(records[1].scale, 'major');
  // Polygon coordinates are 10.01, 53.51 to 10.03, 53.53
  // bbox center is (10.01+10.03)/2, (53.51+53.53)/2 => 10.02, 53.52
  assert.ok(Math.abs(records[1].longitude - 10.02) < 1e-7);
  assert.ok(Math.abs(records[1].latitude - 53.52) < 1e-7);

  assert.strictEqual(records[2].id, 'multi-poly-1');
  assert.strictEqual(records[2].label, 'MultiPolygon Attractor');
  assert.strictEqual(records[2].weight, 500);
  assert.strictEqual(records[2].scale, 'metropolitan');
  // bbox center for multi-polygon:
  // poly1 bbox: 10.04, 53.54 to 10.05, 53.55
  // poly2 bbox: 10.06, 53.56 to 10.07, 53.57
  // Combined bbox: 10.04..10.07 and 53.54..53.57
  // Center: (10.04+10.07)/2, (53.54+53.57)/2 => 10.055, 53.555
  assert.ok(Math.abs(records[2].longitude - 10.055) < 1e-7);
  assert.ok(Math.abs(records[2].latitude - 53.555) < 1e-7);
}

function testMissingFile() {
  console.log('Testing missing file fails clearly...');
  assert.throws(() => {
    parseWorkplaceAttractorGeoJson('non-existent.geojson');
  }, /File not found/);
}

function testInvalidGeoJsonRoot() {
  console.log('Testing invalid GeoJSON root fails...');
  const filePath = path.join(tempDir, 'invalid-root.geojson');
  fs.writeFileSync(filePath, '{"type": "Point", "coordinates": [0, 0]}', 'utf8');

  assert.throws(() => {
    parseWorkplaceAttractorGeoJson(filePath);
  }, /Unsupported GeoJSON root type/);
}

function testUnsupportedGeometry() {
  console.log('Testing unsupported geometry fails clearly...');
  const fixturePath = path.join(__dirname, 'workplace-attractor-geojson.invalid.fixture.geojson');

  assert.throws(() => {
    parseWorkplaceAttractorGeoJson(fixturePath);
  }, /Unsupported geometry type at features\[0\]: LineString/);
}

function testInvalidCoordinates() {
  console.log('Testing out of bounds coordinates fail...');
  const filePath = path.join(tempDir, 'out-of-bounds.geojson');
  fs.writeFileSync(filePath, JSON.stringify({
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [200, 50] },
      "properties": {}
    }]
  }), 'utf8');

  assert.throws(() => {
    parseWorkplaceAttractorGeoJson(filePath);
  }, /Invalid longitude at features\[0\]/);
}

function testNegativeWeight() {
  console.log('Testing negative weight fails...');
  const filePath = path.join(tempDir, 'neg-weight.geojson');
  fs.writeFileSync(filePath, JSON.stringify({
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "properties": { "weight": -10 },
      "geometry": { "type": "Point", "coordinates": [10, 50] }
    }]
  }), 'utf8');

  assert.throws(() => {
    parseWorkplaceAttractorGeoJson(filePath);
  }, /Invalid non-negative weight for feature at features\[0\]/);
}

function testInvalidScale() {
  console.log('Testing invalid scale fails...');
  const filePath = path.join(tempDir, 'invalid-scale.geojson');
  fs.writeFileSync(filePath, JSON.stringify({
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "properties": { "scale": "super-major" },
      "geometry": { "type": "Point", "coordinates": [10, 50] }
    }]
  }), 'utf8');

  assert.throws(() => {
    parseWorkplaceAttractorGeoJson(filePath);
  }, /Invalid scale for feature at features\[0\]/);
}

function testDuplicateIds() {
  console.log('Testing duplicate IDs fail...');
  const filePath = path.join(tempDir, 'dup-ids.geojson');
  fs.writeFileSync(filePath, JSON.stringify({
    "type": "FeatureCollection",
    "features": [
      { "type": "Feature", "properties": { "id": "same-id" }, "geometry": { "type": "Point", "coordinates": [10, 50] } },
      { "type": "Feature", "properties": { "id": "same-id" }, "geometry": { "type": "Point", "coordinates": [11, 51] } }
    ]
  }), 'utf8');

  assert.throws(() => {
    parseWorkplaceAttractorGeoJson(filePath);
  }, /Duplicate feature ID detected at features\[1\]: same-id/);
}

function testMalformedFeature() {
  console.log('Testing malformed feature error includes index...');
  const filePath = path.join(tempDir, 'malformed.geojson');
  fs.writeFileSync(filePath, JSON.stringify({
    "type": "FeatureCollection",
    "features": [
      { "type": "Feature", "properties": {}, "geometry": { "type": "Point", "coordinates": [10, 50] } },
      "not-an-object"
    ]
  }), 'utf8');

  assert.throws(() => {
    parseWorkplaceAttractorGeoJson(filePath);
  }, /Malformed feature at index 1: not an object/);
}

function runAll() {
  try {
    setup();
    testValidFixture();
    testMissingFile();
    testInvalidGeoJsonRoot();
    testUnsupportedGeometry();
    testInvalidCoordinates();
    testNegativeWeight();
    testInvalidScale();
    testDuplicateIds();
    testMalformedFeature();
    console.log('--- All Workplace GeoJSON Adapter Tests Passed ---');
  } finally {
    cleanup();
  }
}

runAll();
