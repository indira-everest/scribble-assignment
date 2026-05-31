# Data Model: Results and Restart

**Date**: 2026-05-31 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](../spec.md)

## Room Status

Extend the existing `RoomStatus` union type with a new value:

```typescript
type RoomStatus = "lobby" | "active" | "results";
```

## Room Entity (existing, extended)

| Field | Type | Change | Notes |
|-------|------|--------|-------|
| `status` | `RoomStatus` | Extended union | New value `"results"` added |
| `hostId` | `string` | Unchanged | Used for End Round / Restart gating |
| `participants` | `Participant[]` | Unchanged | Preserved across restart |
| `drawerId` | `string \| null` | Unchanged | Cleared on restart |
| `secretWord` | `string \| null` | Unchanged | Visible to all players in results (no gating) |
| `orderedWords` | `string[]` | Unchanged | Preserved (reused on restart) |
| `strokes` | `Stroke[]` | Unchanged | Cleared on restart |
| `guesses` | `GuessEntry[]` | Unchanged | Cleared on restart |
| `scores` | `Record<string, number>` | Unchanged | Cleared on restart |
| `roundNumber` | `number` | Unchanged | Reset to 0 on restart |

## State Transitions

```text
[createRoom] → lobby → [startGame] → active → [endRound] → results → [restartGame] → lobby
                                                                       ↓
                                                                [players exit]
```

| Transition | Trigger | Gating | State Changes |
|------------|---------|--------|---------------|
| `active` → `results` | Host clicks "End Round" | `hostId` match | `status = "results"` |
| `results` → `lobby` | Host clicks "Restart" | `hostId` match | `status = "lobby"`; `drawerId = null`; `secretWord = null`; `roundNumber = 0`; `strokes = []`; `guesses = []`; `scores = {}` |

## Validation Rules

- End Round: `participantId` must match `room.hostId`; room must be in `"active"` status
- Restart: `participantId` must match `room.hostId`; room must be in `"results"` status
- Join room: rejected if `room.status === "results"` (FR-013)
- `toRoomSnapshot`: in `"results"` status, `secretWord` is always visible (ungated for all viewers)
