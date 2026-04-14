export interface BrandColor {
  name: string
  hex: string
  role: 'primary' | 'secondary' | 'accent' | 'background' | 'text' | string
}

export interface Typography {
  primary: {
    name: string
    style: string
    weights: number[]
    usage: string
  }
  secondary?: {
    name: string
    style: string
    weights: number[]
    usage: string
  }
  rules: string[]
}

export interface Logo {
  type: 'wordmark' | 'lettermark' | 'symbol' | 'combination'
  primaryColor: string
  backgroundColor: string
  render: string
  fontStyle: string
}

export interface Spacing {
  unit: number
  scale: number[]
}

export interface Radii {
  none: string
  sm: string
  md: string
  lg: string
  full: string
}

export interface Shadows {
  sm: string
  md: string
  lg: string
}

export interface BrandKit {
  id?: string
  domain: string
  brand_name: string
  emoji: string
  description: string
  colors: BrandColor[]
  typography: Typography
  logo: Logo
  spacing: Spacing
  radii: Radii
  shadows: Shadows
  figma_tokens: string
  source_url: string
  created_at?: string
}