#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const STORAGE_BUCKET = process.env.STORAGE_BUCKET || 'uploads';

// Validate required environment variables
if (!SUPABASE_URL) {
  console.error('❌ Error: SUPABASE_URL environment variable is required');
  process.exit(1);
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Error: SUPABASE_ANON_KEY environment variable is required');
  process.exit(1);
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
