import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

function printDiagnostics(composeFile, osrmFile) {
    console.error('\n--- Diagnostics ---');
    console.error(`Resolved OSRM_FILE: ${osrmFile}`);
    
    console.error('\nDocker Compose Status:');
    spawnSync('docker', ['compose', '-f', composeFile, 'ps'], { stdio: 'inherit' });
    
    console.error('\nDocker Compose Logs (tail 80):');
    spawnSync('docker', ['compose', '-f', composeFile, 'logs', '--tail', '80', 'osrm'], { stdio: 'inherit' });
}

async function main() {
    const args = process.argv.slice(2);
    let areaId = '';
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--area' && i + 1 < args.length) {
            areaId = args[i + 1];
            break;
        }
    }

    if (!areaId) {
        console.error('Error: Missing required argument --area <areaId>');
        console.error('Usage: node scripts/routing/start-osrm.mjs --area <areaId>');
        process.exit(1);
    }

    const areaFilePath = path.join(rootDir, 'data', 'areas', `${areaId}.area.json`);
    if (!fs.existsSync(areaFilePath)) {
        console.error(`Error: Area configuration file not found: ${areaFilePath}`);
        process.exit(1);
    }

    let areaConfig;
    try {
        const content = fs.readFileSync(areaFilePath, 'utf8');
        areaConfig = JSON.parse(content);
    } catch (e) {
        console.error(`Error: Failed to parse area configuration: ${e.message}`);
        process.exit(1);
    }

    let validated;
    try {
        validated = validateAreaConfig(areaConfig);
    } catch (e) {
        console.error(`Error: Invalid area configuration: ${e.message}`);
        process.exit(1);
    }

    const expectedBaseFilePath = path.join(rootDir, validated.expectedBaseFile);
    if (!fs.existsSync(expectedBaseFilePath)) {
        console.error(`Error: Prepared OSRM data not found at ${expectedBaseFilePath}`);
        console.error(`Please run appropriate asset setup command first (e.g. pnpm scenario:setup:${areaId})`);
        process.exit(1);
    }

    const osrmDir = path.join(rootDir, 'data', 'routing', 'osrm');
    const absExpected = path.resolve(expectedBaseFilePath);
    const absOsrm = path.resolve(osrmDir);

    if (!absExpected.startsWith(absOsrm)) {
        console.error(`Error: Expected OSRM file ${absExpected} is not within ${absOsrm}`);
        process.exit(1);
    }

    let relativePath = path.relative(absOsrm, absExpected);
    // Convert to POSIX style path (forward slashes)
    relativePath = relativePath.split(path.sep).join('/');
    
    console.log(`Resolved OSRM_FILE: ${relativePath}`);

    // Check Docker
    console.log('Checking Docker availability...');
    const dockerCheck = spawnSync('docker', ['info'], { stdio: 'ignore' });
    if (dockerCheck.status !== 0) {
        console.error('Error: Docker is not available or not running.');
        process.exit(1);
    }

    const composeFile = path.join(rootDir, 'docker', 'routing', 'osrm', 'docker-compose.yml');
    
    console.log(`Starting OSRM service for area "${areaId}" via Docker Compose...`);
    
    // Run docker compose up -d
    const env = { ...process.env, OSRM_FILE: relativePath };
    const composeResult = spawnSync('docker', ['compose', '-f', composeFile, 'up', '-d'], { 
        env,
        stdio: 'inherit'
    });

    if (composeResult.status !== 0) {
        console.error('Error: Failed to start Docker Compose.');
        printDiagnostics(composeFile, relativePath);
        process.exit(1);
    }

    console.log('Waiting for OSRM endpoint to become reachable...');
    const isReachable = await waitPort('http://127.0.0.1:5000');

    if (!isReachable) {
        console.error('\nError: OSRM service did not become reachable within the timeout window.');
        printDiagnostics(composeFile, relativePath);
        process.exit(1);
    }

    console.log('\nSuccess: OSRM service is up and reachable at http://127.0.0.1:5000');
    process.exit(0);
}

function validateAreaConfig(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Area config is not an object');
    }
    if (typeof data.routing !== 'object' || data.routing === null) {
        throw new Error('Area config missing "routing" object');
    }
    const routing = data.routing;
    if (routing.engine !== 'osrm') {
        throw new Error(`Unsupported routing engine: ${routing.engine}. Expected "osrm".`);
    }
    if (routing.algorithm !== 'mld') {
        throw new Error(`Unsupported routing algorithm: ${routing.algorithm}. Expected "mld".`);
    }
    if (typeof routing.expectedBaseFile !== 'string') {
        throw new Error('Area config missing "routing.expectedBaseFile"');
    }
    return {
        expectedBaseFile: routing.expectedBaseFile
    };
}

async function waitPort(url, timeoutMs = 30000, intervalMs = 1000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        try {
            const res = await fetch(url);
            // OSRM might return 400 for root, but it means it's alive
            if (res.ok || res.status === 400) {
                return true;
            }
        } catch (e) {
            // Ignore network errors
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    return false;
}

main();
