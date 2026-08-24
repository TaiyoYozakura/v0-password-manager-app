# Master PIN Authentication & Export Feature Implementation

## Overview

Implemented end-to-end Master PIN authentication and password export functionality for Vaultly. Users can now set up a Master PIN during first login and use it to export their passwords securely.

## Features Implemented

### 1. Master PIN Dialog Component
**File:** `components/vault/master-pin-dialog.tsx`

A reusable dialog component for Master PIN entry with:
- 4-digit OTP input using InputOTP component
- Setup mode for initial PIN creation with confirmation
- Error message display
- Eye toggle for PIN visibility
- Loading states and disabled inputs during submission
- Support for custom titles and descriptions

**Props:**
```typescript
interface MasterPinDialogProps {
  open: boolean
  title: string
  description: string
  onSubmit: (pin: string) => Promise<void>
  onOpenChange: (open: boolean) => void
  isSetup?: boolean
  errorMessage?: string
}
```

### 2. Export Dialog Component
**File:** `components/vault/export-dialog.tsx`

Complete export flow with Master PIN verification:
- Checks if Master PIN is set up before allowing export
- Shows security warnings about plaintext export
- Two-step flow: confirmation → Master PIN verification
- Integrates with `/api/export/json` endpoint
- Handles rate limiting errors (15 min lockout)
- Downloads exported data as JSON file

**Features:**
- Automatic role-up to Master PIN dialog when Master PIN is missing
- Firebase ID token generation and passing
- Error handling with user-friendly messages
- Toast notifications for success/failure

### 3. Settings Page Integration

**File:** `app/(app)/settings/page.tsx` (updated)

Updated the Backup & Restore section to:
- Replace old passphrase-based export with Master PIN flow
- Import and use the new `ExportDialog` component
- Removed 75 lines of legacy export logic
- Simplified state management

## Backend Infrastructure (Already Implemented)

### Existing Components Used

1. **Master PIN Hashing** (`lib/crypto/bcrypt.ts`)
   - PBKDF2 + SHA256 with 100k iterations
   - Secure salt generation
   - Verification function

2. **Profile Management** (`lib/firebase/profile.ts`)
   - `setMasterPin()` - Save hashed PIN and salt
   - `recordFailedPinAttempt()` - Track failed attempts
   - `resetPinAttempts()` - Reset after successful auth
   - Automatic lockout after 3 failed attempts (15 minutes)

3. **Export API** (`app/api/export/json/route.ts`)
   - Requires Firebase ID token
   - Verifies Master PIN
   - Returns encrypted passwords and PINs
   - Handles rate limiting
   - Records failed attempts

4. **User Profile Type** (`lib/types.ts`)
   - Already includes Master PIN fields:
     - `masterPinHash` - Hashed PIN
     - `masterPinSalt` - Salt for hashing
     - `requiresMasterPin` - Boolean flag
     - `failedPinAttempts` - Failed attempt counter
     - `pinLockedUntil` - Lockout timestamp

## Flow Diagrams

### Master PIN Setup Flow (First Login)
```
1. User signs in with Google
2. AuthProvider checks if masterPinHash exists
3. If not, show Master PIN setup dialog
4. User enters 4-digit PIN and confirms
5. PIN hashed and saved to profile
6. Flag set: requiresMasterPin: true
```

### Export Passwords Flow
```
1. User clicks "Download backup" in Settings
2. ExportDialog checks if Master PIN is set
3. If not, shows warning and closes
4. If yes, shows confirmation dialog
5. User confirms → MasterPinDialog appears
6. User enters Master PIN
7. Dialog calls /api/export/json with idToken + masterPin
8. API verifies PIN against hash
9. API returns encrypted passwords/PINs
10. Browser downloads JSON file
```

### Rate Limiting
```
- Maximum 3 failed PIN attempts
- Automatic 15-minute lockout after failures
- Error message: "Too many failed attempts. Try again later."
- Lockout timestamp stored in profile.pinLockedUntil
```

## Security Considerations

1. **PIN Hashing**: Uses PBKDF2 with 100k iterations + SHA256
2. **Salt**: Random 16-byte salt per user
3. **Rate Limiting**: 3 attempts, 15-minute lockout
4. **API Verification**: Server-side verification required
5. **Token Validation**: Firebase ID token verified before export
6. **No Client-Side Storage**: PIN never stored in localStorage
7. **Plaintext Export Warning**: User explicitly warned about plaintext in export file

## Testing Checklist

- [ ] First login: Master PIN setup dialog appears
- [ ] Master PIN: Can't proceed if PIN doesn't match
- [ ] Rate limiting: Locked after 3 failed attempts
- [ ] Export: Shows warning dialog first
- [ ] Export: Requires Master PIN verification
- [ ] Export: Downloads JSON file with passwords
- [ ] Export: Error handling for rate limits
- [ ] Export: Error handling for invalid PIN
- [ ] Export: Toast notifications on success/failure
- [ ] Settings: Old export code removed
- [ ] Settings: New export dialog integrates cleanly

## Files Modified

### New Files Created
- `components/vault/master-pin-dialog.tsx` (179 lines)
- `components/vault/export-dialog.tsx` (165 lines)

### Updated Files
- `app/(app)/settings/page.tsx`
  - Added ExportDialog import
  - Replaced old export state with exportOpen
  - Removed onExport function (75 lines)
  - Replaced Dialog with ExportDialog component

- `lib/api/v2-sync.ts`
  - Fixed syntax error: `void>` → `void`

- `shared/api/v2-sync.ts`
  - Fixed syntax error: `void>` → `void`

## Integration Points

### Existing Components Used
- `InputOTP`, `InputOTPSlot` - PIN input
- `Dialog`, `DialogContent`, etc. - Modal containers
- `Button` - Actions
- `Alert`, `AlertDescription` - Error/info messages
- `Spinner` - Loading state

### Environment Variables (Already Set)
- `NEXT_PUBLIC_FIREBASE_*` - Firebase config
- `FIREBASE_PRIVATE_KEY` - Admin SDK
- `FIREBASE_PROJECT_ID` - Admin SDK

## Next Steps for Completion

1. Test Master PIN setup during first login
2. Test password export with Master PIN
3. Test rate limiting behavior
4. Verify encrypted export data format
5. Add Master PIN to login page if needed
6. Document Master PIN recovery process
7. Add Master PIN change feature to settings (if not present)

## Deployment Notes

- No database schema changes needed (fields already in UserProfile)
- No new environment variables required
- All Firebase rules already support Master PIN flow
- Export API route already handles the flow

## References

- Master PIN hashing: `lib/crypto/bcrypt.ts`
- Profile functions: `lib/firebase/profile.ts`
- Export API: `app/api/export/json/route.ts`
- User types: `lib/types.ts`
