// src/scripts/runDiagnose.js
// Simple wrapper to execute the TypeScript diagnostic script using ts-node registration.
// This circumvents the ESM loader problems caused by "type": "module" in package.json.

require('ts-node').register({
  // Use transpileOnly for faster startup; adjust if you need type checking.
  transpileOnly: true,
});

// Import and execute the TS script.
require('./diagnoseStudents.ts');
