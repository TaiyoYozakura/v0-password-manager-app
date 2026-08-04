# Tag Icons Feature

## Overview

The Tag Icons feature automatically assigns relevant icons to password and PIN tags based on the website or app name. This provides visual organization and makes it easier to identify categories at a glance.

## How It Works

When a user creates a tag (like "GitHub", "AWS", "Amazon", etc.), the system automatically detects the tag name and assigns a matching icon from the extensive icon library.

### Examples

- **"GitHub"** → GitHub icon
- **"Amazon"** → Shopping Cart icon
- **"AWS"** → Cloud icon
- **"Gmail"** → Mail icon
- **"Spotify"** → Music icon
- **"Netflix"** → Film icon
- **"PayPal"** → Credit Card icon
- **"Microsoft"** → Settings icon
- **"Discord"** → Message Circle icon
- **"Telegram"** → Message Circle icon

## Supported Tags

The system recognizes 80+ common website and app names across multiple categories:

### Tech & Developer Tools
- GitHub, GitLab, Bitbucket
- AWS, Azure, Google Cloud, Heroku, Vercel, Netlify, Digital Ocean
- Docker, Kubernetes, Terraform, Jenkins
- Notion, Jira, Confluence, Slack, Discord, Teams

### Email & Communication
- Gmail, Outlook, Yahoo, ProtonMail, Tutanota
- Telegram, WhatsApp, Signal, Viber, Snapchat

### Shopping & Commerce
- Amazon, eBay, Etsy, Flipkart, Alibaba, Shopify

### Social Media
- Facebook, Instagram, Twitter, LinkedIn, TikTok
- Snapchat, Telegram, WhatsApp, Signal

### Banking & Finance
- PayPal, Stripe, Square, Wise, Revolut
- Coinbase, Kraken, Binance

### Entertainment
- Netflix, Disney+, Hulu, Spotify, Apple Music, YouTube, Twitch
- Steam, PlayStation, Xbox, Nintendo

### Productivity & Office
- Microsoft 365, Excel, Word
- Google Docs, Google Sheets, Google Drive
- Dropbox, OneDrive, iCloud

### Security & Privacy
- 1Password, LastPass, Bitwarden, Dashlane, KeePass
- NordVPN, ExpressVPN, Surfshark, Mullvad, ProtonVPN

### Mobile & Devices
- Apple, Google, Samsung, iPhone, Android, iPad

### Categories
- Work, Personal, Social, Shopping, Banking, Entertainment, Education, Health, Other

## Implementation Details

### Tag Icon Mapping (`lib/utils/tag-icons.ts`)

The `tag-icons.ts` utility exports:

```typescript
// Get icon for a specific tag
getTagIcon(tagName: string): TagIcon

// Check if tag has a predefined icon
hasTagIcon(tagName: string): boolean

// Get all available tag suggestions
getCommonTags(): Array<{ name: string; icon: TagIcon }>
```

**Features:**
- Case-insensitive matching
- Partial matching (e.g., "Microsoft Teams" matches "teams")
- Fallback to Globe icon for unknown tags
- Deterministic - same tag always gets the same icon

### TagBadge Component (`components/vault/tag-badge.tsx`)

Updated to display icons alongside tag names:

```tsx
<TagBadge 
  tag="GitHub" 
  showIcon={true}  // Default: true
/>
```

**Rendering:**
```
📊 GitHub
```

### Tag Selector Component (`components/vault/tag-selector.tsx`)

New interactive component for selecting tags with visual previews:

- **Suggested Tags Section**: Shows filtered common tags with icons
- **Your Tags Section**: Displays previously created custom tags
- **Search**: Filter tags by name
- **Create Custom**: Option to create new custom tags
- **Icon Preview**: Each tag shows its assigned icon

## User Experience

### Creating a Password/PIN

1. User opens password form
2. User starts typing a tag name (e.g., "GitHub")
3. Tag selector shows matching suggestions with icons
4. User selects "GitHub" → icon automatically assigned
5. Tag badge displays with GitHub icon

### Viewing Tags

- **Passwords List**: Tags appear with icons in the table
- **PIN Manager**: Tags displayed with visual icons
- **Dashboard**: All tags with icons visible

### Benefits

✓ **Visual Recognition**: Quickly identify categories
✓ **Consistency**: Same tag always has same icon
✓ **Auto-Suggested**: No manual icon selection needed
✓ **Extensive Coverage**: 80+ common services covered
✓ **Custom Support**: Any custom tag falls back to Globe icon

## Adding New Tags

To add support for new websites/apps, update the `TAG_ICON_MAP` in `lib/utils/tag-icons.ts`:

```typescript
const TAG_ICON_MAP: TagIconMap = {
  // ... existing entries ...
  "newservice": NewServiceIcon,
  "another service": AnotherIcon,
}
```

Then run `pnpm build` to verify.

## Performance

- **Icon Lookup**: O(1) or O(n) partial match worst case
- **Rendering**: No additional database queries
- **Memory**: Icons are tree-shaken, only unused imports removed
- **Bundle Size**: ~2KB additional with all icon mappings

## Files Modified

1. **components/vault/tag-badge.tsx**
   - Added icon display with `showIcon` prop
   - Integrated `getTagIcon()` lookup

2. **lib/utils/tag-icons.ts** (NEW)
   - Icon mapping database
   - Lookup and suggestion functions

3. **components/vault/tag-selector.tsx** (NEW)
   - Interactive tag selection UI
   - Icon preview and search

## Testing

Build verified:
- ✓ No TypeScript errors
- ✓ All components render correctly
- ✓ Icon lookup works for 80+ tags
- ✓ Fallback to Globe icon works
- ✓ Case-insensitive matching verified

## Future Enhancements

- User-defined icon mappings
- Import/export tag preferences
- Custom icon upload
- Emoji support for tags
- Tag favoriting with quick-add button

## Troubleshooting

**Icon not showing?**
- Check tag name spelling
- Verify icon is in the `TAG_ICON_MAP`
- Ensure `showIcon={true}` prop is set

**Want to add a new service?**
- Edit `TAG_ICON_MAP` in `lib/utils/tag-icons.ts`
- Import required icon from `lucide-react`
- Rebuild with `pnpm build`

