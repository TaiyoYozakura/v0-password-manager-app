# Custom Tag Icons Feature

## Overview

Vaultly now supports automatic favicon fetching for custom tags. When users create a tag that isn't in the hardcoded list of 80+ services, they can optionally provide a website URL to fetch and display that site's favicon alongside the tag.

## How It Works

### Standard Tags
When creating a password/PIN with a standard tag (GitHub, AWS, Gmail, etc.):
- Icon is assigned automatically from the 80+ service mappings
- No user interaction required
- Icon displays in tag badges throughout the app

### Custom Tags
When creating a password/PIN with a custom tag:
1. User enters custom tag name (e.g., "MyCompany")
2. System checks if tag is in standard service list
3. If NOT found → Custom Tag Icon Dialog opens
4. User can:
   - **Provide URL**: Enter website URL to fetch favicon
   - **Skip**: Use default Globe icon for the tag
5. Favicon is fetched and displayed in preview
6. User confirms to save with custom icon

## User Flow

```
Create/Edit Password
    ↓
Enter Tag Name
    ↓
Standard Tag? → Yes → Use automatic icon → Save
    ↓
No
    ↓
Custom Tag Icon Dialog
    ↓
[User chooses: Fetch URL | Skip]
    ↓
Fetch URL: Enter URL → Fetch Favicon → Preview → Confirm
    ↓
Skip: Use default icon
    ↓
Save with custom/default icon
```

## Components

### lib/utils/favicon.ts
**Purpose**: Favicon fetching utility

**Functions**:
- `fetchFavicon(url: string): Promise<string>`
  - Takes a website URL
  - Tries multiple fallback methods:
    1. `https://favicon.io/` API
    2. Direct `/favicon.ico` from domain
    3. Checks for favicon in `<head>` via MetaTags API
  - Returns favicon as data URL
  - Throws error if all methods fail

- Helper functions for URL validation and conversion

