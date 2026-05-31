# Implementation Plan: Game Start & Drawer Flow

**Branch**: `002-game-start-drawer-flow` | **Date**: 2026-05-31 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-game-start-drawer-flow/spec.md`

## Summary

Add game-start logic: host starts game → host becomes drawer for round 1 → secret word selected deterministically → word conditionally visible only to drawer via API response gating. Includes name trimming/validation (FR-001/FR-002) and drawer identification (FR-007).

## Technical Context

**Language/Version**: TypeScript 5.6+ (backend + frontend)

**Primary Dependencies**: Express 4 + Zod 3 (backend), React 18 + React Router 6 (frontend)

**Storage**: In-memory only (Constitution Principle III) — all state in `Map<string, Room>`

**Testing**: Vitest (both `backend/` and `frontend/` — `vitest run`)

**Target Platform**: Node.js 22+ (backend), modern browsers via Vite (frontend)

**Project Type**: Monorepo web application — Express API backend + React SPA frontend

**Performance Goals**: Lobby-to-game transition <1s (network excluded); 2s polling interval (Constitution Principle II)

**Constraints**: No WebSockets, no database, no auth, no new state-management libraries, no multiple rounds, no drawer rotation (deferred), in-memory state cleared on restart

**Scale/Scope**: Educational game — low concurrency (single-room focus), no production scaling requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. TypeScript-First & Type Safety | ✅ Pass | All code already TS; Zod validation for request/response |
| II. HTTP Polling, No Real-Time | ✅ Pass | Uses existing 2s GET polling; no WebSockets |
| III. In-Memory State, No Persistence | ✅ Pass | No database; state in Room Map; inactive room cleanup (existing) |
| IV. Specification-First | ✅ Pass | Spec complete with 12 FRs, 4 SCs, 7 edge cases |
| V. Deterministic & Self-Review | ✅ Pass | Word selection uses deterministic hash; host-only start enforced server-side |
| Additional Constraints | ✅ Pass | No auth, no new libs, no rounds >1, no custom words, no rewrite |

**No violations. No complexity justification needed.**

## Project Structure

### Documentation (this feature)

```text
specs/002-game-start-drawer-flow/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
backend/src/
├── models/
│   └── game.ts          # Add roundNumber, drawerId, secretWord to Room
├── services/
│   └── roomStore.ts     # startGame logic, deterministic word selection
└── api/
    ├── schemas.ts       # Updated schemas for name trimming
    └── rooms.ts         # Enhanced GET /:code with drawerId/secretWord gating

frontend/src/
├── services/
│   └── api.ts           # RoomSnapshot type update (drawerId, secretWord)
├── state/
│   └── roomStore.ts     # Game state detection (role-aware)
└── pages/
    ├── LobbyPage.tsx    # Existing — redirects to GamePage on status=active
    └── GamePage.tsx     # NEW — role-based drawer/guesser view with word display
```

## Complexity Tracking

*No Constitution violations. Section omitted.*
