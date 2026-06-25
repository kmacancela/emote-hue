# Emote Hue

**When words aren't enough, color speaks.**

Emote Hue is an emotional art journal that turns spoken or typed reflections into living color portraits. It gives you a softer way to notice what you feel, adjust the color until it feels right, and keep a visual record over time.

## What It Does

- Offers a calm first-run experience
- Learns your color associations through lightweight calibration
- Captures a reflection by voice or text
- Lets you choose intensity before generating a portrait
- Renders living color portraits procedurally with React Native Skia
- Saves hue entries into a visual journal
- Includes settings for privacy reminders and local data clearing

## Personal by Design

Emote Hue is designed to feel welcoming as an app and personal as a journal.

- Saved entries are local in this MVP.
- Raw audio is not saved by default.
- Share payloads exclude private notes and transcripts unless explicitly included by code.
- The app avoids diagnostic or clinical certainty language.
- Future AI and database calls should happen server-side only, with credentials kept outside the mobile app bundle.

## Development Status

This MVP uses a local mock analysis engine. That keeps the interface, color portrait flow, and journal experience testable without sending reflections to a production service.

The project also includes TypeScript checks, linting, formatting, and Jest tests for schemas, color utilities, and privacy-safe sharing helpers.

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
