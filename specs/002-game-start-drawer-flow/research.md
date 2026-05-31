# Research: Game Start & Drawer Flow

**Branch**: `002-game-start-drawer-flow` | **Date**: 2026-05-31

## Unknowns Resolved

### Decision 1: Deterministic Word Selection Algorithm

- **Decision**: DJB2 hash of `"${roomCode}-${roundNumber}"` modulo word list length
- **Rationale**: Simple, fast, no external dependencies, deterministic across all participants with same input. DJB2 is well-understood and avoids collision clustering of naive sum-of-chars.
- **Alternatives considered**:
  - CRC32: More complex, no advantage for small inputs
  - SHA-256: Overkill for word selection, requires Node crypto import
  - Sum-of-char-codes modulo N: Simple but biased (non-uniform distribution)
  - Random selection stored in room state: Not deterministic across participants (frontend can't independently compute)

### Decision 2: API Response Shape for Drawer Detection

- **Decision**: Add `drawerId: string` to `RoomSnapshot`. Conditionally include `secretWord` only when `participantId === drawerId`.
- **Rationale**: FR-006 requires word never exposed to guessers. Guessing which field holds the word is a poor security boundary; better to not send it at all. `drawerId` is always visible so every client can render the "Drawing" badge.
- **Alternatives considered**:
  - Separate `/rooms/:code/word` endpoint for drawer only: More round trips, adds latency
  - `isDrawer: boolean` flag on participant: Works but duplicates info already derivable from `drawerId`
  - Include word in all responses but warn against cheating: Violates FR-006

### Decision 3: Name Trimming — Backend + Frontend

- **Decision**: Backend Zod schema uses `.trim().min(1, "Name cannot be empty")` as authoritative validation. Frontend also trims before submission for instant UX feedback.
- **Rationale**: Backend is the source of truth (FR-001/FR-002). Frontend trimming prevents unnecessary round trips. Both layers validate.
- **Alternatives considered**:
  - Frontend-only trimming: Backend would accept whitespace-only names on direct API calls
  - Backend-only: UX would require a round trip to discover empty-name error

### Decision 4: Word List Ordering

- **Decision**: Alphabetical sorting at room creation time, stored in the `Room` entity. All participants receive the same ordered list.
- **Rationale**: Simple, deterministic, and consistent across all clients without coordination. Alphabetical order ensures stable indices for DJB2 hash lookup.
- **Alternatives considered**:
  - Pre-shuffled and stored at room creation: Functionally equivalent but adds unnecessary complexity
  - Unordered set with seeded selection: More complex algebra, same result

### Decision 5: Frontend GamePage Architecture

- **Decision**: New `GamePage.tsx` component that reads `room.drawerId` and `room.secretWord` from the `RoomState`. Compares `drawerId` against stored `participantId` to determine role. Drawer sees word prominently; guesser sees placeholder. Both see drawer identification badge.
- **Rationale**: Keeps role detection simple and reactive. When polling updates the room snapshot, the component re-renders accordingly. No separate `/role` endpoint needed.
- **Alternatives considered**:
  - Role-specific sub-pages (`DrawerPage`, `GuesserPage`): More routing overhead
  - Drawer state in separate context: Unnecessary indirection when room snapshot already has the data
