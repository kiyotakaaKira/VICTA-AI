/**
 * config/env.js
 * Validates required environment variables on startup.
 * Throws early with a clear error if any are missing.
 */

const REQUIRED_VARS = [
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'GEMINI_API_KEY',
  'CLERK_SECRET_KEY',
];

const OPTIONAL_VARS = [
  'PORT',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const list = missing.map((k) => `  - ${k}`).join('\n');
    throw new Error(
      `[ENV] Missing required environment variables:\n${list}\n\nCopy .env.example → .env and fill in the values.`
    );
  }

  const warnings = OPTIONAL_VARS.filter((key) => !process.env[key]);
  if (warnings.length > 0) {
    console.warn(
      `[ENV] Optional vars not set: ${warnings.join(', ')}`
    );
  }

  console.log('[ENV] All required environment variables are set ✓');
}

module.exports = { validateEnv };
