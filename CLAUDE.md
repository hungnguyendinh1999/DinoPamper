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

Expo (SDK 53) + React Native + TypeScript. The core logging loop is built and working end-to-end:

- `index.ts` registers `App.tsx` as the root component via `registerRootComponent` (works in both Expo Go and native builds).
- `App.tsx` wraps the tree in `SQLiteProvider` (running `db/schema.ts`'s migration on init) and `RootNavigator`.
- `navigation/RootNavigator.tsx` — a `@react-navigation/native-stack` navigator with three screens: Timeline (initial route), QuickLog, Settings.
- `screens/` — `TimelineScreen` (today's events, tap-to-edit modal, next-feed/milk-expiry banners), `QuickLogScreen` (three tap-to-log buttons), `SettingsScreen` (configurable night-feeding window).
- `db/` — `schema.ts` (SQLite migration) and `entries.ts` (queries against the `entries` table).
- `storage/nightWindow.ts` — the night-window setting, in AsyncStorage (see Data Layer below for why it's separate from SQLite).
- `lib/feedingEstimates.ts` + `config/feeding.ts` — pure logic and tunable constants for next-feed time / milk expiry, kept independent of any screen.
- `theme/theme.ts` — shared colors, spacing, radius, shadow, and per-entry-type styling used by all three screens.
- `app.json` holds Expo config (name/slug, icons, platform-specific settings). Native `ios/` and `android/` directories are not checked in (generated on demand, e.g. via prebuild).
- `tsconfig.json` extends `expo/tsconfig.base` with `strict: true`.

Prefer reading the actual files over relying on assumed structure, and check the versioned Expo docs (per AGENTS.md) before introducing new APIs.

## Current Milestone (MVP)

The core logging loop is done and shipped: Timeline + QuickLog + Settings screens, SQLite persistence, next-feed/milk-expiry estimates, configurable night window, and a shared theme. Local persistence only (no backend, no sync), single user, no auth.

Explicitly OUT of scope for now:
- Photo/video attachments — do not add camera or media-picker code yet, 
  even if it seems like a natural fit. This is deferred on purpose until 
  we can see where it belongs in the existing timeline UI.
- Multi-day views, charts, push notifications, multi-caregiver sync
- Milestone tracking, growth charts, export features

## Data Layer

SQLite (`expo-sqlite`) holds the `entries` table (feed/sleep/diaper events) — 
chosen over AsyncStorage because the app needs date-range queries (today's 
events, eventually multi-day views), and a relational schema now makes it 
straightforward to swap in Postgres (e.g. Supabase) later if/when 
multi-caregiver sync is added — same schema shape, different driver.

Simple key-value settings (currently just the night-feeding window) use 
`@react-native-async-storage/async-storage` instead — no query needs, so 
SQLite would be overkill. New settings-like values should follow the same 
pattern; new event-like/time-series data belongs in SQLite.

## Navigation

`@react-navigation/native-stack` with three screens: Timeline (initial 
route) ↔ QuickLog, and Timeline → Settings (gear icon in the header).