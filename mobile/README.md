# Vault Mobile (Expo + React Native)

End-to-end encrypted password manager for iOS and Android. Shares the same
Firestore vault format as the web app in this repo, so a vault created on web
can be opened on mobile and vice versa.

## Stack

- Expo SDK 51 + expo-router (file-based navigation)
- React Native 0.74 with NativeWind v4 (Tailwind classes)
- Firebase JS SDK (Auth + Firestore) with AsyncStorage persistence
- crypto-js + expo-crypto for AES-256-CBC + PBKDF2 (matches web)
- expo-local-authentication for Face ID / Touch ID / fingerprint
- expo-secure-store for biometric-protected PIN cache
- expo-clipboard with 30s auto-clear
- expo-auth-session/providers/google for Google Sign-In

## Setup

```bash
cd mobile
npm install         # or pnpm install / yarn install
cp .env.example .env
# fill in EXPO_PUBLIC_FIREBASE_* values from Firebase console
# fill in EXPO_PUBLIC_GOOGLE_*_CLIENT_ID values (see "Google Sign-In" below)
npx expo start
```

Then scan the QR code with **Expo Go** on iOS or Android, or press `i` / `a` to
launch a simulator/emulator.

## Firebase env vars

Same Firebase project as the web app. Use the **`EXPO_PUBLIC_`** prefix:

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

## Google Sign-In

Mobile uses `expo-auth-session/providers/google` (Firebase's `signInWithPopup`
does not work in React Native). You need OAuth client IDs from
[Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. Create three **OAuth 2.0 Client IDs** under your Firebase Google Cloud project:
   - **iOS** - bundle id `com.example.vault` (matches `app.json`)
   - **Android** - package `com.example.vault`, SHA-1 from your debug keystore
   - **Web** - any authorized URI (used by Expo Go via auth-session proxy)
2. Add them to `.env`:

```
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...apps.googleusercontent.com
```

3. In **Firebase Console → Authentication → Sign-in method → Google**, make
   sure Google is enabled. The same web client ID Firebase shows there should
   be the one you put in `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

## Encryption

Identical to the web app:

- **Master key**: `PBKDF2-SHA256(uid + ":" + pin, salt = SHA256("vault-master-salt:" + uid), 100_000 iters, 256-bit)`
- **PIN verifier**: `PBKDF2-SHA256("verify:" + pin, randomSalt, 100_000 iters)` - only the verifier hash and salt are stored, never the PIN.
- **Per-field**: `AES-256-CBC` with a fresh random IV per field. Fields stored as `{ ciphertext, iv, salt }`.
- **Biometric cache**: when enabled, the PIN is stored in `expo-secure-store` with `requireAuthentication: true` so the OS keychain only releases it after a Face ID / Touch ID / fingerprint check.
- **Memory**: master key lives only in a `useRef` inside `AuthProvider`. Cleared on lock, sign out, or app backgrounding.

## Vault interoperability

Mobile and web use the same Firestore paths:

- `users/{uid}` - profile + PIN verifier
- `users/{uid}/passwords/{id}` - encrypted password entries
- `users/{uid}/pins/{id}` - encrypted PIN entries

Use the same `firestore.rules` from the repo root.

## Build for stores

```bash
npx expo install --check
npm install -g eas-cli
eas login
eas build --platform ios       # or android, or all
```

You'll need an Apple Developer account for iOS builds and a Google Play
Console account for Android distribution.
