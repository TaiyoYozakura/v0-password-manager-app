# Vaultly - Complete File Access & Distribution Guide

## Quick Answer: Where Are My Files?

### Chrome Extension
- **Location**: `extension/dist/` (load unpacked in Chrome)
- **How to use**: 
  - Chrome → `chrome://extensions/` → Developer mode → Load unpacked → select `extension/dist/`
- **For .crx file**: Chrome Web Store or manual pack via browser

### Android APK
- **Debug APK**: Build with `cd mobileapp && npm install && cd android && ./gradlew clean assembleDebug`
- **Output**: `mobileapp/android/app/build/outputs/apk/debug/app-debug.apk`
- **Install**: `adb install mobileapp/android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: Same build, but `assembleRelease` instead (requires signing)

### Web App
- **Live**: https://v0-password-manager-app.vercel.app (auto-deployed from main branch)
- **Local**: `npm run dev` → http://localhost:3000

---

## Step-by-Step: Get Your Files Ready

### 1. Get the Chrome Extension

**Option A: Unpacked (Development)**
```bash
# Extension is ready now at:
extension/dist/

# Load in Chrome:
1. Open chrome://extensions/
2. Toggle "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the extension/dist/ folder
5. Done! Extension now appears in your toolbar
```

**Option B: Build .crx File**
```bash
# Method 1: Via Chrome
1. Load unpacked (as above)
2. Right-click the extension
3. "Pack extension..."
4. Downloads as extension.crx

# Method 2: For Chrome Web Store
# Package extension/dist/ and upload to:
# https://chrome.google.com/webstore/devconsole/
```

### 2. Get the Android APK

**Build Debug APK** (for testing)
```bash
cd mobileapp
npm install --no-frozen-lockfile  # First time only
cd android
./gradlew clean assembleDebug      # ~2-3 minutes
```

**APK Output Location:**
```
mobileapp/android/app/build/outputs/apk/debug/app-debug.apk
```

**Install on Device/Emulator:**
```bash
# Method 1: ADB (Android Debug Bridge)
adb install mobileapp/android/app/build/outputs/apk/debug/app-debug.apk

# Method 2: Drag into Android Studio emulator
# Method 3: Send file to phone and tap to install
```

**Build Release APK** (for Play Store)
```bash
cd mobileapp/android
./gradlew clean assembleRelease    # Creates unsigned APK

# Sign the APK (requires keystore):
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore /path/to/keystore.jks \
  app/build/outputs/apk/release/app-release-unsigned.apk alias_name

# Align (optimize):
zipalign -v 4 app-release-unsigned.apk app-release-signed.apk
```

**Output Location:**
```
mobileapp/android/app/build/outputs/apk/release/app-release-signed.apk
```

### 3. Web App

**Already Live**: https://v0-password-manager-app.vercel.app

**Run Locally:**
```bash
npm run dev
# Open http://localhost:3000
```

**Build for Production:**
```bash
npm run build
npm run start
```

---

## Project File Organization

### Source Code Locations

**Extension Source:**
```
extension/
├── manifest.json          # Extension configuration
├── src/
│   ├── content.ts         # Content script
│   ├── background.ts      # Background worker
│   ├── popup.tsx          # Popup UI
│   └── ...
├── styles/                # CSS/styling
├── images/                # Icons & assets
└── dist/                  # BUILD OUTPUT (ready to load)
```

**Mobile App Source:**
```
mobileapp/
├── src/
│   ├── screens/           # 9 screen components
│   ├── stores/            # Zustand state management
│   ├── services/          # Firebase & encryption
│   ├── utils/             # Utilities
│   └── App.tsx            # Entry point
├── android/               # Android native config
│   └── app/
│       └── build/
│           └── outputs/
│               └── apk/   # BUILD OUTPUT (APK files here)
└── app.json               # Expo config
```

**Web App Source:**
```
app/
├── (app)/                 # Main app routes
│   ├── dashboard/
│   ├── vault/
│   ├── settings/
│   └── ...
├── api/                   # API routes
│   ├── export/            # Export endpoints
│   └── ...
└── layout.tsx             # Root layout
```

**Shared Code:**
```
lib/
├── firebase/              # Firebase functions
│   ├── config.ts
│   ├── auth.ts
│   ├── passwords.ts
│   ├── profile.ts
│   └── ...
├── crypto/                # Encryption utilities
│   ├── encryption.ts
│   ├── bcrypt.ts
│   └── ...
├── types.ts               # TypeScript types
└── utils/                 # Shared utilities

components/
├── vault/                 # Vault components
│   ├── master-pin-dialog.tsx
│   ├── export-dialog.tsx
│   └── ...
├── ui/                    # UI components
└── providers/             # Context providers
```

---

## Automated Build Process

### Build Everything at Once

```bash
# Use the provided build script
./build-all.sh

# This:
# 1. Builds extension → extension/dist/
# 2. Builds web app → .next/
# 3. Builds mobile → mobileapp/android/app/build/outputs/apk/debug/
# 4. Copies outputs to dist-builds/
# 5. Shows summary
```

### Manual Build Commands

```bash
# Extension only
cd extension && npm run build
# Output: extension/dist/

# Web app only
npm run build
# Output: .next/

