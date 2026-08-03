import {
  Chrome,
  Github,
  Mail,
  ShoppingCart,
  Code2,
  Building2,
  Briefcase,
  Music,
  Film,
  DollarSign,
  CreditCard,
  Globe,
  Cloud,
  Server,
  Database,
  Lock,
  Shield,
  Smartphone,
  Tablet,
  Watch,
  GamepadIcon,
  Headphones,
  Camera,
  Map,
  Navigation,
  Zap,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  AtSign,
  Search,
  Activity,
  BarChart3,
  File,
  FileText,
  Download,
  Upload,
  Share2,
  Settings,
  Tool,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

export type TagIcon = React.ComponentType<{ className?: string }>

interface TagIconMap {
  [key: string]: TagIcon
}

// Common website and app names mapped to icons
const TAG_ICON_MAP: TagIconMap = {
  // Tech/Developer Tools
  github: Github,
  git: Github,
  gitlab: Code2,
  bitbucket: Code2,
  aws: Cloud,
  azure: Cloud,
  "google cloud": Cloud,
  heroku: Cloud,
  vercel: Cloud,
  netlify: Cloud,
  "digital ocean": Cloud,
  docker: Container,
  kubernetes: Server,
  terraform: Server,
  jenkins: Server,
  github: Github,
  gitlab: Code2,
  notion: FileText,
  jira: Settings,
  confluence: FileText,
  slack: MessageCircle,
  discord: MessageCircle,
  teams: MessageCircle,
  
  // Email & Communication
  gmail: Mail,
  outlook: Mail,
  yahoo: Mail,
  protonmail: Mail,
  "google mail": Mail,
  tutanota: Mail,
  
  // Shopping & Commerce
  amazon: ShoppingCart,
  ebay: ShoppingCart,
  etsy: ShoppingCart,
  flipkart: ShoppingCart,
  alibaba: ShoppingCart,
  shopify: ShoppingCart,
  
  // Social Media
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  x: Twitter,
  linkedin: Linkedin,
  tiktok: Music,
  snapchat: Camera,
  telegram: MessageCircle,
  whatsapp: MessageCircle,
  viber: MessageCircle,
  signal: MessageCircle,
  
  // Banking & Finance
  bank: DollarSign,
  banking: DollarSign,
  paypal: CreditCard,
  stripe: CreditCard,
  square: CreditCard,
  wise: DollarSign,
  revolut: DollarSign,
  coinbase: DollarSign,
  kraken: DollarSign,
  binance: DollarSign,
  
  // Entertainment
  netflix: Film,
  disney: Film,
  "disney plus": Film,
  hulu: Film,
  "amazon prime": Film,
  spotify: Music,
  apple: Music,
  "apple music": Music,
  youtube: Film,
  twitch: Film,
  steam: GamepadIcon,
  playstation: GamepadIcon,
  xbox: GamepadIcon,
  nintendo: GamepadIcon,
  
  // Productivity & Office
  microsoft: Settings,
  excel: FileText,
  word: FileText,
  "google docs": FileText,
  "google sheets": FileText,
  "google drive": Cloud,
  dropbox: Cloud,
  onedrive: Cloud,
  "icloud": Cloud,
  
  // Mobile & Devices
  apple: Smartphone,
  google: Smartphone,
  samsung: Smartphone,
  iphone: Smartphone,
  android: Smartphone,
  ipad: Tablet,
  
  // Security & Privacy
  "1password": Lock,
  "last pass": Lock,
  lastpass: Lock,
  bitwarden: Lock,
  dashlane: Lock,
  keepass: Lock,
  nordvpn: Shield,
  expressvpn: Shield,
  surfshark: Shield,
  mullvad: Shield,
  protonvpn: Shield,
  
  // Search & Navigation
  google: Search,
  bing: Search,
  duckduckgo: Search,
  maps: Map,
  "google maps": Map,
  
  // Default categories
  work: Briefcase,
  personal: Shield,
  social: MessageCircle,
  shopping: ShoppingCart,
  banking: DollarSign,
  entertainment: Film,
  education: Book,
  health: Activity,
  other: Globe,
  
  // Variants
  microsoft365: Settings,
  "m365": Settings,
  office365: Settings,
  "google account": Chrome,
  "google": Chrome,
}

/**
 * Get the icon component for a tag name
 * Returns a Lucide icon component or the Globe icon as fallback
 */
export function getTagIcon(tagName: string): TagIcon {
  if (!tagName) return Globe
  
  // Normalize the tag name for lookup
  const normalized = tagName.toLowerCase().trim()
  
  // Check for exact match
  if (TAG_ICON_MAP[normalized]) {
    return TAG_ICON_MAP[normalized]
  }
  
  // Check for partial match (e.g., "Microsoft Teams" matches "teams")
  for (const [key, icon] of Object.entries(TAG_ICON_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return icon
    }
  }
  
  // Return default Globe icon for unknown tags
  return Globe
}

/**
 * Check if a tag has a specific icon mapping
 */
export function hasTagIcon(tagName: string): boolean {
  if (!tagName) return false
  const normalized = tagName.toLowerCase().trim()
  
  if (TAG_ICON_MAP[normalized]) return true
  
  for (const key of Object.keys(TAG_ICON_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return true
    }
  }
  
  return false
}

/**
 * Get all available tag suggestions with icons
 */
export function getCommonTags(): Array<{ name: string; icon: TagIcon }> {
  const seen = new Set<string>()
  const tags: Array<{ name: string; icon: TagIcon }> = []
  
  for (const [name, icon] of Object.entries(TAG_ICON_MAP)) {
    // Skip variations and only include main tags
    if (!seen.has(name)) {
      seen.add(name)
      // Capitalize first letter for display
      const displayName = name.charAt(0).toUpperCase() + name.slice(1)
      tags.push({ name: displayName, icon })
    }
  }
  
  return tags.sort((a, b) => a.name.localeCompare(b.name))
}

// Import icon that was missing from initial imports
const Container = Code2 // Placeholder for Docker container
const Book = FileText // Placeholder for Education icon
