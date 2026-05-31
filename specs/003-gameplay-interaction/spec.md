# Feature Specification: Gameplay Interaction

**Feature Branch**: `003-gameplay-interaction`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "Feature: Gameplay Interaction — Drawer can draw on canvas, clear canvas; Guessers can submit guesses; empty guesses rejected, trimmed, case-insensitive matching; guess history via polling; correct guess = 100 pts, incorrect = 0 pts; all start at 0"

## Clarifications

### Session 2026-05-31

- Q: How are canvas strokes synchronised from drawer to server? → A: Auto-sync on stroke end — each stroke is sent to the server as soon as the drawer finishes drawing it (lifts pointer).

## User Scenarios & Testing

### User Story 1 — Drawer draws on canvas and clears it (Priority: P1)

The player assigned as drawer sees a drawing canvas. They can draw freeform strokes using their mouse/pointer and clear the canvas to start over.

**Why this priority**: Drawing is the core gameplay action. Without it, there is nothing to guess.

**Independent Test**: A drawer can open a game, see the canvas, draw a visible mark, and clear the canvas — all without any guessers present.

**Acceptance Scenarios**:

1. **Given** the drawer is on the game page, **When** they click and drag on the canvas, **Then** a visible stroke follows the pointer.
2. **Given** the drawer has drawn on the canvas, **When** they press the "Clear Canvas" button, **Then** all strokes are removed and the canvas returns to blank.
3. **Given** the canvas is blank, **When** the drawer presses "Clear Canvas", **Then** nothing changes (no error).

---

### User Story 2 — Guesser submits guesses and receives feedback (Priority: P1)

A guesser types a guess, submits it, and learns immediately whether it is correct or incorrect. Empty and whitespace-only guesses are rejected. Case differences are ignored during matching.

**Why this priority**: Guessing is the other core gameplay action. The game cannot function without it.

**Independent Test**: A guesser can submit a guess and see a correct/incorrect response without any drawing activity.

**Acceptance Scenarios**:

1. **Given** a guesser is on the game page, **When** they type a guess and submit it, **Then** they receive a correct or incorrect result.
2. **Given** a guesser submits a guess that matches the secret word (ignoring case), **When** the guess is evaluated, **Then** it is marked as correct.
3. **Given** a guesser submits a guess that does not match the secret word, **When** the guess is evaluated, **Then** it is marked as incorrect.
4. **Given** a guesser submits an empty or whitespace-only string, **When** the guess is processed, **Then** it is rejected with an error message.
5. **Given** a guesser submits a guess with leading/trailing whitespace, **When** the guess is processed, **Then** the whitespace is stripped before matching.

---

### User Story 3 — Guess history is visible to all players (Priority: P2)

All players (drawer and guessers) can see an ordered list of guesses submitted during the round. The list updates automatically via polling.

**Why this priority**: Provides essential game awareness and prevents duplicate guesses.

**Independent Test**: A guesser submits a guess; later, both the drawer and that guesser see it in the history.

**Acceptance Scenarios**:

1. **Given** a guesser submits a guess, **When** the next poll completes, **Then** the guess appears in the history for that guesser.
2. **Given** a guesser submits a guess, **When** the drawer polls, **Then** the guess appears in the drawer's history view.

---

### User Story 4 — Scoring (Priority: P2)

All players start with a score of 0. A correct guess awards 100 points. An incorrect guess awards 0 points. Scores persist for the duration of the round.

**Why this priority**: Scoring adds competitive incentive but the game is playable without it.

**Independent Test**: A guesser makes a correct guess and sees their score increase by 100; another guesser makes an incorrect guess and sees their score stay the same.

**Acceptance Scenarios**:

1. **Given** all players have a score of 0 at round start, **When** a guesser submits a correct guess, **Then** their score becomes 100.
2. **Given** a guesser with a score of 0, **When** they submit an incorrect guess, **Then** their score remains 0.
3. **Given** a guesser who has already scored 100 points, **When** they submit another correct guess, **Then** their score becomes 200.

---

### Edge Cases

- **Drawer submits a guess**: The system silently ignores or rejects guess submissions from the drawer's session.
- **Multiple correct guesses**: Multiple guessers can each score 100 points if they all guess the secret word correctly.
- **Canvas clear on blank canvas**: Clearing when no strokes exist is a silent no-op.
- **Extremely long guess text**: Guess text is reasonably truncated or rejected to prevent abuse.
- **Special characters and unicode**: Case-insensitive matching handles accented characters as the locale would expect.
- **Race condition on guess**: Two guessers submit the same correct guess nearly simultaneously — both are marked correct and both receive 100 points (no first-guesser exclusivity).
- **Guess history order**: Guesses appear in chronological order (submission time).

## Requirements

### Functional Requirements

- **FR-001**: The drawer MUST be able to draw freeform strokes on a canvas; each stroke is persisted server-side when the pointer is lifted.
- **FR-002**: The drawer MUST be able to clear all strokes from the canvas with a single action.
- **FR-003**: Clearing a blank canvas MUST NOT produce an error.
- **FR-004**: Guessers MUST be able to submit a text guess.
- **FR-005**: Empty and whitespace-only guesses MUST be rejected with an error message.
- **FR-006**: All guesses MUST be trimmed of leading/trailing whitespace before matching.
- **FR-007**: Guess matching MUST be case-insensitive (e.g., "ROCKET", "Rocket", "rocket" all match "rocket").
- **FR-008**: Guess results (correct/incorrect) MUST be returned immediately upon submission.
- **FR-009**: Guess history MUST be synchronised to all players through polling, including correct/incorrect status and submitter identity.
- **FR-010**: A correct guess MUST award exactly 100 points to the guessing player.
- **FR-011**: An incorrect guess MUST award 0 points.
- **FR-012**: All players MUST start the round with a score of 0.
- **FR-013**: Guess submissions from the drawer MUST be silently ignored or rejected.

### Key Entities

- **Canvas**: The drawing surface available only to the drawer; accumulates strokes.
- **Stroke**: A single continuous drawing action defined by a series of points/coordinates; sent to the server when the drawer lifts the pointer.
- **Guess**: A text submission from a guesser, with submitter ID, text, timestamp, and result (correct/incorrect).
- **Score**: A numeric value associated with each player, updated when a correct guess is submitted.
- **Guess History**: An ordered list of guesses for the current round, visible to all players.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A drawer can draw a recognizable shape on the canvas and clear it in under 30 seconds.
- **SC-002**: A guesser can submit a guess and see correct/incorrect feedback in under 2 seconds.
- **SC-003**: All players see new guesses appear in the guess history within 3 seconds of submission (polling-based).
- **SC-004**: Correct guess scoring (100 pts) is applied within 2 seconds of submission and visible to all on next poll.
- **SC-005**: Empty and whitespace-only guesses are rejected consistently with a clear error message.

## Assumptions

- Canvas strokes are stored server-side and polled by guessers (consistent with the established HTTP polling pattern — no WebSockets). Each stroke is synced to the server when the drawer lifts the pointer (auto-sync on stroke end).
- The canvas uses a simple freeform drawing mode (single brush, no color picker, no stroke width control) for the initial implementation.
- A correct guess does NOT end the round; multiple guessers can each guess correctly and receive 100 points.
- The drawer does not need to see the guess input form — their role is to draw and observe guesses.
- Guess history is visible to both drawer and guessers, allowing the drawer to see who is guessing what.
- The game page from 002-game-start-drawer-flow already provides the layout (canvas placeholder, guess form placeholder, player info, scoreboard placeholder).
