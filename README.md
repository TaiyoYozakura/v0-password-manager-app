# Vaultly - Secure End-to-End Encrypted Password Manager

A modern, privacy-first password manager with client-side encryption, browser extension support, and real-time synchronization across devices.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-production--ready-success)

---

## What is Vaultly?

Vaultly is a secure password manager that prioritizes **your privacy and security** above all else. Unlike traditional password managers that require trust in the provider, Vaultly uses **true end-to-end encryption** where your vault is encrypted client-side and the backend never sees your passwords.

### The Problem It Solves

- **Password Security**: Most people reuse weak passwords across websites
- **Data Breaches**: Centralized password managers can be compromised
- **Privacy Concerns**: You shouldn't have to trust a company with your most sensitive data

### Our Solution

Vaultly provides a zero-knowledge architecture where:
- Your master password encrypts everything using **XChaCha20-Poly1305**
- The backend only stores encrypted data blobs
- Your encryption key is derived locally using **Argon2id**
- Only you can decrypt your vault

---

## Key Features

### Core Vault Management
- 🔒 **Encrypted Vault** - All passwords, PINs, and notes encrypted with XChaCha20-Poly1305
- 🔑 **Master Password Protection** - Argon2id key derivation prevents brute-force attacks
- 🌐 **Web Application** - Access your vault from any browser
- 📱 **Browser Extension** - Chrome/Edge/Arc support with autofill and save-password prompts
- ⚡ **Real-time Sync** - Changes sync instantly across devices via WebSocket

### Password & PIN Management
- 🔄 **Password Generator** - Cryptographically secure generation with custom options
- 📊 **Password Strength Meter** - Visual feedback on password security
- 📌 **PIN Manager** - Secure storage for PINs with categorization
- 🏷️ **Tagging System** - Organize passwords by tags for easy filtering
- 🔍 **Global Search** - Full-text search across all vault items

### Security & Privacy
- 🚀 **Client-Side Encryption** - No plaintext data ever sent to backend
- 🔐 **Secure Notes** - Encrypted notes for sensitive information
- 📊 **Security Dashboard** - Weak password detection and security audit
- 🛡️ **No Password Recovery** - True end-to-end encryption means intentionally no backdoor
- 💾 **Encrypted Backups** - Export encrypted vault exports for disaster recovery

### User Experience
- 🌓 **Dark & Light Themes** - Full theme support with system detection
- 📱 **Responsive UI** - Works perfectly on desktop, tablet, and mobile
- ⌨️ **Autofill** - Browser extension fills passwords automatically
- 💾 **Smart Save Prompts** - Detects new passwords and offers to save
- 🎯 **Floating UI** - Accessible autofill popup that works on any website

### Additional Features
- ⭐ **Favorites** - Quick access to frequently used passwords
- 📜 **Activity History** - Track who accessed what and when
- 📤 **Import/Export** - Bulk import from other password managers
- 🔄 **Cross-Device Sync** - Real-time synchronization
- 🧹 **Duplicate Cleanup** - Find and remove duplicate passwords

---

## Live Application

### Web Dashboard
**URL**: https://vaultly.vercel.app

Access your complete vault from any device. Sign in with Google or Master PIN authentication.

**Features**:
- Full vault management
- Security dashboard
- Backup & restore
- Settings and preferences

---

## Browser Extension

### Download & Installation

**Current Version**: 2.0.0  
**Compatibility**: Chrome, Edge, Arc (Chromium-based)

#### Manual Installation Guide

