import { ImageResponse } from 'next/og'

export const alt = 'Crystal Invoice AI — Create invoices instantly with AI'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
          backgroundColor: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Left panel */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '620px',
            padding: '60px 56px 60px 72px',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
            <div
              style={{
                width: 44,
                height: 44,
                backgroundColor: '#1D4ED8',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 900, color: '#ffffff' }}>C</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>
              Crystal Invoice AI
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 52,
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.12,
              marginBottom: 28,
            }}
          >
            <span>Create invoices</span>
            <span>
              <span style={{ color: '#1D4ED8' }}>instantly</span>
              {' '}with AI
            </span>
          </div>

          {/* Sub-tagline — using bullet character directly */}
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              color: '#64748B',
              marginBottom: 44,
              gap: 12,
            }}
          >
            <span>Multi-currency</span>
            <span style={{ color: '#CBD5E1' }}>|</span>
            <span>PDF export</span>
            <span style={{ color: '#CBD5E1' }}>|</span>
            <span>Email delivery</span>
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#EFF6FF',
              borderRadius: 100,
              padding: '10px 22px',
              fontSize: 14,
              color: '#1D4ED8',
              fontWeight: 700,
              border: '1px solid #BFDBFE',
            }}
          >
            Free to start — no credit card required
          </div>
        </div>

        {/* Right panel */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '580px',
            backgroundColor: '#EFF6FF',
            padding: '48px 44px',
          }}
        >
          {/* Invoice card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: '28px',
              width: '100%',
              border: '1px solid #E2E8F0',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, letterSpacing: 2 }}>
                  INVOICE
                </span>
                <span style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                  #INV-2025-042
                </span>
              </div>
              <div
                style={{
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  borderRadius: 100,
                  padding: '5px 14px',
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                PAID
              </div>
            </div>

            {/* Client */}
            <div
              style={{
                display: 'flex',
                fontSize: 12,
                color: '#94A3B8',
                marginBottom: 16,
                paddingBottom: 14,
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              <span>Billed to: </span>
              <span style={{ color: '#334155', fontWeight: 600, marginLeft: 4 }}>Acme Corp</span>
            </div>

            {/* Line items */}
            {[
              { name: 'Design Services', amount: '$2,400' },
              { name: 'Development', amount: '$4,800' },
              { name: 'Consulting', amount: '$1,200' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: i < 2 ? '1px solid #F8FAFC' : 'none',
                  fontSize: 13,
                  color: '#475569',
                }}
              >
                <span>{item.name}</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{item.amount}</span>
              </div>
            ))}

            {/* Total */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 14,
                paddingTop: 14,
                borderTop: '2px solid #1D4ED8',
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              <span style={{ color: '#0F172A' }}>Total</span>
              <span style={{ color: '#1D4ED8' }}>$8,400.00</span>
            </div>

            {/* AI button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 18,
                backgroundColor: '#1D4ED8',
                color: '#ffffff',
                borderRadius: 10,
                padding: '13px',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Generate with AI
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
