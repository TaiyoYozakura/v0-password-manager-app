# Password Manager v2: Master Password Recovery Strategy

## Critical Security Principle: No Backdoor

This password manager implements **true end-to-end encryption**. The master password is the only key to decrypt the entire vault. There is **intentionally no recovery mechanism** for a forgotten master password.

### Why No Recovery?

1. **Security Foundation**: If we could recover a forgotten password, an attacker could also recover it
2. **Zero-Knowledge Architecture**: The backend never sees the master password or encryption key
3. **User Data Safety**: Users can't be "locked out by the server" - they only lose access if they lose their password

## Edge Cases & Solutions

### Case 1: User Forgets Master Password

**Current State**: ❌ Cannot recover vault data

**User Flow**:
1. User lands on login page and can't remember master password
2. "Sign in with Google" button is still available (if not MFA-locked)
3. User can still authenticate with Google
4. System detects no vault data (old encrypted blob)
5. User can optionally start fresh OR manually recover from encrypted backup export

**UI Messaging**:
```
"Master Password Lost"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  We cannot recover your master password.

If you have an encrypted backup export, you can restore it 
with your backup passphrase. Otherwise, your vault cannot be 
recovered with a lost master password.

Options:
□ Restore from encrypted backup
□ Start fresh with new vault
□ Contact support (they cannot help)
```

### Case 2: Google Account Access Lost (2FA Issues)

**Current State**: ✅ Covered - Master PIN login available

**Recovery Path**:
1. User signs in with Master PIN instead (set up during first login)
2. Master PIN is stored separately from master password
3. User can reset Google 2FA and re-enable Google Sign-In
4. User can export vault data as encrypted backup while logged in

**Recommendation**: Always have Master PIN as secondary auth method

### Case 3: User Wants Vault Recovery Before Password Loss

**Current State**: ✅ Covered - Encrypted Backup Export

**Recommended User Practice**:

1. **Export Strategy** (monthly):
   - Go to Settings → Backup & Restore → Download Backup
   - Choose a strong passphrase (different from master password)
   - Store encrypted export in secure cloud storage (Google Drive, Dropbox)
   - Also store as backup on USB drive (offline)

2. **Recovery Scenario**:
   - User authenticates with Google or Master PIN
   - User can always restore from encrypted backup
   - Passphrase protects the export, not tied to master password

3. **What's Protected in Export**:
   ```
   ✓ Passwords (all fields: siteName, email, username, password, notes, tags)
   ✓ PINs (all fields: label, category, pin, notes, tags)
   ✓ Notes (all fields: title, content, tags)
   ✗ Master password (never exported or recoverable)
   ```

### Case 4: Account Compromise / Data Breach

**If Backend is Breached**:
- Attacker sees: Encrypted vault blobs, user emails, session tokens
- Attacker cannot see: Decryption keys, master passwords, plaintext passwords
- Impact: Minimal - encrypted data remains secure

