#!/usr/bin/env node

// start-with-webhooks.js - Launches both AskNewton main app and webhook server
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting AskNewton with Enhanced Webhook Server...\n');

// Start main application (npm run dev)
const mainApp = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

// Wait a moment for main app to start
await new Promise(resolve => setTimeout(resolve, 2000));

// Generate secure random admin token for development only
let adminToken = process.env.ADMIN_TOKEN;
if (!adminToken && process.env.NODE_ENV === 'development') {
  // Generate cryptographically secure random token for development
  const crypto = await import('crypto');
  adminToken = crypto.randomBytes(16).toString('hex');
  console.log(`🔐 Generated dev admin token: ${adminToken}`);
}

// Start webhook server with resilience patterns
const webhookServer = spawn('node', ['server.js'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname,
  env: {
    ...process.env,
    PORT: '3000',
    ...(adminToken && { ADMIN_TOKEN: adminToken })
  }
});

console.log('\n🎯 Services starting:');
console.log('   📱 AskNewton App: http://localhost:5000');
console.log('   🔗 Webhook Server: http://localhost:3000');
console.log('   📊 Health Check: http://localhost:3000/health/resilience');
console.log('   📈 Metrics: http://localhost:3000/metrics');
if (adminToken && !process.env.ADMIN_TOKEN) {
  console.log(`   🔑 Generated Admin Token: ${adminToken}`);
}
console.log('');

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down both services...');
  mainApp.kill();
  webhookServer.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down both services...');
  mainApp.kill();
  webhookServer.kill();
  process.exit(0);
});

// Handle child process exits
mainApp.on('close', (code) => {
  console.log(`\n❌ Main app exited with code ${code}`);
  webhookServer.kill();
  process.exit(code);
});

webhookServer.on('close', (code) => {
  console.log(`\n❌ Webhook server exited with code ${code}`);
  mainApp.kill();
  process.exit(code);
});