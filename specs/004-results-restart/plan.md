# Implementation Plan: Results and Restart

**Branch**: `004-results-restart` | **Date**: 2026-05-31 | **Spec**: [specs/004-results-restart/spec.md](../spec.md)

**Input**: Feature specification from `/specs/004-results-restart/spec.md`

## Summary

After a round ends (host clicks "End Round"), the room transitions to "results" status. All players see the correct word, final scores, and complete guess history via existing HTTP polling. The host can click "Restart" to clear round state (scores, guesses, strokes) and return all players to the lobby with their names preserved. No new data fields or entities are needed — results are a presentation of existing data under a new room status.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 18+/Express 4.x backend, React 18/Vite frontend)

**Primary Dependencies**: Zod (validation), tsx (execution), vitest (testing)

**Storage**: N/A — in-memory only (Constitution III)

**Testing**: Vitest (`vitest run` in backend/ and frontend/)

**Target Platform**: Modern web browsers + Node.js server

**Project Type**: Web application (Express backend + React frontend)

**Performance Goals**: Restart completes within 500ms server-side; results/lobby state visible within one poll cycle (~2s)

**Constraints**: In-memory state, no WebSockets/databases/auth (Constitution II, III); host-only actions enforced server-side (Constitution V)

**Scale/Scope**: Small game rooms (2–8 players), single-round-per-restart

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Justification |
|-----------|--------|---------------|
| I. TypeScript-First & Type Safety | ✅ PASS | New endpoints typed with Zod; existing types reused |
| II. HTTP Polling, No Real-Time Sync | ✅ PASS | Results/lobby fetched via existing 2s polling pattern; no WebSockets added |
| III. In-Memory State, No Persistence | ✅ PASS | Restart clears in-memory fields; no database added |
| IV. Specification-First Development | ✅ PASS | Following spec → clarify → plan → tasks → implement |
| V. Critical Self-Review & Deterministic Game Logic | ✅ PASS | Host-only actions (End Round, Restart) enforced server-side; no new scoring/matching logic |
| No auth | ✅ PASS | No authentication added |
| No new state-management/routing libs | ✅ PASS | Uses existing roomStore; reuses LobbyPage |
| No multiple rounds/timers | ✅ PASS | Explicitly excluded in Non-Goals |

**Result**: GATE PASSED — all constitutional principles satisfied without violations.

## Project Structure

### Documentation (this feature)

```text
specs/004-results-restart/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── game.ts              # Add "results" to RoomStatus
│   ├── services/
│   │   └── roomStore.ts         # endRound(), restartGame() service functions
│   ├── api/
│   │   ├── schemas.ts           # endRoundSchema, restartSchema
│   │   └── rooms.ts             # POST /:code/end-round, POST /:code/restart
│   └── services/
│       └── roomStore.test.ts    # Tests for endRound, restartGame

frontend/
├── src/
│   ├── components/
│   │   ├── ResultsPanel.tsx     # NEW — displays correct word, scores, guesses
│   │   └── ...                  # Existing components reused
│   ├── pages/
│   │   ├── GamePage.tsx         # Add "results" status rendering (show ResultsPanel)
│   │   └── LobbyPage.tsx        # Already handles lobby state (reused after restart)
│   ├── state/
│   │   └── roomStore.ts         # endRound(), restartGame() store actions
│   └── services/
│       └── api.ts               # endRound(), restartGame() API methods
└── src/styles/
    └── app.css                  # CSS for results panel
```

**Structure Decision**: Standard backend/frontend monorepo layout. No new directories or restructuring needed.
