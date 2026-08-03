# Vaultly Mobile App - Regression Testing Checklist

## Test Date: __________
## Tester Name: __________
## Platform: [ ] Android [ ] iOS
## Device/Emulator: __________________

---

## 1. AUTHENTICATION FLOW

### 1.1 Google Sign-In
- [ ] App launches and displays login screen
- [ ] Tapping "Sign In with Google" opens Google auth flow
- [ ] Successfully signing in with Google account navigates to next screen
- [ ] Session token is stored correctly
- [ ] Back button behavior is correct

### 1.2 Sign Up Flow
- [ ] Sign Up screen displays all form fields
- [ ] Email validation works (accepts valid emails, rejects invalid)
- [ ] Password validation enforces minimum requirements
- [ ] Password confirmation matching is enforced
- [ ] Google Sign-Up option works
- [ ] Navigation back to login screen works
- [ ] Error messages appear for invalid inputs

### 1.3 Master PIN Setup
- [ ] PIN setup screen displays after first login
- [ ] Only numeric input is accepted
- [ ] PIN length validation (4-6 digits)
- [ ] PIN confirmation matching is enforced
- [ ] Show/hide password toggle works
- [ ] Tips display correctly
- [ ] PIN is saved to device storage
- [ ] User can proceed to vault after setup

### 1.4 Master PIN Unlock
- [ ] Unlock screen appears on app restart
- [ ] Numeric keypad displays all 0-9 digits
- [ ] Backspace correctly removes digits
- [ ] Correct PIN unlocks vault immediately
- [ ] Incorrect PIN shows error message
- [ ] Attempt counter decrements correctly
- [ ] Max attempts (3) locks app properly
- [ ] Biometric auth button is visible (even if not implemented)

---

## 2. VAULT OPERATIONS

### 2.1 View Passwords List
- [ ] Vault screen loads with list of passwords
- [ ] Search bar displays at top
- [ ] Pull-to-refresh works correctly
- [ ] Loading spinner appears during refresh
- [ ] Empty state displays when no passwords
- [ ] FAB (floating action button) is visible
- [ ] Password items show site name and username
- [ ] Tag badges display with correct icon

### 2.2 Add Password
- [ ] Tapping + button opens AddPassword screen
- [ ] Site Name field is required and validated
- [ ] Password field is required and validated
- [ ] Username field accepts input (optional)
- [ ] Email field validates email format
- [ ] Notes field accepts multi-line input
- [ ] Tag dropdown shows common tags
- [ ] Show/hide password toggle works
- [ ] Save button creates password in Firestore
- [ ] Navigation returns to vault after save
- [ ] New password appears in vault list

### 2.3 View Password Details
- [ ] Tapping password item opens details screen
- [ ] All password fields display correctly
- [ ] Site name and tag display prominently
- [ ] Copy-to-clipboard works for username
- [ ] Copy-to-clipboard works for email
- [ ] Copy-to-clipboard works for password
- [ ] Show/hide password toggle works
- [ ] Created/updated dates display correctly
- [ ] Delete button is visible
- [ ] Delete confirmation dialog works

### 2.4 Delete Password
- [ ] Delete dialog shows confirmation message
- [ ] Cancel button dismisses dialog
- [ ] Confirm button removes password from Firestore
- [ ] Password list updates after deletion
- [ ] Error message appears if deletion fails
- [ ] Navigation returns to vault after deletion

### 2.5 Search & Filter
- [ ] Typing in search bar filters results in real-time
- [ ] Search works across site name, username, email, notes
- [ ] Case-insensitive search works
- [ ] Clearing search shows all passwords again
- [ ] Tag filtering works (if implemented)
- [ ] Combined search + tag filter works
- [ ] Empty search results show "No results found"

---

## 3. PASSWORD GENERATOR

### 3.1 Generator UI
- [ ] Generator screen displays formatted password
- [ ] Copy button is visible and works
- [ ] Password copies to clipboard
- [ ] Generate button regenerates new password
- [ ] Options panel displays all settings

### 3.2 Generator Options
- [ ] Length slider/input works (4-32 characters)
- [ ] Uppercase toggle includes A-Z when enabled
- [ ] Lowercase toggle includes a-z when enabled
- [ ] Numbers toggle includes 0-9 when enabled
- [ ] Special characters toggle works
- [ ] Generated password matches selected options
- [ ] Toggling option regenerates new password

### 3.3 Generator Edge Cases
- [ ] Minimum length (4) generates valid password
- [ ] Maximum length (32) generates valid password
- [ ] Generating with no options enabled defaults to lowercase
- [ ] Uppercase letters are actually uppercase
- [ ] Special characters are valid

---

## 4. SETTINGS

### 4.1 Security Settings
- [ ] Auto-lock timeout selector works
- [ ] Default auto-lock is 5 minutes
- [ ] Biometric authentication toggle displays
- [ ] Master PIN is stored securely

### 4.2 Preferences
- [ ] Dark mode toggle works (UI ready)
- [ ] Notifications toggle works
- [ ] Settings persist across app restarts
- [ ] Changes apply immediately

