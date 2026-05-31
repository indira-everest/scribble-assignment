# Feature Specification: Results and Restart

**Feature Branch**: `004-results-restart`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "Round results visible to all players, Display correct word, Display final scores, Display complete guess history, Host can restart game, Restart returns all players to lobby, Players are preserved, Round state is cleared, Scores and guesses are reset"

## Clarifications

### Session 2026-05-31

- Q: When the host clicks "End Round", does it end immediately? → A: Yes — immediate, no confirmation dialog or grace period.

## User Scenarios & Testing

### User Story 1 — Round Results Display (Priority: P1)

As a player in an active game round, when the round ends I want to see a results screen showing the correct word, final scores for all players, and the complete guess history, so I can see how everyone performed.

**Why this priority**: Results visibility is the core value of this feature — without it, players have no closure after a round ends.

**Independent Test**: Can be verified by having two players start a game, play a round, trigger round end, and observe that both players see the correct word, all scores, and the full guess history on the results screen.

**Acceptance Scenarios**:

1. **Given** an active game round with one drawer and one or more guessers, **When** the round ends, **Then** all players see a results screen displaying:
   - The correct secret word
   - Each player's name and their final score
   - The complete list of guesses in submission order, showing who guessed, their guess text, and whether it was correct
2. **Given** a guesser who submitted multiple guesses (some correct, some incorrect), **When** the results screen appears, **Then** all guesses appear in chronological order with their correct/incorrect status.
3. **Given** a player who did not submit any guesses, **When** the results screen appears, **Then** they see a score of 0 and an empty guess history.
4. **Given** the round ends while a player is disconnected, **When** they poll the room again, **Then** they receive the results screen with all final data.

---

### User Story 2 — Host Restart (Priority: P1)

As the host, when viewing the results screen I want to restart the game so all players return to the lobby with their names preserved and round state cleared, ready for a new game.

**Why this priority**: Restart is essential for repeat play — without it, each game session is one-and-done.

**Independent Test**: Can be verified by the host clicking "Restart" on the results screen and observing all players appear in the lobby with their same names, zero scores, and cleared round state.

**Acceptance Scenarios**:

1. **Given** the host is viewing the results screen, **When** they click the "Restart" button, **Then** the room transitions to "lobby" status, all participants remain, round number resets to 0, and scores/guesses/strokes are cleared.
2. **Given** a non-host player is viewing the results screen, **When** they look for a restart option, **Then** they do not see a restart button or any way to trigger a restart.
3. **Given** the host restarts the game, **When** the game returns to the lobby, **Then** the host can start a new game using the existing start flow with the same player roster.
4. **Given** the host restarts, **When** a player who was in the game polls the room, **Then** they receive the lobby state with their name still in the participant list.

---

### Edge Cases

- **Host disconnects during results**: If the host disconnects before clicking "Restart", the game remains in "results" state indefinitely. The host must rejoin the room (same name) to regain host control and trigger restart.
- **End Round cuts off in-progress activity**: If the host clicks "End Round" while a guesser is typing or the drawer is drawing, the round ends immediately. Any unsaved guesses or strokes in the current interaction are lost.
- **Player joins during results**: A new player attempting to join while the room is in "results" state cannot participate (the game has ended) — they should see a message indicating the game is over.
- **Only one player remains**: If all other players leave before restart, the host can still restart to the lobby with just themselves.
- **Multiple restarts**: The host can restart repeatedly, each time returning to a clean lobby state with all players preserved.
- **Rapid restart**: If the host restarts and immediately starts a new game, the entire flow (lobby → game → results → restart) can repeat without issues.
- **Restart with zero guesses**: If no guesses were submitted during the round, restart clears all empty state and returns to lobby normally.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a "results" room status that displays after the round ends.
- **FR-002**: The correct secret word MUST be visible to all players (both drawer and guessers) on the results screen.
- **FR-003**: Each player's final score MUST be displayed on the results screen, visible to all.
- **FR-004**: The complete chronological guess history MUST be displayed on the results screen, showing who guessed, their guess text, and whether it was correct.
- **FR-005**: Only the host MUST be able to trigger a restart from the results screen.
- **FR-006**: When the host restarts, the room status MUST change to "lobby".
- **FR-007**: When the host restarts, all participants MUST remain in the room (no player is removed).
- **FR-008**: When the host restarts, the round number MUST reset to 0.
- **FR-009**: When the host restarts, scores MUST be reset to empty/default state.
- **FR-010**: When the host restarts, guesses MUST be cleared.
- **FR-011**: When the host restarts, strokes MUST be cleared.
- **FR-012**: Non-host players MUST NOT be able to trigger a restart.
- **FR-013**: New players MUST NOT be able to join a room in "results" status.
- **FR-014**: The round end (transition to "results") MUST be triggered by the host clicking an "End Round" button. The transition MUST be immediate — no confirmation dialog or grace period.

### Key Entities

- **Room**: The existing game room entity. Gains a new valid status value "results" in addition to "lobby" and "active". No new data fields required beyond what already exists (scores, guesses, strokes, participants).
- **Participant**: Existing player entity, unchanged. Participants are preserved across restart.
- **RoundResults**: Implicit view — not a new entity, but a presentation of existing data (room.secretWord, room.scores, room.guesses) filtered through the "results" status.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All players see the results screen with the correct word, scores, and guess history within seconds of the round ending.
- **SC-002**: After the host clicks "Restart", all players see the lobby state within seconds.
- **SC-003**: The restart operation completes (status → lobby, state cleared) within 500ms of the host's request.
- **SC-004**: 100% of players who were in the game before restart are still present in the lobby after restart.
- **SC-005**: A host can complete the restart flow and start a new game in under 30 seconds.

## Assumptions

- The round end trigger is a host action (host clicks "End Round"). This aligns with the existing host-privilege pattern.
- The same room code is preserved across restart — players do not need a new code to rejoin.
- No new UI pages are needed; results are rendered as a new phase within the existing GamePage (or replacing it), and restart returns to the existing LobbyPage.
- The existing sync mechanism continues to work for the results and lobby states.
- The existing "back to lobby" flow (e.g., the Exit Game button) is unaffected.
- Players who leave during results do not need to be tracked or handled specially.

## Non-Goals

- Multi-round gameplay (consecutive rounds without returning to lobby) is out of scope.
- Round timer or countdown is out of scope.
- Player voting to end the round is out of scope (host-only).
- Player removal or kicking during results/restart is out of scope.
- New room code generation on restart is out of scope (same room code preserved).
- Animated or celebratory results transitions are out of scope (static results display).
