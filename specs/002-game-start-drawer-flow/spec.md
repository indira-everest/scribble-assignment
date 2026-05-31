# Feature Specification: Game Start & Drawer Flow

**Feature Branch**: `002-game-start-drawer-flow`

**Created**: 2026-05-31

**Status**: Draft

**Input**: User description: "Game Start & Drawer Flow: Player names are trimmed before validation, empty/whitespace names rejected, host becomes drawer first round, drawer clearly identified, secret word selected deterministically, visible only to drawer, guessers must not see it."

## Clarifications

### Session 2026-05-31

- Q: Secret word distribution — should the API conditionally include the word only for the drawer? → A: API returns `secretWord` field only when the polling participantId matches the drawer ID; guessers receive `secretWord: null`.
- Q: Idempotent start — should starting an already-active game be an error or success? → A: Return 409 Conflict with message "Game already started."
- Q: Drawer rotation — does this feature include round transition to round 2+? → A: Deferred to a future feature. Scope is limited to round 1 startup.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Role Assignment & Secret Word Reveal (Priority: P1)

When the host starts the game, all players in the lobby are moved into the active game. The host is assigned as the drawer for the first round. A secret word is selected from the word list. Only the drawer sees the word; guessers see a placeholder.

**Why this priority**: This is the core game-start experience without which no round can begin. All other flows depend on this transition.

**Independent Test**: Can be fully tested by starting a game from a lobby with 2+ players and verifying that the drawer sees a word while guessers see a placeholder.

**Acceptance Scenarios**:

1. **Given** a lobby with 2 or more players, **When** the host clicks "Start Game", **Then** all players see the game screen with the drawer's name highlighted and the secret word visible only to the drawer.

2. **Given** a game has started, **When** a guesser views the interface, **Then** the secret word is not revealed in any visible element, network payload, or page source.

3. **Given** a game has started, **When** the drawer views the interface, **Then** the secret word is displayed prominently with a label ("Your word") and no other participant sees it.

---

### User Story 2 - Name Input Validation (Priority: P2)

When a player enters their name to create or join a room, leading and trailing whitespace is removed before validation. Empty or whitespace-only names display a clear error message.

**Why this priority**: Prevents confusion from invisible characters and ensures readable player lists. Affects room setup quality but does not block the game from starting.

**Independent Test**: Can be tested independently by submitting a form with whitespace-only or empty names and verifying the error message appears.

**Acceptance Scenarios**:

1. **Given** the create or join room form, **When** a player submits a name with leading or trailing spaces like "  Alice  ", **Then** the name is accepted as "Alice" (trimmed).

2. **Given** the create or join room form, **When** a player submits an empty name, **Then** an error message "Name cannot be empty" is displayed.

3. **Given** the create or join room form, **When** a player submits a name containing only whitespace like "   ", **Then** an error message "Name cannot be empty" is displayed.

---

### User Story 3 - Drawer Identification (Priority: P3)

During the game, the current drawer is clearly identified in the player list for all participants.

**Why this priority**: Improves clarity and social dynamics of the game but the game functions without it.

**Independent Test**: Can be tested visually by joining as a guesser and verifying the drawer is clearly marked in the participant list.

**Acceptance Scenarios**:

1. **Given** an active game, **When** any participant views the player list, **Then** the current drawer is visually distinct (e.g., labeled "Drawing" with a highlight or badge) from guessers.

2. **Given** an active game, **When** a new player polls the room state, **Then** the response includes which participant is the drawer.

---

### Edge Cases

- **Solo lobby**: Host attempts to start the game with only themselves in the room — the start action is blocked with a message that at least 2 players are needed.
- **Empty word list**: The starter word list is empty — the game start fails gracefully with a message that no words are available.
- **All words exhausted** (future feature): Word list exhaustion and cycling apply to round 2+ and are out of scope for this feature. Word list must contain at least one word for round 1 to start.
- **Drawer disconnection**: If the drawer disconnects during a round, the round ends or a new drawer is assigned — out of scope for this feature.
- **Player joins after game starts**: Late-joining players see that the game is in progress but cannot see the current secret word.
- **Duplicate name after game starts**: If a late joiner's name matches an existing player, the duplicate name rejection still applies.
- **Double start**: The host or another player sends a start request after the game is already active — the system responds with a 409 Conflict and does not change room state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST trim leading and trailing whitespace from player names before any validation.
- **FR-002**: System MUST reject player names that are empty or contain only whitespace with a clear error message.
- **FR-003**: When the host starts the game, the host MUST be assigned as the drawer for round 1.
- **FR-004**: System MUST select a secret word deterministically from the starter word list based on a deterministic input (e.g., room code combined with round number).
- **FR-005**: System MUST display the secret word to the drawer only.
- **FR-006**: API MUST conditionally include the `secretWord` field in room state responses: include it only when the requesting participantId matches the current drawer ID; for all other participants the field MUST be `null` or omitted.
- **FR-007**: System MUST identify the current drawer in the participant list for all players.
- **FR-008**: System MUST prevent game start when fewer than 2 players are in the room.
- **FR-009**: System MUST prevent game start when no words are available in the word list.
- **FR-010**: System MUST persist the current round's drawer ID and secret word in the room state.
- **FR-011**: System MUST order the word list deterministically so all participants derive the same word for a given round.
- **FR-012**: System MUST return a 409 Conflict error when a start request is submitted for a room whose status is already "active".

### Key Entities *(include if feature involves data)*

- **Player**: A participant in the game. Has a name, a unique ID, and a role (drawer or guesser) for the current round.
- **Room**: The lobby or game session containing players, the room code, game status (lobby, active), the current round number, and the drawer ID for the round.
- **Round**: A single drawing-and-guessing cycle within the game. Has a round number, a drawer, a secret word, and a list of guessers. This feature covers round 1 only; round transition (round 2+) is a separate feature.
- **Secret Word**: The word the drawer must illustrate. Selected deterministically from the starter word list. Not visible to guessers.
- **Word List**: An ordered collection of words from which the secret word is selected. Exists as part of the game configuration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can transition from lobby to active game within 1 second of the host clicking "Start Game" (network latency excluded).
- **SC-002**: 100% of guessers correctly report that they cannot see the secret word when surveyed at the start of a round.
- **SC-003**: The drawer's name is correctly identified as the host for round 1 in 100% of games started.
- **SC-004**: All players in the same room see the same secret word for the same round when polling state (drawer sees it, guessers do not).

## Assumptions

- Players always have a valid room session (participantId) when the game starts.
- The starter word list is populated and accessible to both frontend and backend.
- Word list ordering is stable across all participants (e.g., alphabetical or pre-shuffled at room creation).
- Network polling between frontend and backend carries the round's drawer ID and a flag (not the word) for guessers.
- Late joining after game start is handled by the existing polling mechanism but the secret word is never exposed to late joiners.
- The deterministic word selection uses room code and round number as input, ensuring all participants independently compute the same word.
