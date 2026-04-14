'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { BrandKit } from '../../lib/types'

const SEEDED_BRANDS = [
  { domain: 'stripe.com', brand_name: 'Stripe', emoji: '⚡', description: 'Payment infrastructure for the internet', colors: [{ hex: '#635BFF' }, { hex: '#0A2540' }] },
  { domain: 'linear.app', brand_name: 'Linear', emoji: '◆', description: 'The issue tracker built for modern product teams', colors: [{ hex: '#5E6AD2' }, { hex: '#1A1A1A' }] },
  { domain: 'vercel.com', brand_name: 'Vercel', emoji: '▲', description: 'Deploy and scale web applications', colors: [{ hex: '#000000' }, { hex: '#FFFFFF' }] },
  { domain: 'figma.com', brand_name: 'Figma', emoji: '✦', description: 'Collaborative interface design tool', colors: [{ hex: '#F24E1E' }, { hex: '#A259FF' }] },
  { domain: 'notion.so', brand_name: 'Notion', emoji: '◻', description: 'All-in-one workspace for notes and docs', colors: [{ hex: '#000000' }, { hex: '#FFFFFF' }] },
  { domain: 'apple.com', brand_name: 'Apple', emoji: '⬤', description: 'Consumer electronics and software', colors: [{ hex: '#000000' }, { hex: '#F5F5F7' }] },
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
      setError(err.message || 'Something went wrong. Tr