# Reflection Report — Scribble

## What the starter app already had

The initial scaffold (`4568311`) provided a minimal full-stack skeleton:

**Backend (Express + TypeScript)**
- Express server with a router, basic room CRUD routes (create, join, start game, get room).
- Zod validation schemas for requests.
- In-memory room store (`Map`) with simple `createRoom`, `joinRoom`, `getRoom`, `startGame` functions.
- Game model types (`Room`, `Participant`, `RoomStatus`).
- Static starter word list.
- No tests.

**Frontend (React + Vite + TypeScript)**
- Page shell (`AppShell`) with React Router v6 routes for Start, CreateRoom, JoinRoom, Lobby, Game.
- `CreateRoomPage`, `JoinRoomPage`, `LobbyPage`, `GamePage` with basic placeholder UIs.
- `GuessForm` component (text input + submit).
- `ResultPanel` placeholder ("Game activity will appear here.").
- `Scoreboard` placeholder (hardcoded scores).
- `api.ts` service with `request()` helper and methods for createRoom, joinRoom, fetchRoom, startGame.
- `roomStore.ts` state store (Zustand-like pattern) with basic actions.
- CSS with ~270 lines of styling (layout, forms, buttons, cards).
- No tests.

Key gaps in the scaffold: no drawing canvas, no score tracking, no guess submission or history, no results display, no restart flow, no polling in GamePage, no word selection logic, no host gating for start/end-round/restart.

---

## What we added

### Feature 1 — Room Setup & Lobby (`specs/001`)
- Host reclamation on rejoin (same display name).
- Room code collision retry on creation.
- Unique display names within a room.
- 2-second fixed-interval polling in LobbyPage.
- Host-only start-game button, disabled until ≥2 players.
- Backend host gating and validation.
- Test suite for room creation, join validation, polling.

### Feature 2 — Game Start & Drawer Flow (`specs/002`)
- Player name trimming and empty/whitespace rejection.
- Deterministic word selection (DJB2 hash of `room.code-roundNumber`).
- `secretWord` field gated in API response (only drawer sees it).
- `startGame` returns 409 if game already active.
- Round 1 setup only (no drawer rotation — deferred).
- Test coverage for word selection, drawer assignment, visibility gating.

### Feature 3 — Gameplay Interaction (`specs/003`)
- Drawing canvas component — stroke drawing, server sync on stroke end.
- Clear canvas button (drawer-only).
- Guess submission — trimmed, case-insensitive matching, drawer cannot guess.
- Guess history displayed in sidebar (chronological, correct/incorrect styling).
- Score tracking — 100 pts for correct guess, 0 otherwise, all start at 0.
- `ResultPanel` replaced placeholder with real component (shows correct word, scores, guess history).
- Polling loop in GamePage (2s) to sync strokes and guesses.
- Comprehensive backend + frontend tests.

### Feature 4 — Results & Restart (`specs/004`)
- `RoomStatus` extended with `"results"`.
- Host-only "End Round" button — immediate, no confirmation, cuts off drawing/guessing.
- Results display: correct word (visible to all), scores table by descending order, chronological guess history.
- Host-only "Restart Game" button on results screen.
- Restart preserves `orderedWords` and `participants`, resets everything else (`drawerId`, `secretWord`, `roundNumber`, `strokes`, `guesses`, `scores`, → `"lobby"`).
- `joinRoom` rejects during results.
- No new room code on restart — players stay in same room.
- All 33 tasks implemented, all tests passing.

### Cross-cutting improvements
- Robust typed error responses with HTTP status codes (400, 403, 404, 409, 500).
- Consistent `{ ok, error }` / `{ ok, room }` return pattern from services.
- `toRoomSnapshot` — consistent projection layer for API responses.
- Front-end fallback for disconnected/error states (navigate to start, silent polling failures).
- TypeScript strictness — no `any`, all unions explicit.