**If User's Device is Compromised**:
- Attacker may see: Session token in memory
- Attacker cannot see: Master password (only exists in user's mind)
- Impact: May need to change all passwords if recent sync occurred

**Mitigation**:
- Session tokens expire in 24 hours
- User can logout from all devices in Settings → Sessions
- Master password is never transmitted except during auth

## Implementation Checklist

### Phase 1: UI & Messaging ✅ REQUIRED

- [ ] Login page: Add clear messaging that master password cannot be recovered
- [ ] First-time setup: Educate user about password importance
- [ ] Settings: Add "Password Recovery" info section with best practices
- [ ] Export: Show warning about backing up encrypted exports
- [ ] Session management: Show logout-all-devices option

**File**: `app/login/page.tsx` - Add recovery warning banner
**File**: `app/(app)/settings/page.tsx` - Add recovery best practices card
**File**: `app/login/page.tsx` - Add "Forgot Password?" with recovery guide modal

### Phase 2: Help Documentation ✅ REQUIRED

- [ ] Create `/docs/RECOVERY_STRATEGY.md` (this file)
- [ ] Add in-app Help Center section on password recovery
- [ ] Create video: "I Forgot My Master Password - What Now?"
- [ ] Add FAQ entry for recovery scenarios

### Phase 3: Export Backup Reminders ✅ PARTIALLY DONE

- [x] 30-day backup reminders implemented
- [ ] Add "Backup your encrypted export" in onboarding
- [ ] Add yearly reminder to refresh backup export
- [ ] Add notification when device is compromised alert

### Phase 4: Account Recovery (Google 2FA Loss) ✅ DONE

- [x] Master PIN authentication implemented
- [x] Master PIN setup during first login
- [x] Master PIN available as fallback auth method

## User Education Strategy

### During Onboarding

```
Step 1: Master Password
"Your master password is the ONLY key to your vault.
We cannot reset it if you forget it.
Suggestions:
✓ Use a memorable passphrase (not simple words)
✓ Do NOT write it down anywhere digitally
✓ Consider a password manager for your master password itself"

Step 2: Backup
"Keep an encrypted backup of your vault.
Recommended: Monthly or after adding important passwords
This backup can be restored if you lose Google 2FA"

Step 3: Master PIN
"Set up a Master PIN as a backup authentication method.
You can use this if you lose access to your Google account."
```

### In Settings

```
Security Best Practices
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Master Password
┌─ Last changed: Never
│  Tip: Change it every 6 months
│  ⚠️  Cannot be recovered if lost
└─ It's the ONLY key to your vault

Backup & Restore
┌─ Last backup: 15 days ago
│  Tip: Export monthly as encrypted JSON
│  Action: [Download Backup Now]
└─ This can recover your vault if you lose Google 2FA

Master PIN
┌─ Status: Enabled ✓
│  Tip: Fallback authentication if Google fails
│  Action: [Change Master PIN]
└─ Also protected by encryption
```

## FAQ: Master Password Recovery

**Q: I forgot my master password, can you reset it?**  
A: No. Your master password is the encryption key to your vault. We don't store it. If you lose it, your vault is unrecoverable unless you have an encrypted backup export.

**Q: If I lose my master password, is my vault lost forever?**  
A: Yes, unless:
1. You have an encrypted backup export (with its passphrase)
2. You can access your Master PIN login and export from there
3. You have a browser extension cache with decrypted data (temporary)

**Q: What happens if I lose both my master password AND can't access Google 2FA?**  
A: Your vault becomes inaccessible. This is why we recommend:
- Monthly encrypted backups
- Setting up Master PIN as secondary auth
- Storing backup exports in secure cloud storage

**Q: Is there any way to recover my data?**  
A: Only if:
- You have the Master PIN (secondary login)
- You have an encrypted backup export + its passphrase
- You were using the browser extension and it cached decrypted data

**Q: Why don't you offer password recovery like other password managers?**  
A: Those managers have a backdoor in their encryption. We chose stronger security over convenience. Your vault is only accessible with your master password.

**Q: Can I request my encrypted vault data from you?**  
A: Yes, contact support@vaultly.app for a data export. This includes your encrypted vault blob, but we cannot decrypt it for you.

## Technical Architecture

### Master Password Flow

```
Master Password Input
        ↓
Argon2id(password, salt) → Encryption Key
        ↓
XChaCha20-Poly1305(vault, key) → Encrypted Vault
        ↓
Backend stores only: Encrypted Vault
Backend never stores: Master Password or Encryption Key
```

### Recovery Constraints

- ❌ No "forgot password" email link
- ❌ No phone number recovery
- ❌ No security questions
- ❌ No backup codes (unrelated to master password)
- ❌ No admin override
- ✅ Encrypted backup export (with separate passphrase)
- ✅ Master PIN secondary authentication
- ✅ Google Sign-In fallback (if not MFA-locked)

## Security Trade-offs

| Approach | Security | Convenience | Notes |
|----------|----------|-------------|-------|
| No Recovery | ⭐⭐⭐⭐⭐ | ⭐ | This approach |
| Email Reset Link | ⭐⭐ | ⭐⭐⭐⭐ | Creates backdoor |
| Security Questions | ⭐⭐ | ⭐⭐⭐ | Answers may be public |
| Backup Codes | ⭐⭐⭐ | ⭐⭐⭐ | Requires pre-setup |
| Encrypted Export | ⭐⭐⭐⭐ | ⭐⭐⭐ | Our hybrid approach |

We chose maximum security. Users can export encrypted backups for peace of mind.

## Implementation Timeline

### MVP (v2.0)
- [x] Master password stored as Argon2id hash only
- [x] No recovery mechanisms in backend
- [x] Encrypted backup export available
- [ ] Clear UI messaging about no recovery

### v2.1
- [ ] Add recovery strategy documentation in Help Center
- [ ] Add onboarding education about password importance
- [ ] Add yearly backup reminders
- [ ] Add "Master PIN" as fallback auth

### v2.2+
- [ ] Browser extension cache for emergency access
- [ ] Recovery codes (user-generated, stored offline)
- [ ] Trusted device recovery (experimental)

## Conclusion

**This is not a bug—it's a feature.** True end-to-end encryption means there's no backdoor, no recovery for us OR attackers. Users must take responsibility for their master password. We provide:

1. ✅ Clear warnings about password importance
2. ✅ Encrypted backup exports for data recovery
3. ✅ Multiple authentication methods (Google + Master PIN)
4. ✅ Explicit UI messaging about no recovery option

This approach prioritizes **user security over convenience**.
