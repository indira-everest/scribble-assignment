# Implementation Plan: Gameplay Interaction

**Branch**: `003-gameplay-interaction` | **Date**: 2026-05-31 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-gameplay-interaction/spec.md`

## Summary

Implement core gameplay: drawer draws on a canvas (strokes auto-synced on pointer lift) and can clear it; guessers submit guesses (trimmed, case-insensitive matching, empty rejection); guess history synced via polling; scoring (correct = 100 pts, incorrect = 0 pts). All built on the existing HTTP polling infrastructure from 001/002.

## Technical Context

**Language/Version**: TypeScript 5.6+ (backend + frontend)

**Primary Dependencies**: Express 4 + Zod 3 (backend), React 18 + React Router 6 (frontend)

**Storage**: In-memory only (Constitution Principle III) — all state in `Map<string, Room>`

**Testing**: Vitest (both `backend/` and `frontend/` — `vitest run`)

**Target Platform**: Node.js 22+ (backend), modern browsers via Vite (frontend)

**Project Type**: Monorepo web application — Express API backend + React SPA frontend

**Performance Goals**: Guess feedback <2s; guess history visible within 3s (2s polling interval); stroke visible to guessers within 3s (2s polling)

**Constraints**: No WebSockets, no database, no auth, no new state-management libraries, no round transitions, in-memory state cleared on restart, no color picker or brush width controls (single brush)

## Constitution Check

*GATE: Must pass before implementation.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. TypeScript-First & Type Safety | ✅ Pass | All code TS; Zod validation for all new request bodies |
| II. HTTP Polling, No Real-Time | ✅ Pass | New endpoints use request-response; guess/stroke data returned via existing `GET /:code` polling |
| III. In-Memory State, No Persistence | ✅ Pass | Strokes, guesses, scores stored in Room Map; no database |
| IV. Specification-First | ✅ Pass | Spec complete with 13 FRs, 5 SCs, 7 edge cases, 1 clarification resolved |
| V. Deterministic & Self-Review | ✅ Pass | Gameplay logic is deterministic; all validation server-side; drawer/guesser roles enforced at API level |
| Additional Constraints | ✅ Pass | No auth, no new libs, no WebSockets, single brush mode |

**No violations. No complexity justification needed.**

## Project Structure

### Documentation (this feature)

```text
specs/003-gameplay-interaction/
├── plan.md              # This file
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # (/speckit.tasks output)
```

### Source Code (repository root)

```text
backend/src/
├── models/
│   └── game.ts          # Add Stroke, GuessEntry, scores to Room/RoomSnapshot
├── services/
│   └── roomStore.ts     # addStroke, clearStrokes, submitGuess logic
└── api/
    ├── schemas.ts       # Schemas for stroke, guess, clear endpoints
    └── rooms.ts         # POST /:code/strokes, DELETE /:code/strokes, POST /:code/guess

frontend/src/
├── services/
│   └── api.ts           # Add submitStroke, clearStrokes, submitGuess methods
├── state/
│   └── roomStore.ts     # Add stroke/guess/score state actions
├── components/
│   └── DrawingCanvas.tsx # NEW — canvas with mouse drawing + stroke serialization
└── pages/
    └── GamePage.tsx      # Replace canvas placeholder with DrawingCanvas; add guess history, score display
```

## Data Model Changes

### Room (additions)

```typescript
interface Stroke {
  points: Array<{ x: number; y: number }>;
}

interface GuessEntry {
  participantId: string;
  text: string;
  isCorrect: boolean;
  timestamp: string;
}

// On Room:
strokes: Stroke[];
guesses: GuessEntry[];
scores: Record<string, number>;  // participantId → accumulated score
```

### RoomSnapshot (additions)

```typescript
strokes: Stroke[];        // always visible to all (no gating — whole drawing is visible)
guesses: GuessEntry[];    // always visible to all
scores: Record<string, number>;  // always visible to all
```

## API Contract

### `POST /:code/strokes` — Save a stroke

**Request body**: `{ participantId: string, stroke: { points: Array<{x: number, y: number}> } }`
- Validates: participantId required, stroke has ≥2 points
- Authorisation: Only the current drawer may submit strokes
- Response `200`: `{ room: RoomSnapshot }`
- Error `403`: "Only the drawer can draw."
- Error `404`: "Room not found."

### `DELETE /:code/strokes` — Clear canvas

**Request body**: `{ participantId: string }`
- Authorisation: Only the current drawer may clear
- Response `200`: `{ room: RoomSnapshot }`
- Error `403`: "Only the drawer can clear the canvas."

### `POST /:code/guess` — Submit a guess

**Request body**: `{ participantId: string, text: string }`
- Validates: participantId required; text trimmed, min length 1
- Authorisation: The drawer may not submit guesses
- Matching: case-insensitive (`guess.toLowerCase() === secretWord.toLowerCase()`)
- Scoring: correct → +100; incorrect → +0
- Response `200`: `{ room: RoomSnapshot }`
- Error `400`: "Guess cannot be empty."
- Error `403`: "The drawer cannot submit guesses."

### `GET /:code` — Poll room state (existing, enhanced)

Returns `RoomSnapshot` now including `strokes`, `guesses`, `scores`.

## Complexity Tracking

*No Constitution violations. Section omitted.*
