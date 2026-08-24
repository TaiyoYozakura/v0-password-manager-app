# Vaultly - Quick Start & File Access Guide

## TL;DR - Get Your Files Right Now

### Chrome Extension (.crx or unpacked)
```bash
# Location: extension/dist/
# Status: Ready to load unpacked

# In Chrome:
1. chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the extension/dist/ folder
```

### Android APK
```bash
# Build it:
cd mobileapp
npm install --no-frozen-lockfile
cd android
./gradlew clean assembleDebug

# Output APK:
# mobileapp/android/app/build/outputs/apk/debug/app-debug.apk

# Install:
adb install mobileapp/android/app/build/outputs/apk/debug/app-debug.apk
```

### Web App
```bash
# Already deployed at:
# https://v0-password-manager-app.vercel.app

# Or run locally:
npm run dev
# Open http://localhost:3000
```

---

## File Locations & Access

### Project Structure
```
v0-password-manager-app/
├── extension/                 # Chrome extension source
│   ├── manifest.json         # Extension config
│   ├── src/                  # Source code
│   ├── build.js              # Build script
│   └── dist/                 # Built extension (load here)
│
├── mobileapp/                # React Native app
│   ├── src/                  # Source code
│   ├── android/              # Android build config
│   │   └── app/build/        # Built artifacts
│   │       └── outputs/
│   │           └── apk/      # APK files here
│   │               ├── debug/app-debug.apk
│   │               └── release/app-release.apk
│   └── package.json
│
├── app/                      # Next.js web app
│   └── (app)/               # Main app pages
│
├── lib/                      # Shared utilities
│   ├── firebase/            # Firebase functions
│   ├── crypto/              # Encryption utilities
│   └── types.ts             # TypeScript types
│
├── components/              # React components
│   ├── vault/              # Vault-specific
│   ├── ui/                 # UI components
│   └── providers/          # Context providers
│
├── public/                  # Static assets
├── package.json             # Root dependencies
└── .next/                   # Next.js build output
```

---

## How to Access Each File Type

### 1. Chrome Extension Files

**Current Status:** Source files only (not packaged)

**Option A: Load Unpacked (Easiest)**
```bash
# The extension/dist/ folder contains the ready-to-load extension
# In Chrome:
chrome://extensions/
→ Developer mode ON
→ Load unpacked
→ Select: extension/dist/
# Now loaded as an unpacked extension
```

**Option B: Get .crx File**
```bash
# Method 1: Via Chrome UI
chrome://extensions/
→ Right-click loaded extension
→ Pack extension
# Saves as: extension.crx

# Method 2: Via Chrome Web Store
# Upload extension/dist/ to Chrome Web Store for signed .crx
```

**Option C: Access Source**
```bash
# All source files in:
extension/src/
extension/manifest.json
extension/styles/
extension/images/
```

---

### 2. Android APK Files

**Debug APK (for testing):**
```bash
# Build:
cd mobileapp
npm install --no-frozen-lockfile
cd android && ./gradlew clean assembleDebug

# Output: mobileapp/android/app/build/outputs/apk/debug/app-debug.apk

# Install on device/emulator:
adb install mobileapp/android/app/build/outputs/apk/debug/app-debug.apk

# Or drag into Android Studio emulator
```

**Release APK (for Play Store/distribution):**
```bash
# Build:
cd mobileapp/android
./gradlew clean assembleRelease

# Output: android/app/build/outputs/apk/release/app-release-unsigned.apk

# Sign it:
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore vaultly.keystore \
  app-release-unsigned.apk vaultly

# Align:
zipalign -v 4 app-release-unsigned.apk vaultly-release.apk

# Result: vaultly-release.apk (ready for Play Store)
```

**Source & Config:**
```bash
# Source code:
mobileapp/src/

# Android config:
mobileapp/android/app/src/main/AndroidManifest.xml
mobileapp/app/build.gradle

# Build verification:
mobileapp/verify-build.sh
```

