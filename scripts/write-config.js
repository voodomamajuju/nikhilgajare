#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const STORAGE_BUCKET = process.env.STORAGE_BUCKET || 'uploads';

// Check if using custom backend (API_URL is set instead of Supabase)
const API_URL = process.env.API_URL || process.env.VITE_API_URL;
const BASE_URL = process.env.BASE_URL || process.env.VITE_BASE_URL;

// If using custom backend and Supabase vars not provided, skip config generation
if (!SUPABASE_URL && !SUPABASE_ANON_KEY && (API_URL || BASE_URL)) {
  console.log('ℹ️  Using custom backend - config.js generation skipped');
  console.log('ℹ️  Using config.api.js instead');
  process.exit(0);
}

// Validate required environment variables (only if Supabase is being used)
if (!SUPABASE_URL) {
  console.warn('⚠️  Warning: SUPABASE_URL not set. Skipping config.js generation.');
  console.warn('⚠️  If using custom backend, this is expected. Use config.api.js instead.');
  process.exit(0);
}

if (!SUPABASE_ANON_KEY) {
  console.warn('⚠️  Warning: SUPABASE_ANON_KEY not set. Skipping config.js generation.');
  console.warn('⚠️  If using custom backend, this is expected. Use config.api.js instead.');
  process.exit(0);
}

// Create config content
const configContent = `// config.js - Generated at build time from environment variables
// DO NOT EDIT MANUALLY - This file is auto-generated

window.APP_CONFIG = {
  SUPABASE_URL: "${SUPABASE_URL}",
  SUPABASE_ANON_KEY: "${SUPABASE_ANON_KEY}",
  STORAGE_BUCKET: "${STORAGE_BUCKET}"
};

// Export for ES modules compatibility
export const SUPABASE_URL = window.APP_CONFIG.SUPABASE_URL;
export const SUPABASE_ANON_KEY = window.APP_CONFIG.SUPABASE_ANON_KEY;
export const STORAGE_BUCKET = window.APP_CONFIG.STORAGE_BUCKET;
`;

// Write config.js to project root
const configPath = path.join(__dirname, '..', 'config.js');
fs.writeFileSync(configPath, configContent, 'utf8');

console.log('✅ config.js generated successfully');
console.log(`📁 Location: ${configPath}`);
console.log(`🔗 Supabase URL: ${SUPABASE_URL}`);
console.log(`🔑 Anon Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
console.log(`📦 Storage Bucket: ${STORAGE_BUCKET}`);
