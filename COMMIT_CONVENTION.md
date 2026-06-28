# v2 Commit Convention

All commits during v2 development must follow this format:

## Format

```
v2: <type>(<scope>): <subject>

<body>

<footer>
```

## Examples

```
v2: feat(vault): add duplicate cleanup feature

Implement detection and removal of exact duplicate passwords and PINs.
Users can now bulk-delete duplicates from Settings.

Closes #123
```

```
v2: fix(auth): resolve Firebase domain authorization issue

Add v0 preview domain to authorized domains list in Firebase console.
This resolves popup blocking errors during Google Sign-In.
```

```
v2: docs(readme): update setup instructions for v2
```

## Type

Must be one of:
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, semicolons, etc)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding or updating tests
- **chore**: Changes to build process, dependencies, tools, or configuration

## Scope

Optional but recommended. Examples:
- vault
- auth
- sync
- encryption
- ui
- api
- extension
- settings

## Subject

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period (.) at the end
- Limit to 50 characters

## Body

Optional. Explain what and why, not how:
- Wrap at 72 characters
- Separate from subject with blank line
- Use imperative mood

## Footer

Optional. Reference issues:
- `Closes #123`
- `Fixes #456`
- `Refs #789`

## v2 Development Phases

All commits during v2 should reference the current phase:

1. **Phase 1**: Project cleanup, architecture, security foundation
2. **Phase 2**: Authentication & sessions (website + extension)
3. **Phase 3**: Encrypted vault CRUD
4. **Phase 4**: Real-time sync
5. **Phase 5**: Global search
6. **Phase 6**: Password generator
7. **Phase 7**: PIN manager
8. **Phase 8**: Quick actions
9. **Phase 9**: Browser form detection
10. **Phase 10**: Floating autofill popup
11. **Phase 11**: Autofill engine
12. **Phase 12**: Floating "Save Password?" prompt
13. **Phase 13**: Security dashboard
14. **Phase 14**: Import/export
15. **Phase 15**: Themes, accessibility, keyboard navigation
16. **Phase 16**: Performance optimization
17. **Phase 17**: Testing (unit, integration, E2E, browser)
