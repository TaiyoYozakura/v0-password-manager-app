# Vaultly Chrome Extension - Quick Installation Guide

Complete guide to install and use the Vaultly password manager extension.

## Download the Extension

The extension package is ready at: `dist/vaultly-extension-v2.0.0.tar.gz`

### What's Included
- Complete Chrome extension ready to install
- All icons and assets
- Background service worker
- Content scripts for autofill
- Popup UI for password management
- Documentation and setup guides

## Installation Options

### Option 1: Load in Chrome/Brave/Edge (Recommended)

#### Step 1: Extract the Package
```bash
# Extract the extension files
tar -xzf dist/vaultly-extension-v2.0.0.tar.gz

# Navigate to the extension folder
cd .vaultly-extension-temp
```

#### Step 2: Load in Your Browser

**For Chrome:**
1. Open `chrome://extensions/` in your address bar
2. Toggle "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `.vaultly-extension-temp` folder
5. The extension appears in your extension list

**For Brave:**
1. Open `brave://extensions/` in your address bar
2. Toggle "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `.vaultly-extension-temp` folder

**For Edge:**
1. Open `edge://extensions/` in your address bar
2. Toggle "Developer mode" (left sidebar)
3. Click "Load unpacked"
4. Select the `.vaultly-extension-temp` folder

#### Step 3: Verify Installation
- The Vaultly icon (🔐) should appear in your toolbar
- Click it to open the popup
- You're ready to use the extension!

### Option 2: Drag and Drop Installation

1. Extract the package: `tar -xzf dist/vaultly-extension-v2.0.0.tar.gz`
2. Open `chrome://extensions/` (or `brave://extensions/` or `edge://extensions/`)
3. Enable "Developer mode"
4. Drag and drop the extracted folder onto the page
5. Installation complete!

### Option 3: Manual Installation (From ZIP)

1. Create a ZIP file of the extracted folder:
   ```bash
   tar -xzf vaultly-extension-v2.0.0.tar.gz
   cd .vaultly-extension-temp
   # Create zip (or use your file manager)
   zip -r ../vaultly-extension.zip .
   ```

2. Extract the ZIP to a folder
3. Follow the "Load Unpacked" instructions above

## First Time Setup

### Step 1: Open the Extension
1. Click the Vaultly icon (🔐) in your toolbar
2. The popup opens showing the login screen

### Step 2: Create Your Account or Login
- **New Users**: Click "Open Vaultly" to set up your account
- **Existing Users**: You'll be logged in automatically if you have an active session

### Step 3: Set Up Master PIN (First Time)
1. Go to https://vaultly.app
2. Create your account or sign in
3. Set up your Master PIN (8-digit code)
4. Confirm and save

### Step 4: Start Using
- The extension is ready to autofill passwords!

## Using the Extension

### Autofill Passwords

**Method 1: Extension Popup**
1. Navigate to a login page
2. Click the Vaultly icon in your toolbar
3. Select "Autofill Password"
4. The form fills automatically

**Method 2: Right-Click Context Menu**
1. Right-click on a password field
2. Select "Autofill with Vaultly"
3. The form fills automatically

**Method 3: Keyboard Shortcut** (if configured)
- Default: `Ctrl+Shift+L` (Windows/Linux) or `Cmd+Shift+L` (Mac)
- Go to extension settings to customize

### Generate a Strong Password

1. Click the Vaultly icon
2. Select "Generate Password"
3. Customize options if needed
4. Copy to clipboard

### View Your Vault

1. Click the Vaultly icon
2. Select "View Vault"
3. Opens your full password manager at vaultly.app

## Extension Features

### Password Autofill
- Automatically detects login forms
- Fills email/username and password fields
- Works on most websites

### Password Generator
- Generate cryptographically secure passwords
- Customize length and character types
- Copy to clipboard instantly

### Context Menu Integration
- Right-click on any password field
- Quick access to autofill and generate options

### Session Management
- Secure session storage
- Auto-logout for security
- Manual logout from popup

### Form Detection
- Automatically detects password forms
- Shows suggestions for multiple forms
- Clear error messages

## Troubleshooting

### Extension Doesn't Appear in Toolbar
1. Go to extensions page (chrome://extensions/)
2. Verify Vaultly extension is listed
3. Check if extension is enabled
4. Pin extension to toolbar (click pin icon)

### Autofill Not Working
1. Verify you're logged in
2. Check that the password field is detected
3. Try the context menu instead
4. Clear browser cache and reload

### Cannot Login
1. Verify your Vaultly account exists
2. Check your Master PIN is correct
3. Go to https://vaultly.app to verify login
4. Check internet connection

### Extension Crashes
1. Remove the extension
2. Clear your browser cache
3. Reinstall the extension
4. Contact support if problem persists

## Security & Privacy

- **End-to-End Encrypted**: Your passwords are encrypted on your device
- **No Server Storage**: Passwords never stored unencrypted on servers
- **Secure Session**: Session data is securely managed
- **No Tracking**: No analytics or tracking code
- **Open Source**: Code is publicly available for review

## Keyboard Shortcuts

Configure shortcuts in your browser settings:

**Chrome/Brave:** Go to `chrome://extensions/shortcuts/` or `brave://extensions/shortcuts/`
**Edge:** Go to `edge://extensions/shortcuts/`

Suggested shortcuts:
- `Ctrl+Shift+L`: Autofill Password
- `Ctrl+Shift+G`: Generate Password
- `Ctrl+Shift+V`: Open Vault

## Browser Permissions

The extension requests these permissions:

- **Storage**: Save your session and preferences
- **Active Tab**: Detect current website
- **Scripting**: Inject autofill forms
- **Tabs**: Manage browser tabs
- **Web Request**: Monitor authentication

These are necessary for the extension to function and are used securely.

## Update the Extension

Extensions update automatically, but you can also:

1. Go to `chrome://extensions/` (or your browser equivalent)
2. Look for "Update" button next to Vaultly extension
3. Click to install latest version

## Uninstall the Extension

1. Go to `chrome://extensions/` (or your browser equivalent)
2. Find "Vaultly - Password Manager"
3. Click the "Remove" button
4. Confirm removal

## Need Help?

- **Documentation**: See `extension/README.md`
- **Distribution Guide**: See `extension/DISTRIBUTION.md`
- **Website**: https://vaultly.app
- **Support**: support@vaultly.app
- **GitHub**: https://github.com/TaiyoYozakura/v0-password-manager-app/issues

## What's Next?

1. **Verify Installation**: Test autofill on a website
2. **Set Up Master PIN**: Go to settings in Vaultly app
3. **Add Passwords**: Save passwords as you log into websites
4. **Customize**: Configure shortcuts and autofill behavior
5. **Share**: Tell friends about Vaultly!

## File Structure Reference

```
vaultly-extension-v2.0.0.tar.gz (extracted)
├── manifest.json          # Extension configuration
├── popup.html            # Popup interface
├── popup.js              # Popup logic
├── background.js         # Background service worker
├── content.js            # Web page content script
├── styles/
│   └── popup.css         # Styling
├── images/
│   ├── icon-16.png       # Small icon
│   ├── icon-48.png       # Medium icon
│   └── icon-128.png      # Large icon
└── README.md             # Extension documentation
```

---

**Version:** 2.0.0  
**Last Updated:** August 2024  
**Browser Support:** Chrome, Brave, Edge, Firefox  
**Status:** Ready to Install

🔐 Secure your passwords today with Vaultly!