### 4.3 Backup & Export
- [ ] Export button displays and is tappable
- [ ] Import button displays and is tappable
- [ ] About section shows version number
- [ ] Support links are displayed
- [ ] Website link displays

### 4.4 Sign Out
- [ ] Sign out button displays with red color
- [ ] Tapping shows confirmation dialog
- [ ] Canceling dialog dismisses without signing out
- [ ] Confirming signs out user
- [ ] App returns to login screen after sign out
- [ ] Session token is cleared

---

## 5. NAVIGATION & UI

### 5.1 Bottom Tab Navigation
- [ ] Vault tab is active by default
- [ ] Generator tab is accessible
- [ ] Settings tab is accessible
- [ ] Tab icons display correctly
- [ ] Tab labels display correctly
- [ ] Switching tabs preserves state
- [ ] Navigation doesn't reset when switching tabs

### 5.2 Header & Navigation
- [ ] Header displays screen title
- [ ] Back button works where appropriate
- [ ] Header styling is consistent
- [ ] Safe area is respected
- [ ] Status bar color matches theme

### 5.3 Responsiveness
- [ ] Layout works on small phones (5")
- [ ] Layout works on medium phones (6")
- [ ] Layout works on large phones (6.5"+)
- [ ] Landscape orientation works (if supported)
- [ ] Text is readable on all screen sizes
- [ ] Buttons are easily tappable (min 48x48 px)

---

## 6. ERROR HANDLING

### 6.1 Network Errors
- [ ] Firebase connection errors show alert
- [ ] Retry button appears after network error
- [ ] Offline mode gracefully handles (local data)
- [ ] Error messages are user-friendly

### 6.2 Input Validation
- [ ] Required field validation works
- [ ] Email validation rejects invalid emails
- [ ] Phone number validation works (if applicable)
- [ ] Password strength feedback displays

### 6.3 Session Management
- [ ] Session expires after auto-lock timeout
- [ ] Expired session requires re-unlock with PIN
- [ ] Session token refresh works
- [ ] Token expiration is handled gracefully

---

## 7. DATA & SECURITY

### 7.1 Data Persistence
- [ ] Passwords persist after app restart
- [ ] Settings persist after app restart
- [ ] Search history doesn't persist
- [ ] Session token persists (encrypted)

### 7.2 Encryption
- [ ] Passwords are encrypted before storage
- [ ] Encryption key is derived from master PIN
- [ ] Decryption works on vault view
- [ ] Plain text passwords don't appear in logs

### 7.3 Clipboard
- [ ] Copied passwords clear after 30 seconds (future)
- [ ] Copy confirmation message shows
- [ ] Multiple rapid copies don't break clipboard

---

## 8. PERFORMANCE

### 8.1 Load Times
- [ ] App launches in < 3 seconds
- [ ] Vault loads in < 2 seconds
- [ ] Password detail loads in < 1 second
- [ ] Search results update < 500ms

### 8.2 Memory & Resources
- [ ] App doesn't crash when loading 100+ passwords
- [ ] Search doesn't cause lag with large datasets
- [ ] App doesn't consume excessive battery
- [ ] App doesn't consume excessive RAM

### 8.3 Responsiveness
- [ ] Buttons respond immediately to tap
- [ ] Scrolling is smooth
- [ ] No dropped frames during animations
- [ ] No UI freezing during operations

---

## 9. EDGE CASES

### 9.1 Data Edge Cases
- [ ] Very long site names display correctly
- [ ] Very long passwords display correctly
- [ ] Empty optional fields don't cause issues
- [ ] Special characters in names work
- [ ] Unicode characters in notes work

### 9.2 User Behavior
- [ ] Rapid tapping multiple times doesn't break UI
- [ ] Switching screens rapidly works smoothly
- [ ] Backgrounding/foregrounding app works
- [ ] Device lock/unlock maintains app state

### 9.3 Unusual Conditions
- [ ] App works with poor network connection
- [ ] App works with no network connection
- [ ] App recovers from Firebase timeout
- [ ] App handles device low storage gracefully

---

## 10. FINAL VERIFICATION

### 10.1 Overall Quality
- [ ] No console errors in logs
- [ ] No red warning screens
- [ ] All buttons are functional
- [ ] No broken images or icons
- [ ] Text is properly visible (not cut off)

### 10.2 Feature Parity Checklist
- [ ] All web app features available on mobile
- [ ] Mobile-specific UX improvements implemented
- [ ] Touch interactions feel natural
- [ ] No features are missing vs web app

### 10.3 Production Readiness
- [ ] No debug flags left in code
- [ ] No test data in production
- [ ] API endpoints point to production
- [ ] No mock data is served
- [ ] Error reporting is enabled

---

## SUMMARY

**Total Tests Passed:** _______ / 150+

**Critical Issues Found:** _______

**Major Issues Found:** _______

**Minor Issues Found:** _______

**Recommendations:**

```
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
```

**Sign-off:**

Tester: _________________________ Date: _____________

Lead: _________________________ Date: _____________

---

## NOTES FOR DEVELOPERS

If any test fails:
1. Document the exact steps to reproduce
2. Note the expected vs actual behavior
3. Screenshot/video if possible
4. Create GitHub issue if critical
5. Re-test after fix is merged