---

### 3. Web App Files

**Live Deployment:**
```
https://v0-password-manager-app.vercel.app
```

**Local Build:**
```bash
# Build Next.js app:
npm run build

# Output: .next/ directory

# Start server:
npm run start

# Or dev mode:
npm run dev
# http://localhost:3000
```

**Source:**
```bash
# Main app pages:
app/(app)/
  ├── dashboard/
  ├── vault/
  ├── settings/
  └── ...

# Web components:
components/
  ├── vault/
  ├── ui/
  └── providers/

# Shared logic:
lib/
  ├── firebase/
  ├── crypto/
  └── utils/
```

---

## Quick Build Commands

### Build All at Once
```bash
# Uses provided build script
./build-all.sh

# Outputs to: dist-builds/
# - chrome-extension-dist/
# - vaultly-debug.apk
```

### Build Individual Components

**Extension Only:**
```bash
cd extension && npm run build
# → extension/dist/
```

**Mobile Only:**
```bash
cd mobileapp
npm install --no-frozen-lockfile
cd android && ./gradlew clean assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

**Web Only:**
```bash
npm run build
# → .next/
```

---

## Direct File Download/Access

### From GitHub Releases
Once built and committed, APKs and extensions can be:
1. Added to GitHub Releases
2. Downloaded directly
3. Shared via link

### From Continuous Integration (CI)
Setup GitHub Actions to:
1. Build on every push
2. Create artifacts
3. Auto-upload to Play Store/Web Store

### Manual Download From Build Artifacts
After running `./build-all.sh`:
```bash
# All built files are copied to:
dist-builds/

# Download:
- dist-builds/chrome-extension-dist/  (drag into Chrome)
- dist-builds/vaultly-debug.apk        (adb install)
```

---

## Testing Each Platform

### Test Chrome Extension
```bash
# Load unpacked in Chrome
chrome://extensions/
→ Load unpacked
→ extension/dist/

# Test features:
→ Click extension icon
→ Sign in with Firebase
→ Add a password
→ Export as JSON/CSV
```

### Test Android APK
```bash
# Install debug APK
adb install mobileapp/android/app/build/outputs/apk/debug/app-debug.apk

# On device:
→ Open Vaultly
→ Sign in with Google
→ Set Master PIN
→ Add a password
→ Export passwords
```

### Test Web App
```bash
# Visit live deployment
https://v0-password-manager-app.vercel.app

# Or local:
npm run dev
# http://localhost:3000

# Test features:
→ Sign in with Google
→ Add password to vault
→ Export vault as JSON
```

---

## Sharing Built Files

### Share via Email/Cloud
```bash
# After building:
./build-all.sh

# Files ready to share:
dist-builds/vaultly-debug.apk
dist-builds/chrome-extension-dist/

# Upload to:
- Google Drive
- OneDrive
- Dropbox
- GitHub Release
```

### Direct Installation Links
Once uploaded:
- APK: Share direct download link
- Extension: Load unpacked folder or upload to Web Store
- Web: Share vercel.app domain

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Extension won't load | Enable Developer mode in chrome://extensions/ |
| APK build fails | Run `./gradlew clean` then rebuild |
| APK won't install | Check Android version ≥ 5.1 (SDK 21+) |
| Firebase errors | Verify .env variables are set |
| Extension 404 | Rebuild with `cd extension && npm run build` |

---

## Support Files

- **BUILD_AND_DISTRIBUTION.md** - Complete build guide
- **BUILD_RELEASE_GUIDE.md** - Mobile release build instructions  
- **DEPLOYMENT.md** - Web deployment guide
- **MOBILE_APP_README.md** - Mobile app documentation
- **build-all.sh** - Automated build script
- **cleanup.sh** - Repository cleanup script

Run any of these for more info:
```bash
cat BUILD_AND_DISTRIBUTION.md
cat QUICK_START_ACCESS.md  # This file
./build-all.sh --help     # Build script help
```
