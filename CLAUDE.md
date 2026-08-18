# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## About

DinoPamper is a personal-use app for tracking baby data and trends. Security hardening is explicitly out of scope (see README.md) — do not add auth/security features unless asked.

## Commands

- `npm start` — start the Expo dev server (Metro), then choose a platform from the CLI/browser UI.
- `npm run ios` / `npm run android` / `npm run web` — start the dev server targeting a specific platform directly.

There is no lint, test, or typecheck script configured yet. Use `npx tsc --noEmit` for a manual type check if needed.

## Architecture

This is a bare Expo (SDK 53) + React Native + TypeScript scaffold, not yet built out:

- `index.ts` registers `App.tsx` as the root component via `registerRootComponent` (works in both Expo Go and native builds).
- `App.tsx` is currently the only screen — no navigation library, state management, or data layer has been added yet.
- `app.json` holds Expo config (name/slug, icons, platform-specific settings). Native `ios/` and `android/` directories are not checked in (generated on demand, e.g. via prebuild).
- `tsconfig.json` extends `expo/tsconfig.base` with `strict: true`.

Since the app has almost no code yet, prefer reading the actual files over relying on assumed structure, and check the versioned Expo docs (per AGENTS.md) before introducing new APIs.
