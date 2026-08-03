# Vaultly Chrome Extension

A secure password manager extension for Chrome, Brave, Firefox, and Edge browsers. Store, manage, and autofill passwords with end-to-end encryption.

## Features

- **Password Autofill**: Quickly fill login forms with saved passwords
- **Secure Storage**: End-to-end encrypted password storage
- **Cross-Browser**: Works on Chrome, Brave, Firefox, and Edge
- **Easy Setup**: One-click installation and setup
- **Password Generator**: Generate strong, secure passwords
- **Form Detection**: Automatically detects login forms on websites
- **Session Persistence**: Secure session management with offline support

## Installation

### Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store soon. You'll be able to install it with a single click.

### Manual Installation - Chrome/Brave/Edge

1. **Locate the Extension Files**
   - The extension files are in the `extension/` directory
   - Make sure you have all files: `manifest.json`, `popup.js`, `popup.html`, `background.js`, `content.js`, `styles/popup.css`, and `images/icon-*.png`

2. **Package the Extension**
   - On macOS/Linux:
     ```bash
     cd extension
     npm run package
     ```
   - The extension will be packaged into a `.zip` file

3. **Load in Browser**

   **Chrome/Brave:**
   - Go to `chrome://extensions/` or `brave://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `extension` folder
   - The extension should now appear in your extensions list

   **Edge:**
   - Go to `edge://extensions/`
   - Enable "Developer mode" (toggle on left sidebar)
   - Click "Load unpacked"
   - Select the `extension` folder

   **Firefox (Coming Soon)**
   - Go to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file

### Drag and Drop Installation (Chrome/Brave/Edge)

1. Open your browser's extensions page:
   - Chrome: `chrome://extensions/`
   - Brave: `brave://extensions/`
   - Edge: `edge://extensions/`

2. Enable "Developer mode"

3. Download the extension ZIP file

4. Unzip the file to a folder

5. Drag and drop the folder into the extensions page

## File Structure

```
extension/
├── manifest.json          # Chrome extension manifest
├── popup.html            # Popup UI
├── popup.js              # Popup logic
├── background.js         # Service worker (background script)
├── content.js            # Content script for web pages
├── styles/
│   └── popup.css         # Popup styling
├── images/
│   ├── icon-16.png       # 16x16 icon
│   ├── icon-48.png       # 48x48 icon
│   └── icon-128.png      # 128x128 icon
├── package.json          # Node package configuration
└── README.md             # This file
```

## How to Use

### Basic Usage

1. **Open the Extension**
   - Click the Vaultly icon in your browser toolbar
   - Or use the keyboard shortcut (if set)

2. **Login**
   - First time: Click "Open Vaultly" to set up your account
   - Existing users: You'll be logged in automatically

3. **Autofill Passwords**
   - Navigate to a login page
   - Click the Vaultly extension icon
   - Select "Autofill Password"
   - The form will be filled automatically

4. **Context Menu**
   - Right-click on password fields for quick access:
     - "Autofill with Vaultly"
     - "Generate Password"
     - "Open Vaultly Vault"

### Advanced Features

**Generate Password**
- Click the extension icon → "Generate Password"
- Customize length, character types, etc.
- Copy to clipboard automatically

**View Vault**
- Click "View Vault" in the extension popup
- Opens the full Vaultly password manager
- Manage, edit, or delete passwords

**Settings**
- Click the settings icon (if visible)
- Configure autofill behavior
- Manage browser permissions
- Adjust security settings

## Keyboard Shortcuts

You can customize keyboard shortcuts in your browser:

- **Chrome/Brave**: Go to `chrome://extensions/shortcuts/`
- **Edge**: Go to `edge://extensions/shortcuts/`
- **Firefox**: Go to `about:addons` → Gear icon → Manage Extension Shortcuts

Suggested shortcuts:
- `Ctrl+Shift+L` (or `Cmd+Shift+L` on Mac): Autofill
- `Ctrl+Shift+G` (or `Cmd+Shift+G` on Mac): Generate Password
- `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac): Open Vault

## Security

- **End-to-End Encryption**: Passwords are encrypted on your device
- **No Server Storage**: Passwords are never stored unencrypted
- **Secure Session**: Session tokens are securely stored
- **HTTPS Only**: All connections are encrypted
- **No Tracking**: No analytics or tracking data collected

## Permissions

The extension requests the following permissions:

- **storage**: To save your session and preferences
- **activeTab**: To detect current website for autofill
- **scripting**: To inject autofill forms
- **tabs**: To manage browser tabs
- **webRequest**: To monitor authentication events

These permissions are necessary for the extension to function properly and are used securely.

## Troubleshooting

### Extension Not Showing
- Ensure "Developer mode" is enabled
- Check the extension is loaded in your extensions page
- Try restarting your browser

### Autofill Not Working
- Ensure you're logged into Vaultly
- Check that the website's login form is detected
- Try manually opening the extension popup

### Passwords Not Saving
- Verify you're logged into your Vaultly account
- Check your browser allows storage permissions
- Try clearing cache and cookies

### Form Detection Issues
- Not all password fields may be detected automatically
- Try right-clicking on the password field directly
- Use the "Autofill Password" option from the context menu

## Building and Packaging

### Development Build
```bash
cd extension
npm install
npm run dev
```

### Production Build
```bash
cd extension
npm run build
```

### Package for Distribution
```bash
cd extension
npm run package
```

This creates a `.zip` file ready for distribution or Web Store submission.

## Publishing to Chrome Web Store

1. **Create a Chrome Web Store Developer Account**
   - Go to https://chromewebstore.google.com/
   - Click "Developer Dashboard"
   - Sign up and pay the one-time registration fee

2. **Prepare Your Extension**
   - Package the extension: `npm run package`
   - Create a zip file of the extension folder

3. **Upload to Web Store**
   - Go to Developer Dashboard
   - Click "New item"
   - Select your .zip file
   - Fill in extension details (name, description, screenshots, etc.)
   - Upload 128x128 icon as store icon

4. **Submit for Review**
   - Review all information
   - Submit for review (usually takes 1-3 hours)
   - Your extension will be published once approved

## Publishing to Firefox Add-ons

1. **Create Mozilla Developer Account**
   - Go to https://addons.mozilla.org/
   - Sign up for a developer account

2. **Prepare for Firefox**
   - Update manifest.json for Firefox compatibility
   - Create a Firefox-specific build

3. **Submit**
   - Go to Firefox Developer Hub
   - Upload your extension
   - Wait for review (usually takes 24-48 hours)

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues, feature requests, or support:

- Visit: https://vaultly.app/support
- Email: support@vaultly.app
- GitHub Issues: https://github.com/TaiyoYozakura/v0-password-manager-app/issues

## License

This extension is part of Vaultly and is licensed under the same license as the main application. See LICENSE file for details.

## Privacy Policy

For information about how we handle your data, see our Privacy Policy at https://vaultly.app/privacy

## Terms of Service

By using this extension, you agree to our Terms of Service at https://vaultly.app/terms

## Changelog

### Version 2.0.0 (Current)
- Initial public release
- Autofill functionality
- Password generator
- Cross-browser support
- Improved UI and UX
- Enhanced security features

### Version 1.0.0 (Beta)
- Beta release for testing

---

Made with 🔐 by the Vaultly Team

For more information, visit https://vaultly.app
