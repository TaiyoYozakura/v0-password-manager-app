# Vaultly Mobile App - Release Build Guide

## Prerequisites

- Android SDK installed (API 34)
- Java Development Kit (JDK 11+)
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Keystore file (for signing)

## Step 1: Generate Android Keystore

If you don't have a keystore yet:

```bash
keytool -genkey -v -keystore vaultly-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias vaultly-key -storepass [PASSWORD] \
  -keypass [PASSWORD]
```

**IMPORTANT:**
- Save the keystore file outside the repository
- Store the passwords securely
- Back up the keystore immediately
- Never commit keystore to git

## Step 2: Prepare Environment Variables

Create a `.env.release` file with:

```bash
KEYSTORE_PATH=/path/to/vaultly-release.keystore
KEYSTORE_PASSWORD=your_keystore_password
KEY_ALIAS=vaultly-key
KEY_PASSWORD=your_key_password
```

## Step 3: Pre-Release Checklist

Before building, verify:

- [ ] All tests pass locally
- [ ] No console errors or warnings
- [ ] Version number updated in `app.json`
- [ ] Firebase credentials correct for production
- [ ] API endpoints point to production
- [ ] Debug logging is disabled
- [ ] No test accounts in code
- [ ] No mock data is shipped
- [ ] All dependencies are compatible

```bash
cd mobileapp

# Run tests
npm test

# Check for console errors
npm run lint

# Verify build succeeds
npm run build
```

## Step 4: Build Release APK

### Option A: Using Expo (Recommended for Initial Release)

```bash
cd mobileapp

# Build for Android
eas build --platform android --auto-submit

# Or manual build
eas build --platform android
```

### Option B: Using Gradle Directly

```bash
cd mobileapp/android

# Set environment variables
export KEYSTORE_PATH=../vaultly-release.keystore
export KEYSTORE_PASSWORD=your_password
export KEY_ALIAS=vaultly-key
export KEY_PASSWORD=your_password

# Build release APK
./gradlew assembleRelease

# Build release bundle (recommended for Play Store)
./gradlew bundleRelease
```

**Output files:**
- APK: `mobileapp/android/app/build/outputs/apk/release/app-release.apk`
- Bundle: `mobileapp/android/app/build/outputs/bundle/release/app-release.aab`

## Step 5: Verify Release Build

```bash
# Verify APK is signed
jarsigner -verify -verbose -certs mobileapp/android/app/build/outputs/apk/release/app-release.apk

# Check file size
ls -lh mobileapp/android/app/build/outputs/apk/release/app-release.apk

# Expected size: 15-25 MB (depending on dependencies)
```

## Step 6: Test Release Build

### On Device/Emulator

```bash
# Uninstall any debug builds
adb uninstall com.vaultly.app

# Install release APK
adb install -r mobileapp/android/app/build/outputs/apk/release/app-release.apk

# Run through regression testing checklist
# See REGRESSION_TESTING_CHECKLIST.md
```

### Full Test Scenarios

1. **Clean Install**
   - First launch with no existing data
   - Google Sign-In flow
   - Master PIN setup
   - Add test passwords
   - Verify all features work

2. **Data Integrity**
   - Add multiple passwords
   - Verify each appears in list
   - Edit and delete passwords
   - Search functionality
   - Tag filtering

3. **Performance**
   - Load time < 3 seconds
   - Vault scroll is smooth
   - No memory leaks
   - Battery drain minimal

4. **Security**
   - Master PIN unlock works
   - Auto-lock timeout works
   - Biometric ready (UI present)
   - No plain text in logs

## Step 7: Prepare for Play Store

### Create Google Play Console Account

- Go to https://play.google.com/console
- Create developer account ($25 one-time fee)
- Agree to terms

### Create App Entry

```
1. Create new app
2. Name: "Vaultly - Secure Password Manager"
3. Default language: English
4. Category: Tools / Productivity
5. Type: Application
6. Free or Paid: Choose appropriately
```

### Prepare Store Listing

- **Title:** Vaultly - Secure Password Manager
- **Short Description:** Keep your passwords safe and accessible
- **Full Description:**
  ```
  Vaultly is a secure, end-to-end encrypted password manager for Android.
  
  Features:
  • Secure password storage with end-to-end encryption
  • Master PIN for additional security
  • Password generator with custom options
  • Search and organize passwords
  • Auto-lock timeout
  • Biometric authentication ready
  
  Privacy: Your data stays on your device. We never store or see your passwords.
  ```
