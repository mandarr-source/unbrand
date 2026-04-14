'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { BrandKit } from '../lib/types'

const SEEDED_BRANDS = [
  { domain: 'stripe.com', brand_name: 'Stripe', emoji: 'S', description: 'Payment infrastructure for the internet', colors: [{ hex: '#635BFF' }, { hex: '#0A2540' }] },
  { domain: 'linear.app', brand_name: 'Linear', emoji: 'L', description: 'The issue tracker built for modern product teams', colors: [{ hex: '#5E6AD2' }, { hex: '#1A1A1A' }] },
  { domain: 'vercel.com', brand_name: 'Vercel', emoji: 'V', description: 'Deploy and scale web applications', colors: [{ hex: '#000000' }, { hex: '#FFFFFF' }] },
  { domain: 'figma.com', brand_name: 'Figma', emoji: 'F', description: 'Collaborative interface design tool', colors: [{ hex: '#F24E1E' }, { hex: '#A259FF' }] },
  { domain: 'notion.so', brand_name: 'Notion', emoji: 'N', description: 'All-in-one workspace for notes and docs', colors: [{ hex: '#000000' }, { hex: '#FFFFFF' }] },
  { domain: 'apple.com', brand_name: 'Apple', emoji: 'A', description: 'Consumer electronics and software', colors: [{ hex: '#000000' }, { hex: '#F5F5F7' }] },
]

export default function Home() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recentKits, setRecentKits] = useState<BrandKit[]>([])
  const [loadingStep, setLoadingStep] = useState('')

  const steps = [
    'Fetching website...',
    'Scraping brand signals...',
    'Extracting colour palette...',
    'Identifying typography...',
    'Building token system...',
    'Assembling kit...',
  ]

  useEffect(() => {
    supabase
      .from('kits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => { if (data) setRecentKits(data) })
  }, [])

  async function handleExtract() {
    if (!url.trim()) return
    setLoading(true)
    setError('')

    let step = 0
    setLoadingStep(steps[0])
    const interval = setInterval(() => {
      step = Math.min(step + 1, steps.length - 1)
      setLoadingStep(steps[step])
    }, 1500)

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      clearInterval(interval)
      router.push(`/${data.kit.domain}`)
    } catch (err: any) {
      clearInterval(interval)
      setError(err.message || 'Something went wrong. Try again.')
      setLoading(false)
    }
  }

  const allGallery = recentKits.length >= 6
    ? recentKits
    : [...recentKits, ...SEEDED_BRANDS.filter(s => !recentKits.find(r => r.domain === s.domain))].slice(0, 6)

  return (
    <main style={{ minHeight: '100vh', background: 'var(--surface)' }}>

      <nav style={{
        padding: '1.5rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', letterSpacing: '-0.3px' }}>
          un<em>brand</em>
        </div>
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink-3)', letterSpacing: '1px' }}>
          BRAND KIT EXTRACTOR
        </div>
      </nav>

      <section style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '6rem 2rem 4rem',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--ff-mono)',
          fontSize: '11px',
          color: 'var(--ink-3)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '1.5rem',
        }}>
          v1.0 - free and open
        </div>

        <h1 style={{
          fontFamily: 'var(--ff-display)',
          fontSize: 'clamp(42px, 7vw, 80px)',
          fontWeight: 400,
          lineHeight: 1.05,
          letterSpacing: '-2px',
          marginBottom: '1.5rem',
        }}>
          Extract any brand<br />
          <em style={{ color: 'var(--ink-3)' }}>kit instantly</em>
        </h1>

        <p style={{
          fontSize: '17px',
          color: 'var(--ink-2)',
          lineHeight: 1.6,
          maxWidth: '480px',
          margin: '0 auto 3rem',
        }}>
          Paste a website URL. Get colors, typography, logo, spacing tokens, and Figma variables ready to use.
        </p>

        <div style={{
          display: 'flex',
          gap: '10px',
          maxWidth: '560px',
          margin: '0 auto',
          flexWrap: 'wrap',
        }}>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleExtract()}
            placeholder="https://stripe.com"
            disabled={loading}
            style={{
              flex: 1,
              minWidth: '240px',
              padding: '14px 18px',
              fontSize: '14px',
              fontFamily: 'var(--ff-mono)',
              border: '1px solid var(--border-3)',
              borderRadius: '10px',
              background: 'var(--surface)',
              color: 'var(--ink)',
              outline: 'none',
              opacity: loading ? 0.5 : 1,
            }}
          />
          <button
            onClick={handleExtract}
            disabled={loading}
            style={{
              padding: '14px 28px',
              background: 'var(--ink)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 500,
              opacity: loading ? 0.5 : 1,
              transition: 'opacity 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? loadingStep : 'Extract brand'}
          </button>
        </div>

        {error && (
          <div style={{
            marginTop: '1rem',
            padding: '10px 16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '13px',
            fontFamily: 'var(--ff-mono)',
            maxWidth: '560px',
            margin: '1rem auto 0',
          }}>
            {error}
          </div>
        )}
      </section>

      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '2rem 2rem 6rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink-3)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Recent kits
          </div>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink-4)' }}>
            {allGallery.length} brands extracted
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {allGallery.map((kit: any, i: number) => (
            
              key={kit.domain}
              href={`/${kit.domain}`}
              style={{
                display: 'block',
                background: 'var(--surface)',
                border: '1px solid var(--border-2)',
                borderRadius: '14px',
                padding: '1.25rem',
                transition: 'border-color 0.15s, transform 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-3)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '8px',
                  background: kit.colors?.[0]?.hex || '#f0f0f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 600, color: '#fff', flexShrink: 0,
                }}>
                  {kit.emoji}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '14px' }}>{kit.brand_name}</div>
                  <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--ink-3)' }}>{kit.domain}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(kit.colors || []).slice(0, 5).map((c: any, ci: number) => (
                  <div key={ci} style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: c.hex, border: '1px solid var(--border)',
                    flexShrink: 0,
                  }} />
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

    </main>
  )
}