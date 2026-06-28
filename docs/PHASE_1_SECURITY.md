# Phase 1: Project Cleanup & Security Foundation

## Status: In Progress

### Completed Tasks

1. **Dependencies Installed**
   - `tweetnacl` (1.0.3) - XChaCha20-Poly1305 encryption
   - `argon2-browser` (1.18.0) - Argon2id key derivation
   - `zod` - Type-safe schema validation

2. **Security Module Created** (`lib/crypto/v2-encryption.ts`)
   - ✅ `deriveKeyV2()` - Argon2id key derivation (256-bit)
     - Memory: 64 MB
     - Time: 3 iterations
     - Parallelism: 4
   - ✅ `encryptVault()` - XChaCha20-Poly1305 encryption
   - ✅ `decryptVault()` - XChaCha20-Poly1305 decryption
   - ✅ `generatePassword()` - Cryptographically secure password generation
   - ✅ `hashForVerification()` - Integrity verification hashing

3. **Type Schemas Created** (`lib/types/v2-vault.ts`)
   - ✅ PasswordItem, PINItem, NoteItem schemas
   - ✅ VaultData structure with versioning
   - ✅ Session management types
   - ✅ SyncEvent schema
   - ✅ ActivityLog schema

### Architecture Decisions

- **Master Password Flow**: User enters master password once per session
  - Argon2id derives 256-bit encryption key
  - Backend never sees master password or derived key
  - Key verification uses hash-based matching

- **Quick Unlock** (future): Optional per-device PIN after initial auth
  - Unlocks locally-stored encryption key
  - Never replaces master password authentication

- **Vault Structure**: JSON structure with versioning for future migrations

### Next Steps (Phase 2)

1. Create authentication endpoints
2. Implement session management
3. Set up WebSocket for real-time sync
4. Create browser extension manifest and basic structure
5. Wire up master password flow

### Security Notes

- No plaintext data ever stored on backend
- All encryption/decryption happens client-side
- Argon2id prevents brute force attacks on master password
- XChaCha20-Poly1305 provides authenticated encryption
- Each vault is independently encrypted with unique nonce

### Testing Required

- [ ] Encryption/decryption round-trip
- [ ] Key derivation consistency
- [ ] Password generation entropy
- [ ] Type validation with Zod schemas