- **Screenshots:** 4-5 screenshots (1080x1920)
- **Icon:** 512x512 PNG
- **Feature graphic:** 1024x500 PNG
- **Privacy policy URL:** https://vaultly.app/privacy
- **Support email:** support@vaultly.app

### Content Rating

- Fill out content rating questionnaire
- Select age-appropriate ratings

### Pricing & Distribution

- Pricing: Free or $X.XX
- Countries: Select availability regions
- Require Android version: 5.0+
- Target Android version: 14.0+

## Step 8: Upload Release Build to Play Store

```bash
# Upload APK/Bundle to Google Play Console
# 1. Go to Release > Production
# 2. Create new release
# 3. Upload app-release.aab
# 4. Review and confirm
# 5. Roll out to 100% of users

# Or use bundletool for testing before upload
bundletool build-apks --bundle=app-release.aab \
  --output=app.apks \
  --ks=vaultly-release.keystore \
  --ks-pass=pass:your_password \
  --ks-key-alias=vaultly-key \
  --key-pass=pass:your_password

# Install test APKs
bundletool install-apks --apks=app.apks
```

## Step 9: Create Release PR

```bash
# Tag the release
git tag -a v2.0.0 -m "Release version 2.0.0"

# Push tag
git push origin v2.0.0

# Create GitHub release
# Go to https://github.com/[org]/[repo]/releases
# Create release notes with:
# - What's new
# - Bug fixes
# - Known issues
# - Download links (APK, Play Store)
```

## Step 10: Post-Release Verification

- [ ] APK available on Play Store
- [ ] APK can be downloaded and installed
- [ ] All features work in production
- [ ] Firebase production database is connected
- [ ] Error logging is working
- [ ] Monitor crash reports for 24 hours

## Troubleshooting

### Build Fails with "Keystore not found"

```bash
# Check env vars
echo $KEYSTORE_PATH

# Verify keystore exists
ls -la $KEYSTORE_PATH

# Set explicitly in build command
KEYSTORE_PATH=/full/path/to/keystore.jks ./gradlew assembleRelease
```

### APK Not Signing

```bash
# Verify keystore password
keytool -list -v -keystore vaultly-release.keystore

# Check gradle signing config
cat mobileapp/android/app/build.gradle | grep -A 10 signingConfigs
```

### Play Store Rejects APK

Common reasons:
- APK not signed properly
- Target SDK too old (should be 34+)
- Min SDK too high (should be 21+)
- Uses deprecated APIs
- Sensitive permissions not justified
- Privacy policy missing

See Play Store console for specific rejection reason.

### App Crashes on Production

- Check Crashlytics dashboard
- Review Firebase error logs
- Common causes:
  - Missing environment variables
  - API endpoint differences
  - Firebase permissions
  - Network connectivity

## Version Management

Update version for next release:

```bash
# Edit app.json
{
  "expo": {
    "version": "2.1.0",
    ...
  }
}

# Update Android version
# mobileapp/android/app/build.gradle
versionCode = 3
versionName = "2.1.0"

# Commit changes
git add -A
git commit -m "chore: bump version to 2.1.0"
```

## Security Best Practices

1. **Keystore Management**
   - Store keystore in secure location
   - Use strong passwords (20+ characters)
   - Back up keystore immediately
   - Never share keystore credentials
   - Use separate keystores for dev/prod

2. **Signing**
   - Always sign release builds
   - Never use debug key for production
   - Verify signature before distribution
   - Use same key for app updates

3. **Code Security**
   - Enable ProGuard/R8 obfuscation
   - Remove debug logging
   - Validate all inputs
   - Use HTTPS for all API calls
   - Encrypt sensitive data

4. **Distribution**
   - Only distribute through official stores
   - Never email APK directly
   - Verify checksums after upload
   - Document all security measures

## Support & Contact

- **Email:** support@vaultly.app
- **Issues:** [GitHub Issues URL]
- **Documentation:** [Documentation URL]

---

**Last Updated:** 2024
**Maintainer:** [Your Name]
