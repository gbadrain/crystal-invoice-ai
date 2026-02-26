import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Crystal Invoice AI — Create invoices instantly with AI'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Left blue accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 8,
            height: '100%',
            background: 'linear-gradient(180deg, #1D4ED8 0%, #60A5FA 100%)',
          }}
        />

        {/* Right panel tinted background */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '46%',
            height: '100%',
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          }}
        />

        {/* Left content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 50px 60px 80px',
            width: '54%',
            position: 'relative',
          }}
        >
          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 44 }}>
            {/* Diamond shape via border trick */}
            <div
              style={{
                width: 44,
                height: 44,
                background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              {/* Inline diamond SVG */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 2L22 9L12 22L2 9Z"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
            </div>
            <span style={{ fontSize: 21, fontWeight: 700, color: '#0F172A' }}>
              Crystal Invoice AI
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 54,
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.12,
              marginBottom: 24,
            }}
          >
            Create invoices
            <br />
            <span style={{ color: '#1D4ED8' }}>instantly</span> with AI
          </div>

          {/* Sub-tagline */}
          <div
            style={{
              fontSize: 19,
              color: '#64748B',
              marginBottom: 40,
            }}
          >
            Multi-currency  &middot;  PDF export  &middot;  Email delivery
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: 100,
              padding: '10px 22px',
              fontSize: 15,
              color: '#1D4ED8',
              fontWeight: 700,
            }}
          >
            Free to start &mdash; no credit card required
          </div>
        </div>

        {/* Right: Invoice mockup */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '46%',
            padding: '40px 48px',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: '28px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.13)',
              border: '1px solid #E2E8F0',
            }}
          >
            {/* Invoice header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    fontSize: 10,
                    color: '#94A3B8',
                    fontWeight: 700,
                    letterSpacing: 2,
                    marginBottom: 4,
                  }}
                >
                  INVOICE
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
                  #INV-2025-042
                </div>
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
                fontSize: 12,
                color: '#94A3B8',
                marginBottom: 16,
                paddingBottom: 14,
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              Billed to:{' '}
              <span style={{ color: '#334155', fontWeight: 600 }}>Acme Corp</span>
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
                marginTop: 18,
                backgroundColor: '#1D4ED8',
                color: '#ffffff',
                borderRadius: 10,
                padding: '13px',
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
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
