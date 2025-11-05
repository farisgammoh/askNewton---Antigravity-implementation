import { openai } from '../utils/openai.js'

export const conciergeAgent = {
  async handle(input: any) {
    const user = input.message ?? 'How can I help you today?'
    // Very simple LLM echo with helpfulness
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are AskNewton\'s helpful concierge for health insurance. Keep answers concise and offer to recommend plans when relevant.' },
        { role: 'user', content: user }
      ]
    })
    return { agent: 'concierge', reply: resp.choices[0].message.content }
  }
}
