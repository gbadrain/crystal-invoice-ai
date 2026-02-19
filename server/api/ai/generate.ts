import { Router, type Request, type Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'

export const aiRoutes = Router()

const SYSTEM_PROMPT = `You are an invoice data extraction engine for a commercial invoicing SaaS product.
Your job is to extract structured invoice data from natural language input.

You MUST respond with ONLY valid JSON (no markdown, no explanation, no code fences).
The JSON must match this exact structure:

{
  "client": {
    "name": string,
    "email": string,
    "address": string,
    "phone": string
  },
  "metadata": {
    "invoiceNumber": string or "",
    "issueDate": string (ISO date YYYY-MM-DD),
    "dueDate": string (ISO date YYYY-MM-DD, 30 days after issueDate if not specified),
    "status": "draft"
  },
  "lineItems": [
    {
      "description": string,
      "quantity": number,
      "rate": number
    }
  ],
  "taxRate": number (percentage, 0 if not mentioned),
  "discountRate": number (percentage, 0 if not mentioned),
  "notes": string
}

Rules:
- Extract client info if mentioned, use empty strings for missing fields.
- Extract all line items with description, quantity, and unit rate.
- If a total is mentioned but not a rate, calculate the rate from total / quantity.
- If a lump sum is mentioned with no quantity, use quantity: 1.
- Use today's date for issueDate if not specified.
- Set dueDate to 30 days after issueDate if not specified.
- Leave invoiceNumber as empty string (the system will generate one).
- Extract tax rate if mentioned (e.g., "plus 10% tax" → taxRate: 10).
- Extract discount if mentioned (e.g., "15% discount" → discountRate: 15).
- Put any extra context into notes.
- NEVER fabricate data that isn't in the input. Use empty strings or 0 for missing values.`

aiRoutes.post('/generate', async (req: Request, res: Response) => {
  try {
    const { text } = req.body

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Missing or invalid "text" field.' })
      return
    }

    if (text.length > 5000) {
      res.status(400).json({ error: 'Input text must be under 5000 characters.' })
      return
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      res.status(500).json({ error: 'AI service not configured. Add ANTHROPIC_API_KEY to your .env file.' })
      return
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: text },
        { role: 'assistant', content: '{' }, // prefill forces valid JSON output
      ],
    })

    const block = response.content[0]
    if (block.type !== 'text') {
      res.status(502).json({ error: 'AI returned an unexpected response type.' })
      return
    }

    // Prepend the prefilled '{' character back
    const raw = '{' + block.text

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      res.status(502).json({ error: 'AI returned invalid JSON.' })
      return
    }

    console.log(`[AI] Generated invoice for: ${text.slice(0, 80)}...`)
    res.json({ data: parsed })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    if (message.includes('401') || message.includes('authentication')) {
      res.status(401).json({ error: 'Invalid Anthropic API key.' })
      return
    }
    if (message.includes('429') || message.includes('rate_limit')) {
      res.status(429).json({ error: 'AI rate limit reached. Please wait and try again.' })
      return
    }
    if (message.includes('overloaded')) {
      res.status(503).json({ error: 'AI service is temporarily overloaded. Try again in a moment.' })
      return
    }

    console.error('[AI] Generation error:', message)
    res.status(500).json({ error: 'Failed to generate invoice. Please try again.' })
  }
})
