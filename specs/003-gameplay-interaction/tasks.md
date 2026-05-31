---

description: "Implementation tasks for Gameplay Interaction"

---

# Tasks: Gameplay Interaction

**Branch**: `003-gameplay-interaction` | **Date**: 2026-05-31

**Input**: Design documents from `specs/003-gameplay-interaction/`

**Prerequisites**: plan.md, spec.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`

---

## Phase 1: Setup (Codebase Analysis)

**Purpose**: Read existing code to understand current state before making changes

- [ ] T001 [P] Read `backend/src/models/game.ts` — identify current Room/RoomSnapshot fields
- [ ] T002 [P] Read `backend/src/services/roomStore.ts` — identify existing service functions
- [ ] T003 [P] Read `backend/src/api/schemas.ts` — identify existing Zod schemas
- [ ] T004 [P] Read `backend/src/api/rooms.ts` — identify existing route handlers
- [ ] T005 [P] Read `frontend/src/services/api.ts` — identify existing API methods
- [ ] T006 [P] Read `frontend/src/state/roomStore.ts` — identify existing store actions
- [ ] T007 [P] Read `frontend/src/pages/GamePage.tsx` — identify current game page layout
- [ ] T008 [P] Read `frontend/src/styles/app.css` — identify existing CSS classes

---

## Phase 2: Foundational (Model Changes)

**Purpose**: Core type/model changes that US1, US2, US3, and US4 all depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T009 [P] Add `strokes: Stroke[]`, `guesses: GuessEntry[]`, `scores: Record<string, number>` to Room interface in `backend/src/models/game.ts`
- [ ] T010 [P] Add `Stroke` and `GuessEntry` type definitions, and `strokes`, `guesses`, `scores` to RoomSnapshot interface in `backend/src/models/game.ts`
- [ ] T011 [P] Update frontend RoomSnapshot type — add `strokes`, `guesses`, `scores` fields in `frontend/src/services/api.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Drawer draws on canvas and clears it (Priority: P1) 🎯 MVP

**Goal**: The drawer can draw freeform strokes on a canvas (auto-synced on pointer lift) and clear all strokes with one action.

**Independent Test**: A drawer can open a game, draw a visible mark on the canvas, see it persist on poll, and clear the canvas — all without any guessers present.

### Implementation for User Story 1

#### Backend — Service Layer

- [ ] T012 [P] [US1] Implement `addStroke(code, participantId, stroke)` — appends stroke to room, validates drawer only, returns updated room in `backend/src/services/roomStore.ts`
- [ ] T013 [P] [US1] Implement `clearStrokes(code, participantId)` — clears all strokes from room, validates drawer only, returns updated room in `backend/src/services/roomStore.ts`

#### Backend — API Layer

- [ ] T014 [US1] Add `POST /:code/strokes` route — accepts `{ participantId, stroke: { points } }`, validates drawer, calls `addStroke`, returns 403 if not drawer in `backend/src/api/rooms.ts`
- [ ] T015 [US1] Add `DELETE /:code/strokes` route — accepts `{ participantId }`, validates drawer, calls `clearStrokes`, returns 403 if not drawer in `backend/src/api/rooms.ts`
- [ ] T016 [P] [US1] Add Zod schemas for stroke submission and clear requests in `backend/src/api/schemas.ts`

#### Frontend — Drawing Canvas Component

