#!/usr/bin/env node

// chaos-demo.js - Demonstrate chaos testing capabilities
import fetch from 'node-fetch';

const WEBHOOK_SERVER = 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev_admin_token_12345';

async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${WEBHOOK_SERVER}${endpoint}`, options);
  return response.json();
}

async function runChaosDemo() {
  console.log('🔥 CHAOS TESTING DEMO for AskNewton Webhook Server\n');

  try {
    // 1. Show available scenarios
    console.log('1️⃣ Available chaos scenarios:');
    const status = await apiCall('/admin/chaos');
    console.log('   Available scenarios:', status.chaos.available.join(', '));
    console.log('   Currently active:', status.chaos.active.length ? status.chaos.active.join(', ') : 'None');
    console.log();

    // 2. Start Slack killing scenario
    console.log('2️⃣ Starting "killSlack" scenario (30 seconds)...');
    await apiCall('/admin/chaos/start', 'POST', { scenario: 'killSlack', duration: 30000 });
    
    // Wait and check status
    await new Promise(resolve => setTimeout(resolve, 2000));
    const activeStatus = await apiCall('/admin/chaos');
    console.log('   Active scenarios:', activeStatus.chaos.active);
    console.log();

    // 3. Show metrics during chaos
    console.log('3️⃣ Current metrics:');
    const metricsResponse = await fetch(`${WEBHOOK_SERVER}/metrics`);
    const metrics = await metricsResponse.text();
    const chaosMetrics = metrics.split('\n').filter(line => line.includes('chaos') && !line.startsWith('#'));
    chaosMetrics.forEach(metric => console.log('   ' + metric));
    console.log();

    // 4. Start high latency scenario
    console.log('4️⃣ Starting "highLatency" scenario (15 seconds)...');
    await apiCall('/admin/chaos/start', 'POST', { scenario: 'highLatency', duration: 15000 });
    console.log();

    // 5. Show multiple active scenarios
    console.log('5️⃣ Multiple scenarios running:');
    const multiStatus = await apiCall('/admin/chaos');
    console.log('   Active scenarios:', multiStatus.chaos.active);
    console.log();

    // 6. Wait a bit then stop all
    console.log('6️⃣ Waiting 10 seconds then stopping all chaos...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    await apiCall('/admin/chaos/stop', 'POST', {});
    console.log('   All chaos scenarios stopped');
    console.log();

    // 7. Final metrics check
    console.log('7️⃣ Final metrics after chaos testing:');
    const finalMetricsResponse = await fetch(`${WEBHOOK_SERVER}/metrics`);
    const finalMetrics = await finalMetricsResponse.text();
    const finalChaosMetrics = finalMetrics.split('\n').filter(line => 
      (line.includes('chaos') || line.includes('circuit') || line.includes('outbound')) && 
      !line.startsWith('#')
    );
    finalChaosMetrics.forEach(metric => console.log('   ' + metric));
    console.log();

    console.log('✅ Chaos testing demo completed!');
    console.log('\n💡 Tips for real chaos testing:');
    console.log('   - Run scenarios during webhook processing to see resilience in action');
    console.log('   - Monitor /health/resilience endpoint for circuit breaker states');
    console.log('   - Check /admin/queue for failed deliveries moving to retry/DLQ');
    console.log('   - Use intermittentFailures scenario to test retry logic');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.log('\n🔧 Make sure:');
    console.log('   - Webhook server is running on port 3000');
    console.log('   - ADMIN_TOKEN is set or using dev default');
    console.log('   - Try: node start-with-webhooks.js');
  }
}

// Run demo if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runChaosDemo();
}