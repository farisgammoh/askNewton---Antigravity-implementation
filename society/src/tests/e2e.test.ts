/**
 * End-to-end integration tests for Society of Mind gateway
 * Tests complete request flow through router to agents
 * 
 * Run with: npx tsx src/tests/e2e.test.ts
 */

import { router } from '../orchestrator/router.js'
import { AgentResponse } from '../schemas/agentResponse.js'

function test(name: string, fn: () => Promise<void>) {
  return async () => {
    try {
      await fn()
      console.log(`✅ ${name}`)
    } catch (error: any) {
      console.error(`❌ ${name}`)
      console.error(`   ${error.message}`)
      if (error.stack) {
        console.error(`   ${error.stack.split('\n').slice(1, 3).join('\n')}`)
      }
      process.exitCode = 1
    }
  }
}

// Test 1: Coverage recommendation success path
const testCoverageSuccess = test('Coverage recommendation success path', async () => {
  const payload = {
    channel: 'web',
    intent: 'coverage_recommendation',
    intake: {
      person: { age: 28, email: 'test@example.com' },
      residency: { state: 'CA', zip: '94103' },
      household: { size: 1, dependents: 0 },
      doctors: ['Dr. Lee'],
      medications: [],
      budget_usd_monthly: 400
    }
  }

  const response = await router.handle(payload)
  
  // Validate response structure
  AgentResponse.parse(response)
  
  if (response.status !== 'success') {
    throw new Error(`Expected success, got ${response.status}`)
  }
  
  if (response.agent !== 'coverage_advisor') {
    throw new Error(`Expected coverage_advisor, got ${response.agent}`)
  }
  
  if (!response.payload?.shortlist) {
    throw new Error('Missing shortlist in payload')
  }
  
  if (response.payload.shortlist.length === 0) {
    throw new Error('Expected at least one plan recommendation')
  }
})

// Test 2: Coverage recommendation with missing intake (error path)
const testCoverageMissingIntake = test('Coverage recommendation missing intake error', async () => {
  const payload = {
    channel: 'web',
    intent: 'coverage_recommendation',
    message: 'I want a plan'
    // Missing intake!
  }

  const response = await router.handle(payload)
  
  AgentResponse.parse(response)
  
  if (response.status !== 'error') {
    throw new Error(`Expected error, got ${response.status}`)
  }
  
  if (!response.error?.code) {
    throw new Error('Missing error code')
  }
  
  if (response.error.code !== 'INVALID_REQUEST') {
    throw new Error(`Expected INVALID_REQUEST, got ${response.error.code}`)
  }
})

// Test 3: Concierge success path
const testConciergeSuccess = test('Concierge chat success path', async () => {
  const payload = {
    channel: 'web',
    intent: 'concierge',
    message: 'What types of health insurance plans do you offer?'
  }

  const response = await router.handle(payload)
  
  AgentResponse.parse(response)
  
  if (response.status !== 'success') {
    throw new Error(`Expected success, got ${response.status}`)
  }
  
  if (response.agent !== 'concierge') {
    throw new Error(`Expected concierge, got ${response.agent}`)
  }
  
  if (!response.payload?.reply) {
    throw new Error('Missing reply in payload')
  }
})

// Test 4: Intent inference (no explicit intent)
const testIntentInference = test('Intent inference from message', async () => {
  const payload = {
    channel: 'web',
    message: 'Can you recommend a good health plan for me?'
    // No explicit intent - should infer coverage_recommendation
  }

  const response = await router.handle(payload)
  
  AgentResponse.parse(response)
  
  // Should detect "recommend" keyword but fail due to missing intake
  if (response.status !== 'error') {
    // Note: Will error due to missing intake, which is correct
    console.log('   (Correctly detected coverage intent and errored on missing intake)')
  }
  
  if (response.error?.code !== 'INVALID_REQUEST') {
    throw new Error('Should have errored with INVALID_REQUEST for missing intake')
  }
})

// Test 5: Fallback to concierge
const testFallbackToConcierge = test('Unknown intent falls back to concierge', async () => {
  const payload = {
    channel: 'web',
    message: 'Hello, I have a general question'
    // Ambiguous message - should fallback to concierge
  }

  const response = await router.handle(payload)
  
  AgentResponse.parse(response)
  
  if (response.agent !== 'concierge') {
    throw new Error(`Expected concierge fallback, got ${response.agent}`)
  }
  
  if (response.status !== 'success') {
    throw new Error(`Expected success, got ${response.status}`)
  }
})

// Test 6: Invalid payload format
const testInvalidPayload = test('Invalid payload returns error', async () => {
  const payload = {
    channel: 'web',
    intake: 'this_should_be_an_object_not_string'
  }

  const response = await router.handle(payload)
  
  AgentResponse.parse(response)
  
  if (response.status !== 'error') {
    throw new Error(`Expected error for invalid payload, got ${response.status}`)
  }
})

// Test 7: Response metadata validation
const testResponseMetadata = test('Success response includes metadata', async () => {
  const payload = {
    channel: 'web',
    intent: 'concierge',
    message: 'Test message'
  }

  const response = await router.handle(payload)
  
  if (!response.metadata) {
    throw new Error('Missing metadata in response')
  }
  
  if (typeof response.metadata.processing_time_ms !== 'number') {
    throw new Error('Missing processing_time_ms in metadata')
  }
  
  if (typeof response.metadata.routing_confidence !== 'number') {
    throw new Error('Missing routing_confidence in metadata')
  }
})

// Run all tests
async function runTests() {
  console.log('🧪 Running end-to-end integration tests...\n')
  
  await testCoverageSuccess()
  await testCoverageMissingIntake()
  await testConciergeSuccess()
  await testIntentInference()
  await testFallbackToConcierge()
  await testInvalidPayload()
  await testResponseMetadata()
  
  console.log('\n✨ E2E Tests Complete')
  
  if (process.exitCode === 1) {
    console.log('\n⚠️  Some tests failed')
  } else {
    console.log('\n🎉 All tests passed!')
  }
}

runTests().catch(err => {
  console.error('Test runner error:', err)
  process.exit(1)
})