- [ ] T017 [P] [US1] Create `frontend/src/components/DrawingCanvas.tsx` — HTML5 canvas with mouse/touch event handlers that capture strokes as arrays of `{x, y}` points; expose `strokes` and `onStrokeComplete` props
- [ ] T018 [US1] Integrate DrawingCanvas into GamePage — replace canvas placeholder with DrawingCanvas for drawer, show polled strokes (read-only) for guessers in `frontend/src/pages/GamePage.tsx`
- [ ] T019 [P] [US1] Add `submitStroke(code, participantId, stroke)` and `clearStrokes(code, participantId)` API methods in `frontend/src/services/api.ts`
- [ ] T020 [US1] Add `submitStroke` and `clearStrokes` store actions to `frontend/src/state/roomStore.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 — Guesser submits guesses and receives feedback (Priority: P1)

**Goal**: A guesser can submit a text guess; empty/whitespace-only guesses are rejected; guesses are trimmed before case-insensitive matching; correct/incorrect feedback is returned immediately.

**Independent Test**: A guesser can submit a correct guess and see "correct" feedback, submit an incorrect guess and see "incorrect" feedback, and submit an empty guess and see an error — all without drawing activity.

### Implementation for User Story 2

#### Backend — Service Layer

- [ ] T021 [US2] Implement `submitGuess(code, participantId, text)` — trims text, rejects empty, rejects drawer submissions, case-insensitive match against secretWord, creates GuessEntry, updates scores, returns updated room in `backend/src/services/roomStore.ts`

#### Backend — API Layer

- [ ] T022 [US2] Add `POST /:code/guess` route — accepts `{ participantId, text }`, validates, calls `submitGuess`, returns 400 for empty, 403 for drawer in `backend/src/api/rooms.ts`
- [ ] T023 [P] [US2] Add Zod schema for guess submission in `backend/src/api/schemas.ts`

#### Frontend — Guess Form

- [ ] T024 [US2] Wire GuessForm to submit guesses via API — receive correct/incorrect result immediately, handle empty guess error in `frontend/src/components/GuessForm.tsx`
- [ ] T025 [P] [US2] Add `submitGuess(code, participantId, text)` API method in `frontend/src/services/api.ts`
- [ ] T026 [US2] Add `submitGuess` store action — submits guess, updates room snapshot from response in `frontend/src/state/roomStore.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 — Guess history is visible to all players (Priority: P2)

**Goal**: All players (drawer and guessers) see an ordered list of guesses that updates automatically via polling.

**Independent Test**: A guesser submits a guess; after the next poll, both the drawer and that guesser see the guess in the history with its correct/incorrect status.

### Implementation for User Story 3

- [ ] T027 [US3] Display guess history panel — read `room.guesses` from polled snapshot, show ordered list with submitter name, guess text, and correct/incorrect badge in `frontend/src/pages/GamePage.tsx`
- [ ] T028 [US3] Add CSS styles for guess history list — `.guess-list`, `.guess-item`, `.guess-item--correct`, `.guess-item--incorrect` in `frontend/src/styles/app.css`
- [ ] T029 [US3] Ensure `GET /:code` returns `guesses` array in RoomSnapshot (already flows through via toRoomSnapshot, verify) — `backend/src/services/roomStore.ts`

**Checkpoint**: User Stories 1, 2, AND 3 should all work.

---

## Phase 6: User Story 4 — Scoring (Priority: P2)

**Goal**: All players start at score 0. Correct guess = +100 points. Incorrect guess = +0 points. Scores persist for the round and are visible to all.

**Independent Test**: A guesser makes a correct guess and sees their score increase by 100; another guesser makes an incorrect guess and sees no change.

### Implementation for User Story 4

- [ ] T030 [US4] Display scoreboard — read `room.scores` from polled snapshot, show each player's score in `frontend/src/pages/GamePage.tsx` (update Scoreboard component)
- [ ] T031 [US4] Add CSS styles for score display — `.scoreboard`, `.score-entry` in `frontend/src/styles/app.css`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Tests, type safety verification, and manual validation.

