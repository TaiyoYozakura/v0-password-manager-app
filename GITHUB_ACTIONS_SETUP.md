# GitHub Actions Setup Guide

This document explains how to manually set up the release automation workflow for Vaultly Extension.

## Why Manual Setup?

The v0 GitHub App integration doesn't have `workflows` permission, which is required to create/update workflow files. You can manually add the workflow to your repository using one of these methods:

---

## Method 1: Manual File Creation (Recommended)

1. **Create the directory structure:**
   ```bash
   mkdir -p .github/workflows
   ```

2. **Create `.github/workflows/release.yml`:**
   ```yaml
   name: Release Extension

   on:
     push:
       tags:
         - 'v*'

   permissions:
     contents: write

   jobs:
     release:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout code
           uses: actions/checkout@v4

         - name: Setup pnpm
           uses: pnpm/action-setup@v2
           with:
             version: 10

         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'pnpm'

         - name: Install dependencies
           run: pnpm install

         - name: Build extension
           run: node scripts/build-extension.js

         - name: Package extension
           run: node scripts/package-extension.js

         - name: Create GitHub Release
           uses: softprops/action-gh-release@v1
           with:
             files: |
               release/Vaultly-Extension-*.zip
               release/Vaultly-Extension-*.tar.gz
             draft: false
             prerelease: false
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

3. **Commit and push:**
   ```bash
   git add .github/workflows/release.yml
   git commit -m "v2: ci(github): add release workflow for extension packaging"
   git push origin main
   ```

---

## Method 2: GitHub UI

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Click "New workflow"
4. Click "set up a workflow yourself"
5. Copy the content from the **Method 1** YAML above
6. Name it `release.yml`
7. Click "Commit changes"

---

## Method 3: GitHub CLI

```bash
# Create the file
cat > .github/workflows/release.yml << 'EOF'
[Copy YAML content from Method 1]
EOF

# Commit and push
git add .github/workflows/release.yml
git commit -m "v2: ci(github): add release workflow for extension packaging"
git push origin main
```

---

## How to Use the Workflow

Once the workflow is set up, creating a release is simple:

```bash
# Create a version tag
git tag v2.1.0

# Push the tag to GitHub
git push origin v2.1.0
```

The workflow will automatically:
1. Build the extension
2. Create ZIP and TAR.GZ packages
3. Create a GitHub Release
4. Upload the packages as release assets

You can view the workflow run in the "Actions" tab of your repository.

---

## Release Artifacts

After the workflow completes, you'll have:

- **GitHub Release** at: `https://github.com/YourOrg/v0-password-manager-app/releases/tag/v2.1.0`
- **Assets:**
  - `Vaultly-Extension-v2.1.0.zip`
  - `Vaultly-Extension-v2.1.0.tar.gz`

---

## Troubleshooting

**Q: Workflow doesn't trigger**
A: Make sure you pushed the tag correctly:
```bash
git push origin v2.1.0
```

**Q: Build fails in GitHub Actions**
A: Check the "Actions" tab for error details. Most common issues:
- Node version mismatch (workflow uses Node 20)
- Missing dependencies (run `pnpm install` locally first)
- Permission issues (check GITHUB_TOKEN permissions)

**Q: Can't find release files**
A: Check that `scripts/build-extension.js` and `scripts/package-extension.js` are working locally:
```bash
node scripts/build-extension.js
node scripts/package-extension.js
ls release/
```

---

## Local Release Testing

Before pushing to GitHub, test the release process locally:

```bash
# Build extension
node scripts/build-extension.js

# Package extension
node scripts/package-extension.js

# Verify artifacts
ls -lh release/
```

---

## Next Steps

1. Add `.github/workflows/release.yml` using one of the methods above
2. Create a test tag: `git tag v2.0.1 && git push origin v2.0.1`
3. Monitor the "Actions" tab
4. Download the release artifacts from GitHub Releases

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Creating Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- [GitHub CLI Documentation](https://cli.github.com/manual)

