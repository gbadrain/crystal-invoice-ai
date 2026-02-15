import { Router, type Request, type Response } from 'express'
import OpenAI from 'openai'

export const aiRoutes = Router()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

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

    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({ error: 'AI service not configured. Set OPENAI_API_KEY in your environment.' })
      return
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      res.status(502).json({ error: 'AI returned an empty response.' })
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(content)
    } catch {
      res.status(502).json({ error: 'AI returned invalid JSON.' })
      return
    }

    // Return raw parsed data — the client-side ai-parser will sanitize and validate
    res.json({ data: parsed })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    // Surface OpenAI-specific errors clearly
    if (message.includes('401') || message.includes('Incorrect API key')) {
      res.status(401).json({ error: 'Invalid OpenAI API key.' })
      return
    }
    if (message.includes('429')) {
      res.status(429).json({ error: 'AI rate limit reached. Please wait and try again.' })
      return
    }
    if (message.includes('insufficient_quota')) {
      res.status(402).json({ error: 'OpenAI quota exceeded. Check your billing.' })
      return
    }

    console.error('AI generation error:', message)
    res.status(500).json({ error: 'Failed to generate invoice. Please try again.' })
  }
})
