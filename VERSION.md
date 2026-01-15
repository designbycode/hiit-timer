# Version Management Guide

## Overview

This app uses **single-source-of-truth** version management. The version is defined once in `package.json` and automatically propagates everywhere.

## How It Works

### 1. Single Source of Truth
- **`package.json`** - The ONLY place where you manually update the version
- **`app.config.js`** - Dynamically reads version from package.json
- **UI Components** - Use `Constants.expoConfig?.version` to display version

### 2. Where Version Appears
The version automatically appears in:
- Navigation Drawer footer: `HIIT Timer v{version}`
- Settings > About Section: Version display
- Developer Info screen: Version and build number

### 3. How to Update Version

#### For a new release:

1. **Update package.json version**
   ```json
   {
     "version": "1.4.2"  // Change this
   }
   ```

2. **That's it!** The version will automatically update:
   - In `app.config.js` (via dynamic read)
   - In all UI components (via `Constants.expoConfig?.version`)
   - In EAS builds and app stores

#### For Android builds:
- The `versionCode` in `app.config.js` can be manually incremented OR
- Use EAS auto-increment by setting `"autoIncrement": true` in `eas.json` production profile (already configured)

### 4. Build Configuration

**EAS builds automatically handle versioning:**
- `eas.json` has `"appVersionSource": "remote"` - EAS manages version
- Production builds have `"autoIncrement": true` - Auto-increments versionCode
- Version is read from package.json through app.config.js

### 5. Verification

To verify version is correctly configured:

```bash
# Start the app
bun start

# Check version in:
# - Navigation drawer (swipe from right or tap menu icon)
# - Settings > About Section
# - Settings > Developer Info
```

## Important Files

- **`package.json`** - Single source of truth for version
- **`app.config.js`** - Reads version dynamically from package.json
- **`eas.json`** - Build configuration with auto-increment
- **`libs/components/NavigationDrawer.tsx`** - Shows version in drawer
- **`libs/components/settings/AboutSection.tsx`** - Shows version in settings
- **`app/developer.tsx`** - Shows version and build info

## Version Format

Follow semantic versioning: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

Example: `1.4.1` → `1.5.0` (new feature) or `1.4.2` (bug fix)
