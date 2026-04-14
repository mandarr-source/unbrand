import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import * as cheerio from 'cheerio'
import { supabaseAdmin } from '../../../lib/supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function scrapeWebsite(url: string) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; UnbrandBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    const html = await res.text()
    const $ = cheerio.load(html)

    const colors: string[] = []
    const fonts: string[] = []

    $('[style]').each((_, el) => {
      const style = $(el).attr('style') || ''
      const colorMatches = style.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)/g)
      if (colorMatches) colors.push(...colorMatches)
    })

    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr('href')
      if (href) fonts.push(href)
    })

    const title = $('title').text()
    const description = $('meta[name="description"]').attr('content') || ''
    const favicon = $('link[rel*="icon"]').attr('href') || ''
    const ogImage = $('meta[property="og:image"]').attr('content') || ''

    return { title, description, favicon, ogImage, colors: [...new Set(colors)].slice(0, 20), fonts }
  } catch {
    return null
  }
}

function buildPrompt(url: string, domain: string, scraped: any) {
  const scrapedContext = scraped
    ? `Scraped data from the live site:
- Page title: ${scraped.title}
- Meta description: ${scraped.description}
- Colors found in HTML: ${scraped.colors.join(', ')}
- Font links: ${scraped.fonts.join(', ')}`
    : 'Could not scrape live site — use your training knowledge only.'

  return `You are a brand identity analyst. Extract the complete brand system for "${url}" (domain: ${domain}).

${scrapedContext}

Return ONLY a valid JSON object, no markdown, no explanation, exactly this structure:

{
  "brand_name": "Display name",
  "emoji": "single emoji",
  "description": "one sentence about what this company does",
  "colors": [
    { "name": "Color name", "hex": "#XXXXXX", "role": "primary" },
    { "name": "Color name", "hex": "#XXXXXX", "role": "secondary" },
    { "name": "Color name", "hex": "#XXXXXX", "role": "accent" },
    { "name": "Color name", "hex": "#XXXXXX", "role": "background" },
    { "name": "Color name", "hex": "#XXXXXX", "role": "text" }
  ],
  "typography": {
    "primary": { "name": "Font name", "style": "sans-serif", "weights": [400, 500, 700], "usage": "Headlines and UI" },
    "secondary": { "name": "Font name or null", "style": "serif", "weights": [400], "usage": "Body text" },
    "rules": ["Rule 1", "Rule 2", "Rule 3"]
  },
  "logo": {
    "type": "wordmark",
    "primaryColor": "#XXXXXX",
    "backgroundColor": "#XXXXXX",
    "render": "text or initials to display",
    "fontStyle": "font-weight: 700;"
  },
  "spacing": {
    "unit": 4,
    "scale": [4, 8, 12, 16, 24, 32, 48, 64]
  },
  "radii": {
    "none": "0px",
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 6px rgba(0,0,0,0.07)",
    "lg": "0 10px 15px rgba(0,0,0,0.10)"
  },
  "figma_tokens": "/* Figma Tokens */\n--color-primary: #XXXXXX;\n--color-secondary: #XXXXXX;\n--font-primary: 'Font Name';\n--spacing-unit: 4px;"
}

Be precise. Use real hex values. Return ONLY the JSON.`
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    let cleanUrl = url.trim()
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl

    const domain = new URL(cleanUrl).hostname.replace('www.', '')

    // Check if we already have this kit
    const { data: existing } = await supabaseAdmin
      .from('kits')
      .select('*')
      .eq('domain', domain)
      .single()

    if (existing) return NextResponse.json({ kit: existing, cached: true })

    // Scrape live site
    const scraped = await scrapeWebsite(cleanUrl)

    // Call Anthropic
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: buildPrompt(cleanUrl, domain, scraped) }],
    })

    const rawText = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as any).text)
      .join('')

    const clean = rawText.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    // Save to Supabase
    const kitData = {
      domain,
      source_url: cleanUrl,
      brand_name: parsed.brand_name,
      emoji: parsed.emoji,
      description: parsed.description,
      colors: parsed.colors,
      typography: parsed.typography,
      logo: parsed.logo,
      spacing: parsed.spacing,
      radii: parsed.radii,
      shadows: parsed.shadows,
      figma_tokens: parsed.figma_tokens,
    }

    const { data: saved, error } = await supabaseAdmin
      .from('kits')
      .insert(kitData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ kit: saved, cached: false })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Extraction failed' }, { status: 500 })
  }
}