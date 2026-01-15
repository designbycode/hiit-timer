# ⚠️ CRITICAL RULES - READ FIRST

## 🚫 DO NOT RUN DEV SERVER COMMANDS

**NEVER run these commands:**
- `bun start`
- `bun start -c`
- `npx expo start`
- Any Metro bundler / dev server commands

**Reason:** User runs dev server manually in a separate tab.

**What to do instead:**
- Make code changes only
- Tell user to reload the app (press 'r' in their Metro terminal)
- Let user manage their own dev server




## Before Making ANY Changes:

1. **NEVER use deprecated packages** - If you see a deprecation warning, STOP and migrate immediately
2. **ALWAYS use path aliases** - Use `@/` for all internal imports (libs/, app/, assets/) - NO relative paths like `../`
3. **Research before implementing** - Read actual documentation, don't guess APIs
4. **Check AGENTS.md** - Re-read relevant sections before architectural decisions
5. **Verify imports** - All imports must use aliases, no exceptions

## Current Package Rules:

- ✅ USE: `expo-audio` (SDK 54+)
- ❌ NEVER: `expo-av` (deprecated)
- ✅ Import pattern: `import { X } from '@/path/to/X'`
- ❌ NEVER: `import { X } from '../../../path/to/X'`

---

## Path Aliases (do not modify config)

- Configured in tsconfig.json and babel.config.js:
  - `@/*` -> project root (so `@/libs/...`, `@/app/...`, `@/assets/...` are valid)
- Use these forms everywhere:
  - Libraries: `import { Button } from '@/components/Button'`
  - Stores/Services: `import { useSettingsStore } from '@/store/settingsStore'`
  - Assets: `require('@/assets/images/icon.png')`
- Never use relative deep paths like `../../libs/...` or `./assets/...`.
- If Metro cache gets confused after moving files, run `bun start -c`.

---

# Project Overview

- Purpose: HIIT Timer mobile app to create, manage, and run interval workouts with audio/haptics/voice cues.
- Platforms: iOS, Android, Web (Expo)
- Language: TypeScript (React Native)
- Frameworks & Libraries:
  - Expo SDK 54 (expo-router, expo-splash-screen, expo-keep-awake, etc.)
  - React Native 0.81, React 19
  - Expo Router for file-based navigation (app/ directory)
  - Zustand for state management (libs/store)
  - react-native-reanimated, react-native-gesture-handler for animations/gestures
  - react-native-svg for circular progress
  - AsyncStorage for persistence
  - Audio/alerts via a compatibility wrapper (expo-audio preferred, expo-av fallback)

# Repository Structure

- app/
  - _layout.tsx: App shell, loads settings and controls the custom splash overlay
  - index.tsx: Home screen (list/presets/quick start)
  - create-workout.tsx: Workout creation form
  - settings.tsx: App settings (sound/vibration/voice/volume)
  - workout/[id].tsx: Workout run screen
- assets/
  - images/: Icons and splash images
  - sounds/: Audio cues (ticking-timer.wav, plus add phase-change.wav, countdown.wav, complete.wav)
- libs/ (formerly `src/`)
  - components/: Reusable UI components (TimerDisplay, CircularProgress, etc.)
  - constants/: App constants (animations, presets, theme, timings)
  - hooks/: Reusable hooks (useTimer, useAppState, useKeepAwake, useBackgroundPersistence)
  - services/
    - alerts/: AlertService (sound/haptics/voice), AudioManager (volume, preload), SpeechManager, HapticManager
    - storage/: StorageService (AsyncStorage + debounced writes), StatePersistence (background saving)
    - timer/: TimerEngine (phase logic and ticking), TimerState manager
  - store/: Zustand stores (settingsStore, workoutStore)
  - types/: Shared types (workout, timer)
  - utils/: Helpers (time formatting, performance)
- Configuration
  - app.config.js: Expo config (dynamically reads version from package.json)
  - package.json: Scripts, dependencies, and **version (single source of truth)**
  - tsconfig.json: TypeScript config with path aliases
  - babel.config.js: Module resolver aliases and reanimated plugin
  - eslint.config.js: Linting via expo config
  - eas.json: Build configuration with auto-increment for production
  - VERSION.md: Version management guide



# Audio System

