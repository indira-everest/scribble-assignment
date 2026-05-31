# API Contracts: Results and Restart

**Date**: 2026-05-31 | **Plan**: [plan.md](../plan.md)

## POST /rooms/:code/end-round

End the current round and transition to results. Host-only.

### Request

```json
{
  "participantId": "string"
}
```

### Response (200)

```json
{
  "room": {
    "code": "ABCD",
    "status": "results",
    "hostId": "p1",
    "participants": [...],
    "drawerId": "p1",
    "secretWord": "apple",
    "orderedWords": [...],
    "strokes": [...],
    "guesses": [...],
    "scores": { "p1": 0, "p2": 100 },
    "roundNumber": 1
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 403 | Participant is not the host |
| 400 | Room is not in "active" status |
| 404 | Room not found |

---

## POST /rooms/:code/restart

Restart the game: return to lobby, clear round state. Host-only.

### Request

```json
{
  "participantId": "string"
}
```

### Response (200)

```json
{
  "room": {
    "code": "ABCD",
    "status": "lobby",
    "hostId": "p1",
    "participants": [...],
    "drawerId": null,
    "secretWord": null,
    "orderedWords": [...],
    "strokes": [],
    "guesses": [],
    "scores": {},
    "roundNumber": 0
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 403 | Participant is not the host |
| 400 | Room is not in "results" status |
| 404 | Room not found |
