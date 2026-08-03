// Mobile-friendly tag icon mapping (using Ionicons icon names)
export const TAG_ICON_MAP: Record<string, string> = {
  // Tech/Developer Tools
  github: 'logo-github',
  git: 'git-branch',
  gitlab: 'code-slash',
  aws: 'cloud',
  azure: 'cloud',
  docker: 'layers',
  kubernetes: 'server',
  
  // Email & Communication
  gmail: 'mail',
  outlook: 'mail',
  email: 'mail',
  protonmail: 'mail',
  
  // Shopping & Commerce
  amazon: 'bag',
  ebay: 'bag',
  etsy: 'bag',
  shopify: 'bag',
  
  // Social Media
  facebook: 'logo-facebook',
  instagram: 'logo-instagram',
  twitter: 'logo-twitter',
  x: 'logo-twitter',
  linkedin: 'logo-linkedin',
  discord: 'logo-discord',
  slack: 'logo-slack',
  tiktok: 'logo-tiktok',
  snapchat: 'logo-snapchat',
  telegram: 'send',
  whatsapp: 'logo-whatsapp',
  
  // Finance & Banking
  stripe: 'card',
  paypal: 'logo-paypal',
  square: 'grid',
  crypto: 'wallet',
  bitcoin: 'logo-bitcoin',
  ethereum: 'logo-ethereum',
  
  // Streaming & Media
  netflix: 'play-circle',
  spotify: 'musical-note',
  youtube: 'logo-youtube',
  disney: 'play-circle',
  hulu: 'film',
  
  // Work & Productivity
  notion: 'document-text',
  asana: 'checkmark-done',
  jira: 'checkmark-done',
  monday: 'calendar',
  hubspot: 'send',
  salesforce: 'trending-up',
  
  // Default
  other: 'lock',
  work: 'briefcase',
  personal: 'person',
  finance: 'card',
  shopping: 'bag',
  social: 'share-social',
  security: 'shield',
}

export function getTagIcon(tagName: string): string {
  if (!tagName) return 'lock'
  const lowerTag = tagName.toLowerCase().trim()
  return TAG_ICON_MAP[lowerTag] || 'lock'
}

export function getTagColor(tagName: string): string {
  const colors: Record<string, string> = {
    work: '#3b82f6',
    personal: '#8b5cf6',
    finance: '#ec4899',
    security: '#ef4444',
    shopping: '#f97316',
    social: '#06b6d4',
    health: '#10b981',
    entertainment: '#f59e0b',
  }
  
  const lowerTag = tagName.toLowerCase().trim()
  return colors[lowerTag] || '#8b5cf6'
}
