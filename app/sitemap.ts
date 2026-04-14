import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: kits } = await supabase
    .from('kits')
    .select('domain, created_at')
    .order('created_at', { ascending: false })

  const kitPages = (kits || []).map((kit) => ({
    url: `https://unbrand.io/${kit.domain}`,
    lastModified: new Date(kit.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: 'https://unbrand.io',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...kitPages,
  ]
}