**Features**:
- Auto-completes URLs (adds https:// if missing)
- Handles CORS issues via external services
- Converts images to data URLs for storage
- Error handling with user-friendly messages

### components/vault/custom-tag-icon-dialog.tsx
**Purpose**: Dialog for custom tag icon configuration

**Props**:
```tsx
interface Props {
  tagName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onIconSelected: (iconUrl: string | null) => void
}
```

**Features**:
- URL input field with validation
- "Fetch" button with loading state
- Favicon preview with fallback handling
- "Skip" button to use default icon
- "Use Icon" button to confirm selection
- Error alerts for failed fetches

**Example Usage**:
```tsx
<CustomTagIconDialog
  tagName="MyCompany"
  open={showDialog}
  onOpenChange={setShowDialog}
  onIconSelected={(iconUrl) => {
    // Save with icon (or null for default)
    saveTag("MyCompany", iconUrl)
  }}
/>
```

### components/vault/tag-selector.tsx
**Purpose**: Interactive tag selection with icon dialog integration

**Changes**:
- Detects when user creates custom tag
- Checks if tag exists in standard services via `hasTagIcon()`
- Triggers `CustomTagIconDialog` for non-standard tags
- Passes custom icon URL back to form
- Handles standard tags directly

**Props Extended**:
```tsx
interface Props {
  tags: string[]
  value: string
  onSelect: (tag: string, iconUrl?: string) => void // Now includes optional iconUrl
  className?: string
}
```

### components/vault/tag-badge.tsx
**Purpose**: Tag display with icon support

**Props Extended**:
```tsx
interface Props {
  tag: string
  className?: string
  showIcon?: boolean
  customIconUrl?: string  // New: custom favicon URL
}
```

**Rendering Priority**:
1. If `customIconUrl` provided → Display favicon image
2. Else if `showIcon` true → Display Lucide icon
3. Else → Display tag text only

## Data Storage

### Type Updates

**EncryptedPasswordDoc** (Firestore):
```tsx
interface EncryptedPasswordDoc {
  // ... existing fields
  tagIconUrl?: string  // Data URL of custom favicon
}
```

**DecryptedPasswordEntry** (In-memory):
```tsx
interface DecryptedPasswordEntry {
  // ... existing fields
  tagIconUrl?: string  // Data URL of custom favicon
}
```

**PasswordInput** (Form):
```tsx
interface PasswordInput {
  // ... existing fields
  tagIconUrl?: string  // Custom favicon data URL
}
```

### Storage Strategy
- Custom favicons stored as data URLs (base64 encoded images)
- Stored alongside password entry in Firestore
- Encrypted with rest of password data
- Optional field - standard tags don't store icon URL

## API Integration

### Favicon Fetching Methods

**Primary**: favicon.io API
- URL: `https://favicon.io/download/?url={domain}`
- Pros: Reliable, CORS-friendly, high quality
- Format: Returns direct image file

**Fallback 1**: Direct favicon.ico
- URL: `https://{domain}/favicon.ico`
- Pros: Standard location
- Cons: Not always available

**Fallback 2**: MetaTags API
- URL: `https://metatags.io/?url={url}`
- Pros: Extracts metadata including og:image
- Format: Returns JSON with image property

**Conversion to Data URL**:
- Image fetched → Converted to Canvas → Data URL
- Ensures storage compatibility
- Works offline after caching

## Error Handling

| Error | Message | Action |
|-------|---------|--------|
| Invalid URL | "Please enter a valid URL" | Show input validation |
| Fetch failed | "Failed to fetch favicon" | Retry or Skip |
| No favicon found | "No favicon found for URL" | Skip or try different URL |
| CORS blocked | "Unable to fetch favicon (CORS)" | Suggest alternative |
| Timeout | "Request timed out" | Retry |

## Usage Examples

### Creating Password with Custom Tag and Icon
```tsx
// User enters "MyStartup" as custom tag
// Dialog opens automatically
// User provides: https://mystartup.com
// Favicon fetched and previewed
// User clicks "Use Icon"
// Password saved with custom icon

const entry = {
  siteName: "MyStartup App",
  tag: "MyStartup",
  tagIconUrl: "data:image/png;base64,iVBORw0KGgo..."
}
```

### Displaying Tag with Custom Icon
```tsx
<TagBadge 
  tag="MyStartup"
  customIconUrl="data:image/png;base64,iVBORw0KGgo..."
/>

// Renders: [favicon] MyStartup
```

### Skipping Custom Icon
```tsx
// User enters "RandomService" as custom tag
// Dialog opens
// User clicks "Skip"
// Tag saved with default Globe icon

const entry = {
  siteName: "Random Service",
  tag: "RandomService"
  // tagIconUrl is undefined
}
```

## Security Considerations

1. **Data URLs in Storage**
   - Favicons stored as data URLs (base64)
   - No external references = no tracking
   - Still encrypted before storage

2. **URL Validation**
   - User-provided URLs validated
   - Only used for fetching favicon
   - Not stored or used elsewhere

3. **Image Processing**
   - Client-side conversion only
   - No server processing
   - Canvas API for image handling
   - CORS handled via external services

4. **Size Limits**
   - Favicons typically < 10KB
   - Stored alongside encrypted data
   - Automatic cleanup for corrupted data URLs

## Performance

- **Favicon Fetching**: 1-2 seconds average
- **Caching**: Cached in component state during session
- **Storage**: Data URL adds ~5-10KB per custom tag
- **Display**: Image rendering at 3.5×3.5px (minimal impact)

## Browser Compatibility

- Data URLs: IE8+
- Canvas API: IE9+
- Fetch API: All modern browsers
- Image handling: All modern browsers

## Future Enhancements

1. **Batch Favicon Fetching**
   - Pre-fetch favicons for all tags during vault load
   - Cache favicons in IndexedDB

2. **CDN Integration**
   - Cache favicons on CDN
   - Reduce fetch time

3. **Image Optimization**
   - Convert to WebP for smaller size
   - Progressive placeholder images

4. **Tag Categories**
   - Group tags by category
   - Suggest icons by category

5. **Custom Icon Upload**
   - Allow users to upload custom images
   - Support emoji as alternative

## Troubleshooting

### Favicon Not Fetching
1. Check URL is correct and accessible
2. Try different URL format (add/remove www)
3. Try URL without path (e.g., example.com not example.com/page)
4. Check website has favicon or og:image

### Wrong Icon Showing
1. Website may have multiple favicons
2. favicon.io caches for 7 days
3. Try refreshing app data or using different URL

### Icon Not Saving
1. Check custom tag is properly saved
2. Verify tagIconUrl field in database
3. Check data URL is valid format

