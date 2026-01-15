# HIIT Timer – Store Listing Details

This document contains suggested copy and metadata for publishing the HIIT Timer app on Google Play. Adjust to match your brand voice and local regulations.


## App Identity
- App Name (≤30): HIIT Interval Timer
- Package (applicationId): co.za.designbycode.hiittimer
- Category: Health & Fitness
- Content Rating: Everyone
- Monetization: Free, no in‑app purchases


## Short Description (Google Play, ≤80)
Clean HIIT timer with voice, sound, and haptics for precise intervals.


## Full Description (≤4000)
Crush your workouts with a focused, customizable HIIT timer. Build interval workouts in seconds, get clear voice cues and haptic feedback, and stay locked in with a clean, dark interface built for training.

HIIT Timer helps you start fast and stay consistent:
- Create your own workouts: set warm‑up, work, rest, rounds, and cool‑down
- Quick Start: jump into a session without saving a plan
- Clear phase guidance: countdown, warm‑up, work, rest, cool‑down, complete
- Voice cues: hear phase changes and countdowns so you can keep your eyes on form
- Sound and haptics: audible ticks and vibration patterns reinforce timing (optional)
- Background persistence: resume progress even if you leave the app briefly
- Keep awake: screen stays on during active workouts (optional)
- Lightweight and fast: zero clutter, instant controls

Whether you’re sprinting, cycling, boxing, or doing bodyweight circuits, HIIT Timer gives you reliable pacing without breaking your flow.

Features at a glance:
- Custom workouts with precise interval control
- Phase‑based alerts (voice, sound, haptics)
- Global volume, per‑feature toggles
- Simple list of saved workouts
- Polished dark theme optimized for low‑light gyms
- Works offline

Train smarter. Stay in rhythm. Finish strong.


## Key Features (bullet points for highlights section)
- Create, edit, and save interval workouts
- Quick Start for instant sessions
- Voice announcements for phase changes and countdowns
- Optional ticking sound and vibration cues
- Background save and restore of active timer state
- Keep‑awake during active sessions
- Clean, distraction‑free dark UI


## What’s New (Release Notes Template)
- Performance improvements and minor UI polish
- Better audio/haptic timing during phase transitions
- Bug fixes and stability enhancements


## SEO / Keywords (Do not display publicly)
hiit, timer, interval timer, tabata, workout timer, fitness, training, run timer, boxing timer, circuit training, crossfit timer, countdown, stopwatch, gym, cardio


## Store Listing Assets Checklist
- App Icon: 512 × 512 PNG, 1024 KB max, background not transparent
- Feature Graphic: 1024 × 500 PNG/JPG (no transparency)
- Screenshots (suggested):
  - Phone: 1080 × 1920 or higher
  - Recommended 6–8 screenshots spanning:
    1) Home/Presets/Quick Start
    2) Create Workout form
    3) Active Workout (timer + phase label)
    4) Audio/Voice/Haptic settings
    5) Completion state
    6) Dark theme overview
- Optional Promo Video: YouTube URL (15–30s)


## Screenshot Copy Ideas (captions)
- "Build your perfect intervals"
- "Voice cues keep you focused"
- "Work. Rest. Repeat."
- "Quick start your session"
- "Haptics and sound for precision"
- "Dark, distraction‑free design"


## Privacy & Support
- Privacy Policy URL: https://yourdomain.example/hiittimer/privacy
- Support URL: https://yourdomain.example/hiittimer/support
- Support Email: support@yourdomain.example
- Data Safety (guidance):
  - No account required; no personal data collected
  - Local on‑device storage for settings and workout data (AsyncStorage)
  - No third‑party analytics by default (update if you add any)


## Technical Notes (not shown to users)
- Built with Expo (SDK 54), React Native, TypeScript
- Uses expo‑audio for sound, expo‑speech for voice cues, and AsyncStorage for persistence
- Android only listing for initial release (can expand later)


## Google Play Console Setup Hints
- App access: All content available without special access
- Ads: No
- In‑app purchases: No
- Target audience: 13+
- Content rating questionnaire: Health & Fitness, exercise guidance only; no medical claims
- Device families: Phones (tablets optional)
- Release channels:
  - Development/internal testing (APK): eas build -p android --profile preview
  - Production (AAB): eas build -p android --profile production
- Versioning: Update package.json version (single source of truth); app.config.js reads it automatically. Android versionCode auto-increments in production builds (see VERSION.md)


## Localization (Optional)
Prepare short description and feature bullet translations for your target locales (e.g., es, fr, de). Keep the short description under 80 characters for Play.


## Long‑form Description (Alternative copy)
HIIT Timer is a clean, reliable interval timer designed for high‑intensity training. Build custom workouts with work/rest cycles, hear clear voice prompts as you switch phases, and feel subtle haptic feedback to stay locked in. With background persistence and a stay‑awake option, your session stays on track—even if you quickly switch apps. Start instantly with Quick Start, or save your favorite routines for next time. HIIT Timer gives you timing precision without the clutter, so you can focus on moving.
