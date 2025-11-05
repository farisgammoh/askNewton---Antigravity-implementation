import { openai } from '../utils/openai.js'
import { successResponse, errorResponse, partialResponse } from '../schemas/agentResponse.js'

const MAX_RETRIES = 3
const TIMEOUT_MS = 30000

export const conciergeAgent = {
  async handle(input: any) {
    const startTime = Date.now()
    const userMessage = input.message ?? 'How can I help you today?'
    
    try {
      // Call OpenAI with timeout and retry logic
      let lastError: any
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const resp = await Promise.race([
            openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [
                { 
                  role: 'system', 
                  content: 'You are AskNewton\'s helpful concierge for health insurance. Keep answers concise and offer to recommend plans when relevant. If a user asks about specific plans, suggest they provide their information for personalized recommendations.' 
                },
                { role: 'user', content: userMessage }
              ],
              temperature: 0.7,
              max_tokens: 500
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('OpenAI request timeout')), TIMEOUT_MS)
            )
          ]) as any

          const reply = resp.choices[0]?.message?.content
          
          if (!reply) {
            throw new Error('Empty response from OpenAI')
          }

          // Success - return standardized response
          return successResponse('concierge', { reply }, {
            processing_time_ms: Date.now() - startTime,
            model_used: 'gpt-4o-mini',
            tokens_used: resp.usage?.total_tokens,
            retry_count: attempt
          })
        } catch (err: any) {
          lastError = err
          console.warn(`[Concierge] Attempt ${attempt + 1}/${MAX_RETRIES} failed:`, err.message)
          
          // Don't retry on certain errors
          if (err.message?.includes('invalid_api_key') || err.message?.includes('quota')) {
            throw err
          }
          
          // Wait before retry (exponential backoff)
          if (attempt < MAX_RETRIES - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
          }
        }
      }

      // All retries failed - return partial response with fallback
      console.error('[Concierge] All retries failed:', lastError)
      return partialResponse('concierge', {
        reply: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment, or contact our support team for immediate assistance.'
      }, [
        'LLM service temporarily unavailable',
        `Retried ${MAX_RETRIES} times`
      ])
      
    } catch (error: any) {
      console.error('[Concierge] Critical error:', error)
      return errorResponse('concierge', {
        code: error.code || 'CONCIERGE_ERROR',
        message: 'Unable to process your message at this time',
        details: { original_error: error.message }
      })
    }
  }
}