1. **Download the extension ZIP** from the [releases page](https://github.com/TaiyoYozakura/v0-password-manager-app/releases)

2. **Extract the ZIP file** to a folder (e.g., `~/vaultly-extension`)

3. **Open Chrome extensions page**:
   - Type `chrome://extensions` in the address bar
   - Or: Menu → More tools → Extensions

4. **Enable Developer Mode**:
   - Toggle "Developer mode" in the top-right corner

5. **Load the extension**:
   - Click "Load unpacked"
   - Select the extracted extension folder
   - Click "Select folder"

6. **Pin the extension** (optional):
   - Click the puzzle icon in the toolbar
   - Click the pin icon next to Vaultly

7. **Sign in & unlock**:
   - Click the Vaultly extension icon
   - Sign in with Google or Master PIN
   - Your vault unlocks automatically

8. **Start using autofill**:
   - Visit any website with a password field
   - The Vaultly popup appears automatically
   - Click to autofill or save new passwords

#### For Other Chromium Browsers
The same process works for:
- **Microsoft Edge** (`edge://extensions`)
- **Arc Browser** (Extensions menu)
- **Brave** (`brave://extensions`)
- **Opera** (`opera://extensions`)

---

## Screenshots

### Web Dashboard
- Vault overview with passwords, PINs, and notes
- Quick search and filtering
- Security audit dashboard

### Browser Extension
- Autofill popup (appears on login forms)
- Save password prompt (appears on successful login)
- Extension popup for manual access

### Security Dashboard
- Weak password detection
- Breach database integration
- Password change recommendations

### Settings
- Backup and restore controls
- Theme preferences
- Security settings

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (React 19, TypeScript)
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **Runtime**: Next.js API Routes
- **Database**: Firebase Firestore (stores encrypted data only)
- **Authentication**: Firebase Auth + Master PIN
- **Real-time**: WebSocket + polling fallback

### Encryption & Security
- **Algorithm**: XChaCha20-Poly1305 (AEAD)
- **Key Derivation**: Argon2id (64MB, 3 iterations, 4 parallelism)
- **Random Generation**: TweetNaCl.js cryptographically secure RNG
- **Hashing**: SHA-256 for verification

### Browser Extension
- **Framework**: Manifest V3
- **Architecture**: Content scripts + service worker
- **State**: Zustand with persistent storage

### Deployment
- **Hosting**: Vercel (Next.js)
- **CDN**: Vercel Edge Network
- **Analytics**: Vercel Analytics

---

## Security Model

### Client-Side Encryption

```
User Master Password
        ↓
Argon2id Key Derivation (256-bit)
        ↓
XChaCha20-Poly1305 Encryption
        ↓
Encrypted Vault Blob
        ↓
Backend stores only encrypted blob
```

### Key Principles

1. **Zero-Knowledge**: Backend never sees master password or encryption key
2. **No Backdoor**: Intentionally no password recovery mechanism
3. **End-to-End**: All encryption happens client-side before syncing
4. **Authenticated Encryption**: XChaCha20-Poly1305 prevents tampering
5. **Strong KDF**: Argon2id prevents brute-force attacks

### What's Protected

✅ All passwords (username, email, URL, notes)  
✅ All PINs and codes  
✅ All notes and sensitive information  
✅ Vault metadata (item count, structure)  
✅ User activity history (who accessed what)  

### What's Not Protected

- User email (needed for authentication)
- Session tokens (temporary, 24-hour expiration)
- API usage metadata

### Important: No Password Recovery

This is a **security feature**, not a limitation. If your master password is lost:
- Your vault cannot be recovered (unless you have an encrypted backup)
- No one, including us, can reset your password
- This prevents attackers from exploiting recovery mechanisms

**Recommendation**: Export encrypted backups monthly to secure storage.

See [RECOVERY_STRATEGY.md](docs/RECOVERY_STRATEGY.md) for complete recovery guidelines.

---

## Local Development

### Prerequisites

- Node.js 18+ and pnpm
- Firebase project (for local development)
- Google OAuth credentials (for local testing)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/TaiyoYozakura/v0-password-manager-app
   cd v0-password-manager-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.development.local
   ```
   
   Add your Firebase credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```
   
   Open http://localhost:3000

5. **Build for production**
   ```bash
   pnpm build
   pnpm start
   ```

### Development Workflow

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build optimized production bundle
- `pnpm lint` - Run ESLint checks
- `pnpm start` - Start production server

---

## Project Structure

```
vaultly-password-manager/
├── app/                          # Next.js app directory
│   ├── (app)/                   # Protected routes
│   │   ├── dashboard/           # Main vault dashboard
│   │   ├── settings/            # User settings
│   │   └── security/            # Security dashboard
│   ├── api/v2/                  # API endpoints
│   │   ├── auth/               # Authentication endpoints
│   │   ├── vault/              # Vault CRUD endpoints
│   │   └── sync/               # Real-time sync
│   ├── login/                  # Login page
│   └── page.tsx                # Home page
│
├── components/                  # React components
│   ├── ui/                     # Radix UI + shadcn components
│   ├── vault/                  # Vault-specific components
│   └── providers/              # Context providers
│
├── lib/                        # Utilities and services
│   ├── api/                   # API client services
│   ├── crypto/                # Encryption utilities (v2-encryption.ts)
│   ├── firebase/              # Firebase client setup
│   ├── stores/                # Zustand stores
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Helper utilities
│
├── docs/                       # Documentation
│   ├── PHASE_1_SECURITY.md    # Security foundation details
│   ├── RECOVERY_STRATEGY.md   # Master password recovery strategy
│   └── README.md              # This file
│
├── public/                     # Static assets
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── next.config.js             # Next.js configuration
└── package.json               # Dependencies
```

### Key Directories

- **`lib/crypto/v2-encryption.ts`**: Core encryption (XChaCha20-Poly1305 + Argon2id)
- **`lib/api/v2-*.ts`**: Service layer (auth, vault, sync, search, generators)
- **`lib/stores/`**: Zustand state management stores
- **`app/api/v2/`**: Backend API endpoints
- **`components/vault/`**: Vault UI components

---

## License

This project is a personal project by [TaiyoYozakura](https://github.com/TaiyoYozakura).

Currently unlicensed. Commercial use is not permitted without explicit permission.

---

## Security Disclosure

Found a security vulnerability? Please email security@vaultly.app with details.

Do NOT post security vulnerabilities in issues or pull requests.

---

## Contributing

This is a personal project. Contributions are not currently accepted.

If you'd like to build on this, please fork and maintain your own version.

---

## Support

- 📖 [Documentation](docs/)
- 🐛 [GitHub Issues](https://github.com/TaiyoYozakura/v0-password-manager-app/issues)
- 📧 Email: support@vaultly.app

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend & auth
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TweetNaCl.js](https://tweetnacl.js.org/) - Encryption
- [Argon2](https://argon2.online/) - Key derivation

---

**Vaultly v2.0.0** - A password manager that respects your privacy.
