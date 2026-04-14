'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BrandKit } from '@/lib/types'

export default function KitPage() {
  const params = useParams()
  const router = useRouter()
  const domain = decodeURIComponent(params.domain as string)

  const [kit, setKit] = useState<BrandKit | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeLogoVariant, setActiveLogoVariant] = useState('default')
  const [copied, setCopied] = useState('')
  const [activeTab, setActiveTab] = useState('colors')

  useEffect(() => {
    supabase
      .from('kits')
      .select('*')
      .eq('domain', domain)
      .single()
      .then(({ data }) => {
        if (data) setKit(data)
        setLoading(false)
      })
  }, [domain])

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  function getLogoBg() {
    if (!kit) return '#f5f5f5'
    if (activeLogoVariant === 'light') return '#ffffff'
    if (activeLogoVariant === 'dark') return '#111111'
    if (activeLogoVariant === 'branded') return kit.colors?.[0]?.hex || '#000'
    return kit.logo?.backgroundColor || '#f5f5f5'
  }

  function getLogoColor() {
    if (!kit) return '#000'
    if (activeLogoVariant === 'dark') return '#ffffff'
    if (activeLogoVariant === 'branded') return '#ffffff'
    return kit.logo?.primaryColor || '#000'
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'var(--ink-3)' }}>
        Loading kit...
      </div>
    </main>
  )

  if (!kit) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontFamily: 'var(--ff-display)', fontSize: '32px' }}>Kit not found</div>
      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'var(--ink-3)' }}>No kit exists for {domain}</div>
      <button onClick={() => router.push('/')} style={{
        padding: '10px 20px', background: 'var(--ink)', color: '#fff',
        border: 'none', borderRadius: '8px', fontSize: '14px',
      }}>
        Extract it →
      </button>
    </main>
  )

  const tabs = ['colors', 'typography', 'spacing', 'tokens']

  return (
    <main style={{ minHeight: '100vh', background: 'var(--surface)' }}>

      {/* Nav */}
      <nav style={{
        padding: '1.25rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 10,
      }}>
        <a href="/" style={{ fontFamily: 'var(--ff-display)', fontSize: '20px' }}>
          un<em>brand</em>
        </a>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => copyText(`https://unbrand.io/${domain}`, 'link')}
            style={{
              padding: '8px 16px', border: '1px solid var(--border-2)',
              borderRadius: '8px', background: 'var(--surface)',
              fontSize: '13px', color: 'var(--ink-2)',
            }}
          >
            {copied === 'link' ? 'Copied!' : '↗ Share'}
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '8px 16px', background: 'var(--ink)', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '13px',
            }}
          >
            New kit
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '3rem' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '12px',
            background: kit.colors?.[0]?.hex || '#f0f0f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', flexShrink: 0, border: '1px solid var(--border)',
          }}>
            {kit.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: 'var(--ff-display)', fontSize: '36px',
              fontWeight: 400, fontStyle: 'italic', lineHeight: 1.1,
            }}>
              {kit.brand_name}
            </h1>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--ink-3)', marginTop: '4px' }}>
              {kit.domain}
            </div>
            <p style={{ fontSize: '14px', color: 'var(--ink-2)', marginTop: '6px', lineHeight: 1.5 }}>
              {kit.description}
            </p>
          </div>
        </div>

        {/* Logo card */}
        <div style={{
          border: '1px solid var(--border-2)', borderRadius: '16px',
          padding: '1.5rem', marginBottom: '2rem',
        }}>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink-3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Logo
          </div>
          <div style={{
            borderRadius: '10px', padding: '3rem 2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem', minHeight: '120px',
            background: getLogoBg(),
            transition: 'background 0.2s',
          }}>
            <div style={{
              fontSize: '36px',
              fontFamily: kit.typography?.primary?.name ? `'${kit.typography.primary.name}', sans-serif` : 'var(--ff-body)',
              color: getLogoColor(),
              fontWeight: 700,
              letterSpacing: '-1px',
              transition: 'color 0.2s',
            }}>
              {kit.logo?.render || kit.brand_name}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['default', 'light', 'dark', 'branded'].map(v => (
              <button
                key={v}
                onClick={() => setActiveLogoVariant(v)}
                style={{
                  padding: '5px 14px',
                  border: '1px solid var(--border-2)',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontFamily: 'var(--ff-mono)',
                  background: activeLogoVariant === v ? 'var(--ink)' : 'transparent',
                  color: activeLogoVariant === v ? '#fff' : 'var(--ink-2)',
                  transition: 'all 0.15s',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 18px',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--ink)' : '2px solid transparent',
                background: 'transparent',
                fontSize: '13px',
                fontFamily: 'var(--ff-mono)',
                color: activeTab === tab ? 'var(--ink)' : 'var(--ink-3)',
                marginBottom: '-1px',
                transition: 'color 0.15s',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Colors tab */}
        {activeTab === 'colors' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {kit.colors?.map((color, i) => (
              <div
                key={i}
                onClick={() => copyText(color.hex, color.hex)}
                style={{
                  border: '1px solid var(--border-2)', borderRadius: '12px',
                  overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
              >
                <div style={{ height: '80px', background: color.hex }} />
                <div style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 500, fontSize: '13px', marginBottom: '2px' }}>{color.name}</div>
                  <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--ink-3)' }}>
                    {copied === color.hex ? 'Copied!' : color.hex}
                  </div>
                  <div style={{
                    fontFamily: 'var(--ff-mono)', fontSize: '10px',
                    color: 'var(--ink-4)', marginTop: '4px',
                    textTransform: 'uppercase', letterSpacing: '1px',
                  }}>
                    {color.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Typography tab */}
        {activeTab === 'typography' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ border: '1px solid var(--border-2)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink-3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Primary — {kit.typography?.primary?.name}
              </div>
              {[
                { label: 'Display', size: '48px', weight: 700 },
                { label: 'Heading', size: '28px', weight: 600 },
                { label: 'Body', size: '16px', weight: 400 },
                { label: 'Caption', size: '12px', weight: 400 },
              ].map(t => (
                <div key={t.label} style={{
                  padding: '12px 0', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px',
                }}>
                  <div style={{
                    fontSize: t.size, fontWeight: t.weight,
                    fontFamily: `'${kit.typography?.primary?.name}', sans-serif`,
                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flex: 1,
                  }}>
                    {kit.brand_name}
                  </div>
                  <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink-3)', flexShrink: 0 }}>
                    {t.label} / {t.size} / {t.weight}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ border: '1px solid var(--border-2)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink-3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Rules
              </div>
              {kit.typography?.rules?.map((rule, i) => (
                <div key={i} style={{
                  fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'var(--ink-2)',
                  padding: '8px 12px', background: 'var(--surface-2)',
                  borderRadius: '6px', marginBottom: '6px',
                }}>
                  → {rule}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spacing tab */}
        {activeTab === 'spacing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ border: '1px solid var(--border-2)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink-3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Spacing scale — base unit: {kit.spacing?.unit}px
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {kit.spacing?.scale?.map((val, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--ink-3)', width: '40px' }}>{val}px</div>
                    <div style={{ height: '20px', background: 'var(--ink)', borderRadius: '2px', width: `${val * 2}px`, maxWidth: '300px' }} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ border: '1px solid var(--border-2)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink-3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Border radius
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {Object.entries(kit.radii || {}).map(([key, val]) => (
                  <div key={key} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '48px', height: '48px',
                      background: 'var(--surface-3)',
                      borderRadius: val as string,
                      border: '1px solid var(--border-2)',
                      marginBottom: '6px',
                    }} />
                    <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink-3)' }}>{key}</div>
                    <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink-4)' }}>{val as string}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tokens tab */}
        {activeTab === 'tokens' && (
          <div style={{ border: '1px solid var(--border-2)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{
              padding: '12px 16px', background: 'var(--surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink-3)' }}>
                figma-tokens.css
              </div>
              <button
                onClick={() => copyText(kit.figma_tokens || '', 'tokens')}
                style={{
                  padding: '5px 14px', border: '1px solid var(--border-2)',
                  borderRadius: '6px', background: 'var(--surface)',
                  fontSize: '12px', fontFamily: 'var(--ff-mono)',
                  color: 'var(--ink-2)',
                }}
              >
                {copied === 'tokens' ? 'Copied!' : 'Copy all'}
              </button>
            </div>
            <pre style={{
              padding: '1.5rem', fontSize: '13px',
              fontFamily: 'var(--ff-mono)', lineHeight: 1.7,
              color: 'var(--ink-2)', overflowX: 'auto',
              background: 'var(--surface)',
              whiteSpace: 'pre-wrap',
            }}>
              {kit.figma_tokens}
            </pre>
          </div>
        )}

      </div>
    </main>
  )
}