# Mobile debug APK only
cd mobileapp && npm install --no-frozen-lockfile
cd android && ./gradlew clean assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk

# Mobile release APK only
cd mobileapp/android
./gradlew clean assembleRelease
# Output: android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## Distribution Paths

### Chrome Extension

**To Chrome Web Store:**
1. Build: `cd extension && npm run build`
2. Zip: `extension/dist/`
3. Upload to: https://chrome.google.com/webstore/devconsole/
4. Review time: 1-3 days
5. Get: Auto-signed .crx file

**Direct Install (Unpacked):**
1. Chrome → `chrome://extensions/`
2. Enable Developer mode
3. Load unpacked → `extension/dist/`
4. Installed locally

### Android App

**To Google Play Store:**
1. Build release: `cd mobileapp/android && ./gradlew clean assembleRelease`
2. Sign: Use jarsigner with keystore
3. Upload to: https://play.google.com/console
4. Review time: 24-48 hours
5. Requires:
   - App icon
   - Screenshots
   - Description & privacy policy
   - Content rating

**Direct Installation (Sideload):**
1. Build: `./gradlew clean assembleDebug`
2. APK: `mobileapp/android/app/build/outputs/apk/debug/app-debug.apk`
3. Option A: `adb install app-debug.apk`
4. Option B: Send APK to phone, tap to install (enable unknown sources)

### Web App

**Already Live:**
- URL: https://v0-password-manager-app.vercel.app
- Auto-deploys from `main` branch
- No build step needed

**Self-Host:**
1. Build: `npm run build`
2. Deploy: Upload `.next/` to your server
3. Or use: Vercel, Netlify, or any Node.js host

---

## Accessing Files After Build

### From Your Machine

```bash
# Extension
ls -la extension/dist/

# Mobile APK
ls -la mobileapp/android/app/build/outputs/apk/debug/

# Web build
ls -la .next/
```

### From IDE/File Explorer

**VS Code:**
```
Ctrl+O (Cmd+O) → Select folder
extension/dist/           # Extension files
mobileapp/android/app/build/outputs/apk/debug/  # APK
```

**Finder/Explorer:**
```
Navigate to: extension/dist/
Navigate to: mobileapp/android/app/build/outputs/apk/debug/app-debug.apk
```

### From GitHub

Once committed, access via:
```
https://github.com/TaiyoYozakura/v0-password-manager-app/

Navigate to:
- extension/dist/     (for extension files)
- mobileapp/...       (for source)
- app/                (for web source)
```

---

## For Different Use Cases

### "I Want to Test the Extension"
```bash
cd extension && npm run build
# Then: chrome://extensions/ → Load unpacked → extension/dist/
```

### "I Want to Test the Mobile App"
```bash
cd mobileapp
npm install --no-frozen-lockfile
cd android && ./gradlew clean assembleDebug
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### "I Want to Deploy to Play Store"
```bash
# See Android section above - requires signing & account

# Build release:
cd mobileapp/android && ./gradlew clean assembleRelease

# Sign with your keystore
# Upload to: play.google.com/console
```

### "I Want to Deploy to Chrome Web Store"
```bash
# Build extension:
cd extension && npm run build

# Zip and upload:
# 1. Zip extension/dist/
# 2. Upload to chrome.google.com/webstore/devconsole/
# 3. Pay $5 (one-time)
# 4. Wait 1-3 days for review
```

### "I Want to Share with Friends"
```bash
# Share extension:
# Option 1: Send extension/dist/ folder
# Option 2: Share .crx file
# Option 3: Upload to Chrome Web Store (takes 1-3 days)

# Share mobile app:
# Option 1: Send APK file via email/drive
# Option 2: Use Firebase App Distribution for testing
# Option 3: Upload to Play Store
```

---

## Summary Table

| File Type | Location | How to Access | Distribution |
|-----------|----------|---------------|--------------|
| Extension | `extension/dist/` | Load unpacked in Chrome | Chrome Web Store |
| Extension .crx | Generated via Chrome | Chrome → Pack extension | Share .crx file |
| Mobile Debug APK | `mobileapp/android/app/build/outputs/apk/debug/app-debug.apk` | `adb install` | Testing only |
| Mobile Release APK | `mobileapp/android/app/build/outputs/apk/release/` | Upload to Play Store | Google Play Store |
| Web App | https://v0-password-manager-app.vercel.app | Visit URL | Already live |
| Web App (self-host) | `.next/` | Deploy to server | Any Node.js host |

---

## Cleanup & Maintenance

### Clean the Repository
```bash
./cleanup.sh
# Removes caches, logs, and build artifacts
```

### Rebuild After Cleanup
```bash
./build-all.sh
# Rebuilds everything from source
```

---

## Documentation

For more detailed information:
- **BUILD_AND_DISTRIBUTION.md** - Complete build & deploy guide
- **QUICK_START_ACCESS.md** - Quick access for all files
- **MOBILE_APP_README.md** - Mobile app specific
- **BUILD_RELEASE_GUIDE.md** - Release APK instructions
- **DEPLOYMENT.md** - Web deployment guide

---

**All files are ready. Start building with `./build-all.sh` or access individual files as shown above.**