- Uses `expo-audio` (SDK 54+ recommended, no deprecation warnings)
- Implemented using React Context + hooks (`AudioProvider` and `useAudio`)
- Audio players managed via `useAudioPlayer` hook from expo-audio
- Features:
  - Button click sound on all interactive elements
  - Ticking sound during work/rest phases
  - Global volume control synced with settings
  - Automatic cleanup and loop management
- Sound files in assets/sounds:
  - ticking.wav (timer ticking during active phases)
  - button_click.wav (UI button feedback)
  - beep.wav (available for use)
  - buzz.wav (available for use)
- Phase announcements use expo-speech (voice) for all phase changes

# Timer Engine and State

- `TimerEngine`: Central timing loop, manages phases (COUNTDOWN, WARM_UP, WORK, REST, COOL_DOWN, COMPLETE)
  - Emits callbacks: onUpdate, onPhaseChange, onComplete
  - Uses `TimerStateManager` to compute elapsed and remaining time; handles pause/resume drift
- `useTimer` hook orchestrates engine lifecycle and routes events to Zustand store
  - Triggers alerts on phase changes and completion
  - Preloads audio; cleans up on unmount
  - Handles foreground/background transitions (see useAppState)
- Constants
  - `timings.ts`: COUNTDOWN_DURATION, bounds, intervals, update throttling
  - `animations.ts`: Shared animation configs

# Persistence and Background Behavior

- `StorageService`: Debounced writes to AsyncStorage for workouts, settings, last workout, timer state
- `StatePersistence`: Periodically saves timer progress in background; restores remaining time after resume
- `useBackgroundPersistence`: Hook to manage save/restore while active

# UI/UX Components

- TimerDisplay: Circular progress + animated time label
- PhaseLabel: Animated phase text using themed colors
- QuickStartCard, WorkoutCard: Cards for recent/preset workouts
- Button: Reanimated touch feedback + haptics
- CustomModal: Styled modal with onRequestClose (Android back)
- Theme: `libs/constants/theme.ts` exports `colors`, `fontSizes`, `spacing` (lowercase)

# Navigation and Splash

- Expo Router (app/)
  - `_layout.tsx`: Prevents native splash auto-hide; shows custom animated splash overlay until app init completes
  - Workout header includes a settings button -> `/settings`
- CustomSplashScreen: Animated overlay; native splash hidden by layout once loading completes

# State Management

- Zustand stores
  - `settingsStore`: soundEnabled, vibrationEnabled, voiceEnabled, soundVolume, toggles + persistence
  - `workoutStore`: currentWorkout, timerState, lifecycle actions (start, pause, resume, stop, skip, restart)

# Best Practices & Conventions

- **DO NOT use deprecated packages or APIs** - Always use the current recommended packages for the SDK version
- If a package shows deprecation warnings, migrate to the recommended replacement immediately
- Keep theme tokens lowercase: `colors`, `fontSizes`, `spacing`
- Debounce storage writes to reduce I/O (see StorageService)
- Centralize timings and animations (timings.ts, animations.ts)
- Clean up side effects (audio/speech/timers) on unmount or stop
- Prefer `formatTime`/`formatTimeShort` from utils/time for consistency
- Avoid hard-coded durations in UI; compute from workout and phase

# Version Management

- **Single source of truth**: `package.json` version field
- `app.config.js` dynamically reads version from package.json
- All UI components use `Constants.expoConfig?.version` to display version
- **To update version**: Only edit `package.json` - changes propagate automatically
- Android `versionCode` auto-increments in production builds (configured in eas.json)
- See `VERSION.md` for detailed version management guide

# Development

- Scripts
  - bun start / bun run android / bun run ios / bun run web
  - bun start -c - Clear cache and start dev server
  - bun run lint
- Recommended workflow
  - After dependency changes or alias updates: Run `bun start -c`
  - After moving/renaming directories: Clear cache to avoid stale import resolution
  - Ensure assets/sounds contain expected files for audio cues
- Linting: `eslint-config-expo`

# Troubleshooting


## Cache Issues
Metro bundler caches module resolution aggressively. Always clear cache after:
- Renaming/moving directories (like src -> libs)
- Installing/removing dependencies
- Switching branches with structural changes

**Clear cache command:** `bun start -c`

# Notes / Migration History
