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

## Current Milestone (MVP)

Building the core logging loop only. In scope:
- Two screens: Timeline (chronological list of today's events) and QuickLog 
  (three buttons: Feed, Sleep, Diaper — tap creates a timestamped entry, 
  editable after creation)
- Local persistence only (no backend, no sync)
- Single user, no auth

Explicitly OUT of scope until the MVP is working end-to-end:
- Photo/video attachments — do not add camera or media-picker code yet, 
  even if it seems like a natural fit. This is deferred on purpose until 
  the timeline UI exists and we can see where it belongs.
- Multi-day views, charts, push notifications, multi-caregiver sync
- Milestone tracking, growth charts, export features

## Data Layer

Using SQLite via `expo-sqlite` for local persistence. Chosen over 
AsyncStorage because the app needs date-range queries (today's events, 
eventually multi-day views), and a relational schema now makes it 
straightforward to swap in Postgres (e.g. Supabase) later if/when 
multi-caregiver sync is added — same schema shape, different driver.

## Navigation

Using `@react-navigation/native` (stack or bottom-tab navigator — 
Claude Code's choice, pick whichever fits two screens best) for 
Timeline ↔ QuickLog navigation.