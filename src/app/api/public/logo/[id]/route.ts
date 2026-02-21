import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/public/logo/[id]
 *
 * Public (no auth) endpoint that serves the logo image for a given invoice.
 * Used by invoice emails so Gmail/Outlook can display the logo inline.
 * Only the logo binary is returned — no invoice data is exposed.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    select: { logo: true },
  })

  if (!invoice?.logo) {
    return new NextResponse(null, { status: 404 })
  }

  // logo is stored as a data URL: "data:<mime>;base64,<data>"
  const match = invoice.logo.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) {
    return new NextResponse(null, { status: 404 })
  }

  const mimeType = match[1]
  const buffer = Buffer.from(match[2], 'base64')

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'public, max-age=86400', // cache 24h — logo rarely changes
    },
  })
}
