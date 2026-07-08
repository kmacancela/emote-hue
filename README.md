# Emote Hue

**When words aren't enough, color speaks.**

Emote Hue is an emotional art journal that turns spoken or typed reflections into living color portraits. It gives you a softer way to notice what you feel, adjust the color until it feels right, and keep a visual record over time.

## What It Does

- Offers a calm first-run experience
- Learns your color associations through lightweight calibration
- Captures a reflection by voice (with on-device transcription) or text
- Renders living color portraits procedurally with React Native Skia — every portrait is seeded and one of a kind
- Shapes the portrait live: intensity morphing, adjustment chips, tilt control, and a curated Hue Library of palettes
- Saves entries into a virtualized visual journal with a woven 30-day Sky strip
- Shares square or story art cards that never include notes or transcripts
- Includes settings for text size, read-back voice, transcript privacy, and local data clearing

## Personal by Design

Emote Hue is designed to feel welcoming as an app and personal as a journal.

- Saved entries are local in this MVP.
- Raw audio is not saved; recording files are deleted when drafts are cleared or replaced.
- Voice transcription happens on-device (expo-speech-recognition); nothing is uploaded.
- Share payloads exclude private notes and transcripts unless explicitly included by code.
- The app avoids diagnostic or clinical certainty language.
- Future AI and database calls should happen server-side only, with credentials kept outside the mobile app bundle.

## Development Status

This MVP uses a local mock analysis engine. That keeps the interface, color portrait flow, and journal experience testable without sending reflections to a production service. Voice input is transcribed on-device where the platform supports it; some features (transcription, tilt, sharing) need a development build rather than Expo Go.

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
