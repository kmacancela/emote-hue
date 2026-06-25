# Emote Hue

Emote Hue is a private emotional art journal for turning a short spoken or typed reflection into a living color portrait.

Tagline: **When words aren't enough, color speaks.**

## Current MVP

- Expo React Native app with TypeScript and Expo Router
- Onboarding flow with privacy-first guidance and personal color calibration
- Voice or text reflection entry
- Intensity selection before generating a portrait
- Local mock hue analysis that produces structured emotion, palette, and motion data
- Procedural color portrait rendering with React Native Skia
- Private local journal storage with saved hue entries
- Basic settings for privacy reminders and data clearing
- Tests for schemas, color utilities, and privacy-safe sharing payloads

This milestone does not call a production AI service. The analysis flow uses a local mock engine so the app can be designed and tested without exposing API keys or sending user reflections to a server.

## Privacy Notes

- Raw audio is not saved by default.
- Saved entries are local in this MVP.
- Share payloads exclude private notes and transcripts unless explicitly included by code.
- The app avoids diagnostic or clinical certainty language.
- Future AI and database calls should happen server-side only, with secrets stored outside the mobile app bundle.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the app:

```bash
pnpm start
```

Open the iOS simulator:

```bash
pnpm ios
```

Open the web build during development:

```bash
pnpm web
```

## Quality Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
```

## Project Structure

```text
app/              Expo Router screens and navigation
src/components/   Shared UI and visual components
src/hooks/        App state, recording, entries, onboarding, and calibration hooks
src/lib/          Storage, mock analysis, schemas, privacy helpers, and draft flow
src/theme/        Color, spacing, typography, radius, and motion tokens
src/types/        Shared TypeScript domain types
src/utils/        Color and date helpers
__tests__/        Unit tests
```

## Environment Variables

Copy `.env.example` if you need local environment values later. Keep real secrets in local-only env files such as `.env.local`, which are ignored by git.
