# Vaultly - Build & Distribution Guide

Complete instructions for building and obtaining the Chrome Extension and Android APK files for direct use.

## Project Structure

```
v0-password-manager-app/
├── app/                    # Next.js web app (main application)
├── extension/              # Chrome extension source
├── mobileapp/              # React Native mobile app (Android/iOS)
├── lib/                    # Shared utilities and Firebase config
├── components/             # Reusable React components
└── public/                 # Static assets
```

## Chrome Extension (.crx file)

### Build the Extension

```bash
# Install dependencies
cd extension
npm install

# Build the extension
npm run build

# Output: extension/dist/ directory (ready for upload to Chrome Web Store)
```

### Get the .crx File

**Option 1: Load Unpacked in Chrome**
1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `extension/dist/` directory
5. The extension loads locally for testing

**Option 2: Chrome Web Store**
- Upload `extension/dist/` files to Chrome Web Store for distribution
- This generates a .crx file automatically

**Option 3: Manual .crx Generation**
```bash
# Pack the extension manually (requires Chrome)
# Open chrome://extensions/
# Click "Pack extension"
# Select extension/dist/ directory
# Generates: extension.crx file
```

### Extension Files Location

- **Source code:** `extension/src/`
- **Manifest:** `extension/manifest.json`
- **Built files:** `extension/dist/` (after build)
- **Styles:** `extension/styles/`
- **Images:** `extension/images/`

## Android APK File

### Build the Mobile App

#### Prerequisites
- Node.js 18+ and npm
- Android SDK (via Android Studio or `sdkmanager`)
- Java Development Kit (JDK 17+)
- Expo CLI

#### Development APK (for testing)

```bash
# Install dependencies
cd mobileapp
npm install

# Build development APK
npx expo prebuild --platform android

# Build with Gradle
cd android
./gradlew assembleDebug

# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

#### Production APK (signed for distribution)

```bash
cd mobileapp

# Option 1: Using EAS (Recommended for Play Store)
eas build --platform android --release

# Option 2: Manual signing with Gradle
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release-unsigned.apk
# Then sign with your keystore
```

### Signing the APK

```bash
# Create or use existing keystore
keytool -genkey -v -keystore vaultly-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 -alias vaultly

# Sign the APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore vaultly-release.keystore \
  android/app/build/outputs/apk/release/app-release-unsigned.apk vaultly

# Verify signature
jarsigner -verify -verbose \
  android/app/build/outputs/apk/release/app-release-unsigned.apk

# Align the APK (improves compression)
zipalign -v 4 app-release-unsigned.apk app-release-aligned.apk

# Final APK
mv app-release-aligned.apk vaultly-release.apk
```

### APK Files Location

- **Source code:** `mobileapp/src/`
- **Android config:** `mobileapp/android/`
- **Build config:** `mobileapp/app/build.gradle`
- **Manifest:** `mobileapp/android/app/src/main/AndroidManifest.xml`
- **Built APK:** `mobileapp/android/app/build/outputs/apk/`
  - Debug: `debug/app-debug.apk`
  - Release: `release/app-release.apk`

## Web Application

### Deploy to Vercel

```bash
# Push to GitHub (already connected)
git push origin main

# Vercel auto-deploys on push
# Live at: https://v0-password-manager-app.vercel.app
```

### Build Locally

```bash
# Build the Next.js app
npm run build

# Start production server
npm run start

# Output: .next/
```

## File Access After Build

| File Type | Location | Purpose |
|-----------|----------|---------|
| Chrome Extension | `extension/dist/` | Load unpacked in Chrome |
| Chrome .crx | Generated via Chrome | Chrome Web Store distribution |
| Android Debug APK | `mobileapp/android/app/build/outputs/apk/debug/app-debug.apk` | Testing on device/emulator |
| Android Release APK | `mobileapp/android/app/build/outputs/apk/release/app-release.apk` | Play Store submission |
| Signed APK | `vaultly-release.apk` | Direct distribution/sideload |

## Installation Instructions

### Chrome Extension

**From Unpacked:**
1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select `extension/dist/`
5. Extension appears in toolbar

**From .crx file:**
1. Drag `.crx` file into `chrome://extensions/`
2. Confirm installation

### Android APK

**Via USB Debugging:**
```bash
adb install vaultly-release.apk
```

**Via Android Studio:**
1. Open Android Studio
2. Device > Pair Using Wi-Fi or connect via USB
3. Drag `.apk` onto emulator/device

**Manual Sideload:**
1. Transfer `.apk` to phone
2. Settings > Apps > Allow installation from unknown sources
3. Tap `.apk` file to install

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Extension can read/write to Firebase
- [ ] Master PIN setup and verification works
- [ ] Password export functions correctly
- [ ] APK installs on Android 5.1+ (minimum SDK 21)
- [ ] All 9 screens render correctly
- [ ] Search and filtering work
- [ ] Password encryption/decryption works
- [ ] Auto-logout after timeout
- [ ] Biometric authentication (framework ready)

## Distribution

### Chrome Web Store
- Submit `extension/dist/` files
- Requires developer account ($5 one-time)
- Review time: 1-3 days

### Google Play Store
- Submit signed `vaultly-release.apk`
- Requires developer account ($25 one-time)
- Review time: 24-48 hours
- Requires:
  - App icon (192x192, 512x512)
  - Screenshots (phone/tablet)
  - Description & privacy policy
  - Content rating

### Direct Distribution
- Share signed APK via link/email
- Users install via Settings > Security > Unknown Sources
- No store review needed

## Troubleshooting

### Extension Issues
- Clear cache: `chrome://settings/clearBrowserData`
- Reload extension: Extensions page > reload button
- Check console: Right-click extension > Inspect popup

### Android Issues
- Build fails: `cd mobileapp && npm install --no-frozen-lockfile`
- Gradle sync: `cd mobileapp/android && ./gradlew clean`
- APK not installing: Check minimum SDK (must be 21+)

## Environment Variables

Required for both web and mobile:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## Deployment Paths

1. **Web App** → Deployed on Vercel (automatic)
2. **Chrome Extension** → Manual upload to Chrome Web Store
3. **Android App** → Manual upload to Google Play Store OR direct APK distribution

## Support

For issues:
- Extension: Check `chrome://extensions/` > Details > Errors
- Android: Use `adb logcat` for debugging
- Web: Check browser console (F12)
