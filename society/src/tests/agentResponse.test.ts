/**
 * Tests for AgentResponse schema validation
 * Run with: npx tsx src/tests/agentResponse.test.ts
 */

import { AgentResponse, successResponse, errorResponse, partialResponse } from '../schemas/agentResponse.js'

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`✅ ${name}`)
  } catch (error: any) {
    console.error(`❌ ${name}`)
    console.error(`   ${error.message}`)
    process.exitCode = 1
  }
}

// Test success response validation
test('successResponse creates valid schema', () => {
  const response = successResponse('test_agent', { result: 'data' }, { processing_time_ms: 100 })
  AgentResponse.parse(response) // Should not throw
})

// Test error response validation
test('errorResponse creates valid schema', () => {
  const response = errorResponse('test_agent', {
    code: 'TEST_ERROR',
    message: 'Test error message',
    details: { info: 'additional' }
  })
  AgentResponse.parse(response) // Should not throw
})

// Test partial response validation  
test('partialResponse creates valid schema', () => {
  const response = partialResponse('test_agent', { partial: 'data' }, ['warning1', 'warning2'])
  AgentResponse.parse(response) // Should not throw
})

// Test error response without payload field
test('errorResponse has null payload', () => {
  const response = errorResponse('test_agent', { code: 'ERR', message: 'Error' })
  if (response.payload !== null) {
    throw new Error('Error response should have null payload')
  }
})

// Test success response requires payload
test('successResponse has payload', () => {
  const response = successResponse('test_agent', { data: 123 })
  if (!response.payload) {
    throw new Error('Success response should have payload')
  }
})

// Test response with minimal fields
test('minimal response validates', () => {
  const minimal = {
    status: 'success' as const,
    agent: 'minimal',
    timestamp: new Date().toISOString(),
    payload: { test: true }
  }
  AgentResponse.parse(minimal) // Should not throw
})

// Test response with all optional fields
test('response with all fields validates', () => {
  const complete = {
    status: 'error' as const,
    agent: 'complete',
    channel: 'web',
    timestamp: new Date().toISOString(),
    metadata: {
      processing_time_ms: 123,
      model_used: 'gpt-4o-mini',
      tokens_used: 456,
      retry_count: 2,
      warnings: ['warn1', 'warn2']
    },
    payload: null,
    error: {
      code: 'TEST_ERROR',
      message: 'Complete error',
      details: { info: 'extra' }
    }
  }
  AgentResponse.parse(complete) // Should not throw
})

console.log('\n🧪 Agent Response Schema Tests Complete')
