# Vaultly Extension Distribution Guide

Complete guide for packaging and distributing the Vaultly Chrome extension across multiple platforms.

## Quick Start

### 1. Build & Package Extension
```bash
cd extension
npm install
npm run package
```

This creates:
- `dist/vaultly-extension-v2.0.0.zip` - For Chrome Web Store
- `dist/vaultly-extension-v2.0.0.tar.gz` - For alternative distribution

### 2. Load in Browser (Development)

**Chrome:**
```
1. Go to chrome://extensions/
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the extension/ folder
```

**Brave:**
```
1. Go to brave://extensions/
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the extension/ folder
```

**Edge:**
```
1. Go to edge://extensions/
2. Enable "Developer mode" (left sidebar)
3. Click "Load unpacked"
4. Select the extension/ folder
```

**Firefox:**
```
1. Go to about:debugging#/runtime/this-firefox
2. Click "Load Temporary Add-on"
3. Select manifest.json
```

## Chrome Web Store Distribution

### Step 1: Create Developer Account
1. Go to https://chromewebstore.google.com/
2. Click "Developer Dashboard"
3. Sign in with Google account
4. Pay $5 registration fee (one-time)

### Step 2: Prepare Extension
```bash
cd extension
npm run package
```

Package includes:
- All extension files
- Icons (16x16, 48x48, 128x128)
- Manifest and documentation

### Step 3: Upload to Web Store
1. Go to Developer Dashboard: https://chromewebstore.google.com/developer/dashboard
2. Click "New Item"
3. Upload `dist/vaultly-extension-v2.0.0.zip`

### Step 4: Fill in Store Listing
Fill in the following information:

**Basic Information:**
- Name: "Vaultly - Password Manager"
- Short description: "Secure password manager with end-to-end encryption"
- Full description: See FULL_DESCRIPTION.txt

**Graphics:**
- Icon (128x128): `extension/images/icon-128.png`
- Screenshot (1280x800): Create additional screenshots

**Permissions:**
- Explain why each permission is needed (provided in README)

**Category:** Productivity

**Content Rating:** Select appropriate rating

### Step 5: Submit for Review
1. Review all information
2. Accept terms of service
3. Submit for review

**Review Time:** Usually 30 minutes to 1 hour

### Step 6: Publish
Once approved:
- Extension appears on Chrome Web Store
- Users can install with one click
- Share store link: https://chromewebstore.google.com/detail/vaultly-password-manager/[EXTENSION_ID]

## Firefox Add-ons Distribution

### Step 1: Create Mozilla Developer Account
1. Go to https://addons.mozilla.org/developers/
2. Create account or sign in
3. Verify email address

### Step 2: Prepare for Firefox
Create `extension/manifest.firefox.json`:
```json
{
  "manifest_version": 3,
  "name": "Vaultly - Password Manager",
  "version": "2.0.0",
  "description": "Secure password manager with end-to-end encryption",
  "browser_specific_settings": {
    "gecko": {
      "id": "vaultly@example.com",
      "strict_min_version": "109.0"
    }
  },
  "...": "rest of manifest"
}
```

### Step 3: Submit to Firefox Add-ons
1. Go to https://addons.mozilla.org/developers/
2. Click "Submit a New Add-on"
3. Upload extension ZIP
4. Select "Mozilla Firefox"
5. Agree to terms

### Step 4: Fill in Details
- Name
- Category: Privacy & Security
- Description
- Screenshots
- License

### Step 5: Submit for Review
**Review Time:** Usually 24-48 hours

### Step 6: Publish
Once approved:
- Available on https://addons.mozilla.org/
- Users can install with one click

## Edge Add-ons Distribution

### Step 1: Enroll in Partner Center
1. Go to https://partner.microsoft.com/
2. Sign in with Microsoft account
3. Create Developer account
4. Verify email

### Step 2: Create App Submission
1. Go to Partner Center: https://partner.microsoft.com/dashboard/
2. Click "Create new edge extension"
3. Fill in basic info

### Step 3: Upload Extension
1. Package extension as ZIP
2. Upload to Partner Center
3. Select supported platforms

### Step 4: Fill in Store Details
- Name: "Vaultly - Password Manager"
- Description
- Category: Productivity
- Language: English

### Step 5: Submit for Review
**Review Time:** Usually 1-2 hours

### Step 6: Publish
Once approved:
- Available on Microsoft Edge Add-ons
- Users can install from Edge Web Store

## Manual Distribution

### Create Installation Package
```bash
cd extension
npm run package
```

### Option 1: Drag and Drop
1. Unzip `vaultly-extension-v2.0.0.zip`
2. Open browser extensions page:
   - Chrome: `chrome://extensions/`
   - Brave: `brave://extensions/`
   - Edge: `edge://extensions/`
3. Enable "Developer mode"
4. Drag and drop the extension folder

### Option 2: Load Unpacked
1. Unzip `vaultly-extension-v2.0.0.zip`
2. Open browser extensions page
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension folder

### Option 3: Self-hosted Distribution
1. Host ZIP file on your server
2. Create download page
3. Users download and unzip
4. Follow manual installation steps

## Version Updates

### Update Version Number
1. Edit `extension/package.json`:
   ```json
   "version": "2.1.0"
   ```

2. Edit `extension/manifest.json`:
   ```json
   "version": "2.1.0"
   ```

### Build New Package
```bash
cd extension
npm run package
```

### Update in Web Stores
- **Chrome Web Store**: Upload new ZIP to dashboard
- **Firefox Add-ons**: Create new version
- **Edge Add-ons**: Upload to Partner Center

## Testing Before Distribution

### Functionality Testing
- [ ] Installation in Chrome
- [ ] Installation in Brave
- [ ] Installation in Edge
- [ ] Installation in Firefox
- [ ] Popup opens correctly
- [ ] Autofill works
- [ ] Context menu appears
- [ ] Password generation works
- [ ] Settings page loads

### Security Testing
- [ ] No console errors
- [ ] Permissions are necessary
- [ ] No tracking/analytics
- [ ] SSL/HTTPS only
- [ ] No sensitive data in logs

### Compatibility Testing
- [ ] Works on Windows
- [ ] Works on macOS
- [ ] Works on Linux
- [ ] Works with latest browser versions

## Troubleshooting

### Extension Won't Load
- Check manifest.json for syntax errors
- Ensure all required files exist
- Check file paths in manifest

### Upload Fails to Web Store
- Verify ZIP file format
- Check icon dimensions
- Ensure all required fields filled
- Review content policy

### Low Review Score
- Add more screenshots
- Improve description
- Request user feedback
- Address privacy concerns

## Best Practices

### Before Publishing
1. Run full test suite
2. Check for console errors
3. Verify all permissions are used
4. Test on multiple browsers
5. Get peer review

### Store Listing
1. Write clear description
2. Use professional screenshots
3. Highlight key features
4. Be honest about permissions
5. Include privacy policy

### After Publishing
1. Monitor ratings
2. Respond to reviews
3. Fix bugs promptly
4. Release updates regularly
5. Engage with users

## Support Resources

- **Chrome Web Store API**: https://developer.chrome.com/docs/webstore/
- **Firefox Add-ons**: https://extensionworkshop.com/
- **Edge Add-ons**: https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/
- **Firefox Developer Hub**: https://addons.mozilla.org/developers/

## Contact & Support

For questions about distribution:
- Email: support@vaultly.app
- GitHub: https://github.com/TaiyoYozakura/v0-password-manager-app
- Website: https://vaultly.app

---

Last Updated: August 2024
Version: 2.0.0
