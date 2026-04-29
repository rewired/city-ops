import fs from 'fs';
import path from 'path';
import { parseCensusGridCsv } from './source-adapters/census-grid-csv.mjs';

const CANONICAL_TIME_BANDS = [
  'morning-rush',
  'late-morning',
  'midday',
  'afternoon',
  'evening-rush',
  'evening',
  'night'
];

const CENSUS_GRID_RESIDENTIAL_TIME_BANDS = {
  'morning-rush': 1.5,
  'late-morning': 0.7,
  'midday': 0.4,
  'afternoon': 1.0,
  'evening-rush': 0.8,
  'evening': 0.5,
  'night': 0.1
};

function fail(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

function validateTimeBandWeights(weights, context) {
  if (!weights || typeof weights !== 'object') {
    fail(`${context} must have a timeBandWeights object.`);
  }
  for (const band of CANONICAL_TIME_BANDS) {
    const val = weights[band];
    if (val === undefined || typeof val !== 'number' || !Number.isFinite(val) || val < 0) {
      fail(`${context} missing or invalid non-negative weight for time band ${band}.`);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  let inputPath = null;
  let outputPath = null;
  let manifestPath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input') {
      inputPath = args[i + 1];
      i++;
    } else if (args[i] === '--output') {
      outputPath = args[i + 1];
      i++;
    } else if (args[i] === '--manifest') {
      manifestPath = args[i + 1];
      i++;
    }
  }

  if (!manifestPath && (!inputPath || !outputPath)) {
    fail('Missing required arguments: --manifest <path> OR (--input <path> --output <path>)');
  }

  let finalScenarioId = null;
  let finalGeneratorName = 'open-vayra-cities-scenario-demand-generator';
  let finalNodes = [];
  let finalAttractors = [];
  let finalGateways = [];
  let finalGeneratedFrom = [];
  let finalNotes = '';

  if (manifestPath) {
    if (!fs.existsSync(manifestPath)) {
      fail(`Manifest file not found: ${manifestPath}`);
    }
    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (e) {
      fail(`Failed to parse manifest JSON: ${e.message}`);
    }

    if (!manifest || typeof manifest !== 'object') fail('Manifest must be an object.');
    if (typeof manifest.schemaVersion !== 'number') fail('Manifest missing valid schemaVersion.');
    if (typeof manifest.scenarioId !== 'string') fail('Manifest missing valid scenarioId.');
    if (!Array.isArray(manifest.sources)) fail('Manifest missing sources array.');

    finalScenarioId = manifest.scenarioId;
    if (!manifest.output || typeof manifest.output !== 'object') {
      fail('Manifest missing output object.');
    }
    if (typeof manifest.output.demandArtifactPath !== 'string') {
      fail('Manifest output missing demandArtifactPath.');
    }
    outputPath = manifest.output.demandArtifactPath;

    const enabledSources = manifest.sources.filter(s => s.enabled !== false);
    const supportedKinds = ['manual-seed', 'census-grid'];

    for (const src of enabledSources) {
      if (!src.kind || typeof src.kind !== 'string') fail(`Source ${src.id || 'unknown'} missing kind.`);
      if (!supportedKinds.includes(src.kind)) {
        fail(`Source kind ${src.kind} is configured but no adapter exists yet.`);
      }
    }

    const manualSeeds = enabledSources.filter(s => s.kind === 'manual-seed');
    if (manualSeeds.length > 1) {
      fail('Only one enabled manual seed is supported for now.');
    }

    for (const src of enabledSources) {
      if (src.kind === 'manual-seed') {
        if (!src.path || typeof src.path !== 'string') fail(`Source ${src.id} missing path.`);
        if (!fs.existsSync(src.path)) fail(`Input file not found: ${src.path}`);

        let seed;
        try {
          seed = JSON.parse(fs.readFileSync(src.path, 'utf8'));
        } catch (e) {
          fail(`Failed to parse input JSON: ${e.message}`);
        }

        if (!seed || typeof seed !== 'object' || Array.isArray(seed)) {
          fail(`Seed from source ${src.id} must be a JSON object.`);
        }
        if (seed.scenarioId !== finalScenarioId) {
          fail(`Seed scenarioId (${seed.scenarioId}) does not match manifest scenarioId (${finalScenarioId}).`);
        }

        if (seed.generatorName) finalGeneratorName = seed.generatorName;

        if (seed.sourceMetadata && Array.isArray(seed.sourceMetadata.generatedFrom)) {
          finalGeneratedFrom.push(...seed.sourceMetadata.generatedFrom);
        }
        finalGeneratedFrom.push({
          sourceKind: 'manual',
          label: src.label || 'Manual Seed',
          ...(src.attribution ? { attributionHint: src.attribution } : {}),
          ...(src.datasetYear ? { datasetYear: src.datasetYear } : {})
        });

        if (seed.sourceMetadata && seed.sourceMetadata.notes) {
          finalNotes = finalNotes ? `${finalNotes}\n${seed.sourceMetadata.notes}` : seed.sourceMetadata.notes;
        }

        if (Array.isArray(seed.nodes)) finalNodes.push(...seed.nodes);
        if (Array.isArray(seed.attractors)) finalAttractors.push(...seed.attractors);
        if (Array.isArray(seed.gateways)) finalGateways.push(...seed.gateways);

      } else if (src.kind === 'census-grid') {
        if (src.adapter !== 'census-grid-csv') {
          fail(`Unsupported adapter ${src.adapter || 'missing'} for kind census-grid.`);
        }
        if (!src.options || typeof src.options !== 'object') {
          fail(`census-grid source ${src.id} missing valid options object.`);
        }
        const opt = src.options;
        if (typeof opt.idColumn !== 'string' || !opt.idColumn) fail(`census-grid source ${src.id} missing idColumn option.`);
        if (typeof opt.longitudeColumn !== 'string' || !opt.longitudeColumn) fail(`census-grid source ${src.id} missing longitudeColumn option.`);
        if (typeof opt.latitudeColumn !== 'string' || !opt.latitudeColumn) fail(`census-grid source ${src.id} missing latitudeColumn option.`);
        if (typeof opt.populationColumn !== 'string' || !opt.populationColumn) fail(`census-grid source ${src.id} missing populationColumn option.`);

        if (!src.path || typeof src.path !== 'string') fail(`census-grid source ${src.id} missing path.`);
        if (!fs.existsSync(src.path)) fail(`CSV file not found: ${src.path}`);

        let records;
        try {
          records = parseCensusGridCsv(src.path, opt);
        } catch (err) {
          fail(`Adapter failure for source ${src.id}: ${err.message}`);
        }

        for (const record of records) {
          finalNodes.push({
            id: `${src.id}-${record.id}`,
            position: { lng: record.longitude, lat: record.latitude },
            role: 'origin',
            class: 'residential',
            baseWeight: record.population,
            timeBandWeights: CENSUS_GRID_RESIDENTIAL_TIME_BANDS,
            sourceTrace: {
              sourceId: src.id,
              gridId: record.id
            }
          });
        }

        finalGeneratedFrom.push({
          sourceKind: 'census',
          label: src.label || 'Census Grid',
          ...(src.attribution ? { attributionHint: src.attribution } : {}),
          ...(src.datasetYear ? { datasetYear: src.datasetYear } : {})
        });
      }
    }

  } else {
    // Direct fallback
    if (!fs.existsSync(inputPath)) fail(`Input file not found: ${inputPath}`);

    let seed;
    try {
      seed = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    } catch (e) {
      fail(`Failed to parse input JSON: ${e.message}`);
    }

    if (!seed || typeof seed !== 'object' || Array.isArray(seed)) {
      fail('Seed must be a JSON object.');
    }
    if (typeof seed.scenarioId !== 'string' || !seed.scenarioId) {
      fail('Seed missing valid scenarioId.');
    }

    if (!seed.sourceMetadata || typeof seed.sourceMetadata !== 'object') {
      fail('Seed missing valid sourceMetadata.');
    }
    if (!Array.isArray(seed.sourceMetadata.generatedFrom)) {
      fail('sourceMetadata missing generatedFrom array.');
    }

    const arrays = ['nodes', 'attractors', 'gateways'];
    for (const key of arrays) {
      if (!Array.isArray(seed[key])) {
        fail(`Seed missing valid ${key} array.`);
      }
    }

    finalScenarioId = seed.scenarioId;
    if (seed.generatorName) finalGeneratorName = seed.generatorName;
    finalGeneratedFrom = [...seed.sourceMetadata.generatedFrom];
    if (seed.sourceMetadata.notes) {
      finalNotes = seed.sourceMetadata.notes;
    }

    finalNodes = seed.nodes;
    finalAttractors = seed.attractors;
    finalGateways = seed.gateways;
  }

  // Enforce unique IDs
  const knownIds = new Set();

  const validateEntity = (entity, type) => {
    if (!entity || typeof entity !== 'object') {
      fail(`Invalid ${type} entry.`);
    }
    if (typeof entity.id !== 'string' || !entity.id) {
      fail(`${type} missing valid id.`);
    }
    if (knownIds.has(entity.id)) {
      fail(`Duplicate entity ID detected: ${entity.id}`);
    }
    knownIds.add(entity.id);

    if (!entity.position || typeof entity.position !== 'object') {
      fail(`${type} ${entity.id} missing position.`);
    }
    const { lng, lat } = entity.position;
    if (typeof lng !== 'number' || !Number.isFinite(lng) || typeof lat !== 'number' || !Number.isFinite(lat)) {
      fail(`${type} ${entity.id} has invalid coordinates.`);
    }
  };

  // Process and validate Nodes
  const nodes = finalNodes.map(n => {
    validateEntity(n, 'Node');
    if (typeof n.baseWeight !== 'number' || !Number.isFinite(n.baseWeight) || n.baseWeight < 0) {
      fail(`Node ${n.id} has invalid baseWeight.`);
    }
    validateTimeBandWeights(n.timeBandWeights, `Node ${n.id}`);
    return {
      id: n.id,
      position: { lng: n.position.lng, lat: n.position.lat },
      role: n.role,
      class: n.class,
      baseWeight: n.baseWeight,
      timeBandWeights: { ...n.timeBandWeights },
      ...(n.sourceTrace ? { sourceTrace: { ...n.sourceTrace } } : {})
    };
  });

  // Process and validate Attractors
  const attractors = finalAttractors.map(a => {
    validateEntity(a, 'Attractor');
    if (typeof a.sourceWeight !== 'number' || !Number.isFinite(a.sourceWeight) || a.sourceWeight < 0) {
      fail(`Attractor ${a.id} has invalid sourceWeight.`);
    }
    if (typeof a.sinkWeight !== 'number' || !Number.isFinite(a.sinkWeight) || a.sinkWeight < 0) {
      fail(`Attractor ${a.id} has invalid sinkWeight.`);
    }
    if (a.timeBandWeights) {
      validateTimeBandWeights(a.timeBandWeights, `Attractor ${a.id}`);
    }
    return {
      id: a.id,
      position: { lng: a.position.lng, lat: a.position.lat },
      category: a.category,
      scale: a.scale,
      sourceWeight: a.sourceWeight,
      sinkWeight: a.sinkWeight,
      ...(a.timeBandWeights ? { timeBandWeights: { ...a.timeBandWeights } } : {}),
      ...(a.sourceTrace ? { sourceTrace: { ...a.sourceTrace } } : {})
    };
  });

  // Process and validate Gateways
  const gateways = finalGateways.map(g => {
    validateEntity(g, 'Gateway');
    if (typeof g.sourceWeight !== 'number' || !Number.isFinite(g.sourceWeight) || g.sourceWeight < 0) {
      fail(`Gateway ${g.id} has invalid sourceWeight.`);
    }
    if (typeof g.sinkWeight !== 'number' || !Number.isFinite(g.sinkWeight) || g.sinkWeight < 0) {
      fail(`Gateway ${g.id} has invalid sinkWeight.`);
    }
    if (typeof g.transferWeight !== 'number' || !Number.isFinite(g.transferWeight) || g.transferWeight < 0) {
      fail(`Gateway ${g.id} has invalid transferWeight.`);
    }
    validateTimeBandWeights(g.timeBandWeights, `Gateway ${g.id}`);
    return {
      id: g.id,
      position: { lng: g.position.lng, lat: g.position.lat },
      kind: g.kind,
      scale: g.scale,
      sourceWeight: g.sourceWeight,
      sinkWeight: g.sinkWeight,
      transferWeight: g.transferWeight,
      timeBandWeights: { ...g.timeBandWeights },
      ...(g.sourceTrace ? { sourceTrace: { ...g.sourceTrace } } : {})
    };
  });

  const artifact = {
    schemaVersion: 1,
    scenarioId: finalScenarioId,
    generatedAt: new Date().toISOString(),
    sourceMetadata: {
      generatedFrom: finalGeneratedFrom,
      generatorName: finalGeneratorName,
      generatorVersion: '0.1.0',
      ...(finalNotes ? { notes: finalNotes } : {})
    },
    nodes,
    attractors,
    gateways
  };

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(artifact, null, 2), 'utf8');
  console.log(`Generated scenario demand artifact: ${outputPath}`);
}

main();