- [ ] T032 Write backend tests: `addStroke` rejects non-drawer, `clearStrokes` works, `submitGuess` validates empty/text/drawer in `backend/src/services/roomStore.test.ts`
- [ ] T033 Write backend tests: `submitGuess` case-insensitive matching, correct awards 100, incorrect awards 0 in `backend/src/services/roomStore.test.ts`
- [ ] T034 [P] Update frontend test mock in `frontend/src/services/api.test.ts` — add `strokes`, `guesses`, `scores` to mock RoomSnapshot
- [ ] T035 Run full test suite (`vitest run` in both `backend/` and `frontend/`) and fix any failures
- [ ] T036 Run `tsc --noEmit` in both `backend/` and `frontend/` — verify zero TypeScript errors
- [ ] T037 Run manual two-browser-tab verification (drawing + guessing + history + scoring)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately. All tasks [P] parallel.
- **Phase 2 (Foundational)**: Depends on Phase 1. BLOCKS all user stories.
- **Phase 3 (US1 — P1 MVP)**: Depends on Phase 2. Drawing canvas and stroke sync — core feature.
- **Phase 4 (US2 — P1)**: Depends on Phase 2. Independent of US1 (guessers don't need drawing to guess).
- **Phase 5 (US3 — P2)**: Depends on Phase 4 (guess data must exist). UI-only on top of Phase 4.
- **Phase 6 (US4 — P2)**: Depends on Phase 4 (scoring data from guesses). UI-only on top of Phase 4.
- **Phase 7 (Polish)**: Depends on all desired user stories being complete.

### User Story Dependencies

| Story | Depends On | Independent Test |
|-------|-----------|------------------|
| **US1 (P1)** | Phase 2 | Drawer draws + clears, guessers see strokes via poll |
| **US2 (P1)** | Phase 2 | Guesser submits correct/incorrect/empty → feedback |
| **US3 (P2)** | Phase 4 | Guess appears in history for all players on poll |
| **US4 (P2)** | Phase 4 | Score updates on correct guess, visible on poll |

### Within Each User Story

- Models before services
- Services before API endpoints
- API endpoints before frontend methods
- Core implementation before UI/presentation
- Story complete before moving to next priority

### Parallel Opportunities

- All Phase 1 tasks (T001–T008) can run in parallel (read-only)
- All Phase 2 tasks (T009–T011) can run in parallel (different interfaces)
- Phase 3 (US1) and Phase 4 (US2) can run in parallel after Phase 2 (different endpoints)
- Within Phase 3: T012/T016 (service) vs T017 (component) vs T019 (API method) can run in parallel
- Within Phase 4: T021/T023 (service) vs T025 (API method) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all Phase 2 model changes together:
Task: "T009 — Add strokes/guesses/scores to Room in game.ts"
Task: "T010 — Add to RoomSnapshot in game.ts"
Task: "T011 — Update RoomSnapshot in frontend api.ts"

# Launch all US1 backend tasks together:
Task: "T012 — Implement addStroke in roomStore.ts"
Task: "T013 — Implement clearStrokes in roomStore.ts"
Task: "T016 — Zod schemas for stroke/clear endpoints"

# Sequential must-run:
Task: "T014 — POST /:code/strokes route (depends on T012, T016)"
Task: "T015 — DELETE /:code/strokes route (depends on T013, T016)"
Task: "T018 — Integrate DrawingCanvas into GamePage (depends on T017, T019, T020)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (read existing code)
2. Complete Phase 2: Foundational (model changes)
3. Complete Phase 3: User Story 1 (drawing + clearing)
4. **STOP and VALIDATE**: Drawer draws and clears; guessers see strokes on poll
5. Continue to Phase 4 (guessing) for full gameplay

### Incremental Delivery

1. Setup + Foundational → Models updated with strokes, guesses, scores
2. Add US1 → MVP: Drawer can draw and clear, guessers see drawing
3. Add US2 → Guesses work with validation and matching
4. Add US3 → Guess history visible to all
5. Add US4 → Scoring with points
6. Polish → Tests and verification

### Implementation Order Per Story

- Backend models → services → API routes → frontend methods → frontend UI
- Within a layer: parallel tasks first, then sequential dependent tasks
