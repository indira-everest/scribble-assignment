# Quickstart: Results and Restart

**Branch**: `004-results-restart` | **Date**: 2026-05-31

## What This Feature Does

1. **End Round** — Host clicks an "End Round" button during an active game → room transitions to "results" status → all players see the correct word, final scores, and full guess history
2. **Restart Game** — From the results screen, host clicks "Restart" → room returns to "lobby" status → players preserved → scores/guesses/strokes cleared → host can start a new game

## Key Files

| File | Purpose |
|------|---------|
| `backend/src/models/game.ts` | Add `"results"` to `RoomStatus` type |
| `backend/src/services/roomStore.ts` | Add `endRound()` and `restartGame()` service functions |
| `backend/src/api/schemas.ts` | Zod schemas for `endRoundSchema`, `restartSchema` |
| `backend/src/api/rooms.ts` | `POST /:code/end-round` and `POST /:code/restart` routes |
| `frontend/src/services/api.ts` | `endRound()`, `restartGame()` API methods |
| `frontend/src/state/roomStore.ts` | `endRound()`, `restartGame()` store actions |
| `frontend/src/components/ResultsPanel.tsx` | New component — renders results view |
| `frontend/src/pages/GamePage.tsx` | Conditionally render ResultsPanel when `room.status === "results"` |
| `frontend/src/styles/app.css` | Styles for results panel |

## Implementation Order

1. Backend: Add `"results"` to RoomStatus in `game.ts`
2. Backend: Implement `endRound()` and `restartGame()` in `roomStore.ts`
3. Backend: Add Zod schemas in `schemas.ts`
4. Backend: Add routes in `rooms.ts`
5. Frontend: Add API methods in `api.ts`
6. Frontend: Add store actions in `roomStore.ts`
7. Frontend: Create `ResultsPanel.tsx` component
8. Frontend: Update `GamePage.tsx` to show results when `status === "results"`
9. Frontend: Add CSS for results panel
10. Tests: Write backend tests for endRound/restartGame
11. Tests: Update frontend test mocks

## Verification

```bash
# Backend
cd backend && npx vitest run && npx tsc --noEmit

# Frontend
cd frontend && npx vitest run && npx tsc --noEmit

# Manual: two browser tabs — host ends round, guest sees results, host restarts, both see lobby
```
