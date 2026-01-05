# HIIT Timer – Interval Workout App

A simple and effective HIIT (High-Intensity Interval Training) timer application built with React Native and Expo. This app allows you to create, manage, and run your own custom HIIT workouts.

## Features

- Create and save custom workouts (warm-up, work, rest, rounds, cool-down)
- Clean, dark, distraction-free UI
- Voice cues and sound/haptic alerts on phase changes
- Quick Start session without saving a workout
- Background persistence: resume an in-progress workout
- Keep-awake during active sessions (optional)
- Android-focused (EAS build profiles configured)

## Tech Stack

- React Native 0.81, React 19
- Expo SDK 54 (expo-router, expo-keep-awake, expo-splash-screen)
- TypeScript
- Zustand
- react-native-reanimated, react-native-gesture-handler
- expo-audio (preferred), expo-speech
- AsyncStorage persistence

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (LTS)
- bun
- Expo CLI and EAS CLI
- Android Studio (emulator) or Android device

### Installation

1. Clone the repo
   ```sh
   git clone <repository-url>
   ```
2. Install packages
   ```sh
   bun install
   ```

## Available Scripts

In the project directory, you can run:

- bun start — Start Expo dev server (Metro)
- bun run android — Run on Android emulator/device
- bun run web — Run in a web browser
- bun run lint — Lint with ESLint
- bun run eas:build:android:dev — EAS dev client build (APK)
- bun run eas:build:android:preview — EAS internal test build (APK)
- bun run eas:build:android:prod — EAS production build (AAB)
- bun run eas:submit:android:prod — Submit production build to Google Play
