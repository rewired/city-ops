import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import child_process from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

function fail(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

// Parse arguments
const args = process.argv.slice(2);
const areaIndex = args.indexOf('--area');
if (areaIndex === -1 || !args[areaIndex + 1]) {
  fail('Missing required argument: --area <areaId>');
}
const areaId = args[areaIndex + 1];

// Verify referenced area file exists
const areaFile = path.join(rootDir, 'data/areas', `${areaId}.area.json`);
if (!fs.existsSync(areaFile)) {
  fail(`Area configuration file not found: ${areaFile}`);
}

console.log(`Preparing local assets for area: ${areaId}`);

// Helper to execute PowerShell
function runPowerShell(scriptPath, scriptArgs) {
  let shell = 'pwsh';
  console.log(`Attempting to run script with ${shell}: ${scriptPath} ${scriptArgs.join(' ')}`);
  let result = child_process.spawnSync(shell, ['-ExecutionPolicy', 'Bypass', '-File', scriptPath, ...scriptArgs], { stdio: 'inherit' });

  if (result.error && result.error.code === 'ENOENT') {
    shell = 'powershell';
    console.log(`pwsh not found. Falling back to Windows PowerShell: ${shell}`);
    result = child_process.spawnSync(shell, ['-ExecutionPolicy', 'Bypass', '-File', scriptPath, ...scriptArgs], { stdio: 'inherit' });
  }

  if (result.error) {
    fail(`Failed to execute PowerShell script: ${result.error.message}`);
  }
  if (result.status !== 0) {
    fail(`PowerShell script exited with status ${result.status}`);
  }
}

// 1. Invoke OSRM preparation
const prepareOsrmScript = path.join(rootDir, 'scripts/routing/prepare-osrm.ps1');
runPowerShell(prepareOsrmScript, ['-Area', areaId]);

// 2. Rebuild scenario registry
console.log('Rebuilding scenario registry...');
const buildRegistryResult = child_process.spawnSync('node', ['scripts/scenarios/build-scenario-registry.mjs'], { stdio: 'inherit', cwd: rootDir });

if (buildRegistryResult.error) {
  fail(`Failed to run build-scenario-registry: ${buildRegistryResult.error.message}`);
}
if (buildRegistryResult.status !== 0) {
  fail(`build-scenario-registry exited with status ${buildRegistryResult.status}`);
}

console.log(`Local asset preparation complete for area ${areaId}.`);
