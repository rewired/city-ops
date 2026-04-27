import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname } from 'path';

const args = process.argv.slice(2);
let inputPath = '';
let outputPath = '';

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) inputPath = args[i + 1];
    if (args[i] === '--output' && args[i + 1]) outputPath = args[i + 1];
}

if (!inputPath || !outputPath) {
    console.error('Usage: node normalize-stop-candidates.mjs --input <geojsonseq-file> --output <geojson-file>');
    process.exit(1);
}

if (!existsSync(inputPath)) {
    console.error('Input file not found:', inputPath);
    process.exit(1);
}

const EXPLICIT_NON_BUS_MODES = ['rail', 'subway', 'tram', 'ferry', 'light_rail', 'monorail'];
const BUS_RELEVANT_TAGS = ['bus', 'bus_stop', 'yes'];

const candidates = [];

const lines = readFileSync(inputPath, 'utf8').split('\n').filter(line => line.trim());

for (const line of lines) {
    if (!line.trim()) continue;

    let feature;
    try {
        feature = JSON.parse(line);
    } catch {
        console.warn('[normalizer] Skipping invalid JSON line');
        continue;
    }

    if (feature.type !== 'Feature') {
        console.warn('[normalizer] Skipping non-Feature');
        continue;
    }

    if (feature.geometry?.type !== 'Point') {
        console.warn('[normalizer] Skipping non-Point geometry');
        continue;
    }

    const coords = feature.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length !== 2) {
        console.warn('[normalizer] Skipping invalid coordinates');
        continue;
    }

    const [lng, lat] = coords;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
        console.warn('[normalizer] Skipping non-numeric coordinates');
        continue;
    }

    const tags = feature.properties || {};
    const id = feature.id;
    const osmElementType = feature.type === 'Feature' ? 'node' : 'unknown';

    if (!id || typeof id !== 'number') {
        console.warn('[normalizer] Skipping feature without numeric OSM id');
        continue;
    }

    let kind = '';
    let candidateName = '';

    if (tags.highway === 'bus_stop') {
        kind = 'bus-stop';
        candidateName = tags.name || tags.ref || '';
    } else if (tags.public_transport === 'platform') {
        const busMode = tags.bus || tags.public_transport_access || '';
        if (EXPLICIT_NON_BUS_MODES.some(mode => tags[mode] || tags.public_transport === mode)) {
            console.warn(`[normalizer] Skipping non-bus platform: id=${id}`);
            continue;
        }
        if (tags.public_transport === 'platform' && tags.bus === 'yes') {
            kind = 'public-transport-platform';
        } else if (tags.public_transport === 'platform') {
            kind = 'public-transport-platform';
        }
        candidateName = tags.name || tags.ref || '';
    } else if (tags.public_transport === 'stop_position') {
        if (EXPLICIT_NON_BUS_MODES.some(mode => tags[mode] || tags.public_transport === mode)) {
            console.warn(`[normalizer] Skipping non-bus stop_position: id=${id}`);
            continue;
        }
        kind = 'public-transport-stop-position';
        candidateName = tags.name || tags.ref || '';
    }

    if (!kind) {
        console.warn(`[normalizer] Skipping feature with unknown kind: id=${id}`);
        continue;
    }

    const label = candidateName || `OSM stop ${id}`;

    candidates.push({
        candidateId: `osm:node:${id}`,
        label,
        kind,
        source: 'osm',
        osmElementType,
        osmElementId: String(id),
        lat,
        lon: lng
    });
}

candidates.sort((a, b) => {
    const idA = parseInt(a.osmElementId, 10);
    const idB = parseInt(b.osmElementId, 10);
    if (idA !== idB) return idA - idB;
    return a.label.localeCompare(b.label);
});

const seen = new Set();
const deduplicated = [];
for (const c of candidates) {
    if (!seen.has(c.candidateId)) {
        seen.add(c.candidateId);
        deduplicated.push(c);
    }
}

const features = deduplicated.map(c => ({
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [c.lon, c.lat]
    },
    properties: {
        candidateId: c.candidateId,
        label: c.label,
        kind: c.kind,
        source: c.source,
        osmElementType: c.osmElementType,
        osmElementId: c.osmElementId
    }
}));

const outputDir = dirname(outputPath);
if (!existsSync(outputDir)) {
    console.error('Output directory does not exist:', outputDir);
    process.exit(1);
}

const geojson = {
    type: 'FeatureCollection',
    features
};

writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
console.log(`Normalized ${deduplicated.length} stop candidates to ${outputPath}`);