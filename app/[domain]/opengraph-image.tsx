import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { domain: string } }) {
  const domain = decodeURIComponent(params.domain)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: kit } = await supabase
    .from('kits')
    .select('*')
    .eq('domain', domain)
    .single()

  const primaryColor = kit?.colors?.[0]?.hex || '#000000'
  const secondaryColor = kit?.colors?.[1]?.hex || '#ffffff'
  const brandName = kit?.brand_name || domain
  const emoji = kit?.emoji || '◆'
  const description = kit?.description || 'Brand kit'
  const colors = kit?.colors?.slice(0, 5) || []

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          fontFamily: 'serif',
        }}
      >
        {/* Top */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: '#ffffff', fontSize: '20px', opacity: 0.4 }}>
            unbrand.io
          </div>
          <div style={{
            color: '#ffffff', fontSize: '13px', opacity: 0.3,
            fontFamily: 'monospace', letterSpacing: '2px',
          }}>
            BRAND KIT
          </div>
        </div>

        {/* Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '64px' }}>{emoji}</div>
          <div style={{ color: '#ffffff', fontSize: '72px', fontStyle: 'italic', lineHeight: 1, letterSpacing: '-3px' }}>
            {brandName}
          </div>
          <div style={{ color: '#ffffff', fontSize: '20px', opacity: 0.5, maxWidth: '600px' }}>
            {description}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            {colors.map((c: any, i: number) => (
              <div key={i} style={{
                width: '40px', height: '40px',
                borderRadius: '50%',
                background: c.hex,
                border: '2px solid rgba(255,255,255,0.1)',
              }} />
            ))}
          </div>
          <div style={{
            color: '#ffffff', fontSize: '14px', opacity: 0.3,
            fontFamily: 'monospace',
          }}>
            unbrand.io/{domain}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}