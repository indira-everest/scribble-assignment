# Discovery Notes

## Current State
This repository is a starter scaffold for a multiplayer Scribble-style guessing game. It includes a TypeScript Express backend with in-memory room storage and a React + Vite frontend with pages for Start, Create Room, Join Room, Lobby, and Game.

The existing implementation attempts room creation, joining by code, and fetching a room snapshot, but the current code is broken enough that rooms cannot be reliably created or joined. Beyond that, the essential game workflow is still not complete.

## Incomplete Behaviors
1. Room creation and join flows are broken or non-functional.
   - The current frontend/backend interactions do not reliably create a room or let a player join a lobby.
   - This blocks all downstream lobby and game scenarios.
2. Room role and host behavior are not enforced.
   - The backend stores rooms, but there is no host field or host-only start permission.
   - The frontend does not distinguish host vs guest or gate the start game action.

2. Lobby state is not automatically refreshed.
   - The starter only supports manual fetch of room state on the Lobby page.
   - There is no polling or automatic sync so participants may not see new joiners in real time.

3. Game start flow is incomplete.
   - There is no drawer assignment or deterministic secret word selection.
   - The secret word is not visible only to the drawer and hidden from guessers.

4. Gameplay interaction is placeholder-only.
   - The canvas, guess submission, guess history, and scoring are only UI placeholders.
   - No guesses are validated, compared, or synchronized across clients.

5. End-of-round and restart behavior is missing.
   - There is no result display, final scoring state, or restart-to-lobby flow.
   - Round state is not reset while preserving players.

## Assumptions
- The room creator should be the host and host-only actions should be enforced in the room model.
- Lobby updates should be synced by periodic polling rather than WebSockets, per project constraints.
- The secret word should come from the backend seed list and be selected deterministically for each round.
- Empty or whitespace-only player names and guesses should be rejected before room join or guess submission.
- Scores should start at zero and correct guesses should be scored consistently, likely with fixed points.

## Relevant Files
- `README.md`
- `discovery.md`

### Backend
- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/api/router.ts`
- `backend/src/api/rooms.ts`
- `backend/src/api/schemas.ts`
- `backend/src/services/roomStore.ts`
- `backend/src/services/roomStore.test.ts`
- `backend/src/seed/starterData.ts`

### Frontend
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/routes/index.tsx`
- `frontend/src/pages/StartPage.tsx`
- `frontend/src/pages/CreateRoomPage.tsx`
- `frontend/src/pages/JoinRoomPage.tsx`
- `frontend/src/pages/LobbyPage.tsx`
- `frontend/src/pages/GamePage.tsx`
- `frontend/src/components/AppShell.tsx`
- `frontend/src/components/RoomCodeBadge.tsx`
- `frontend/src/components/Scoreboard.tsx`
- `frontend/src/components/GuessForm.tsx`
- `frontend/src/components/ResultPanel.tsx`
- `frontend/src/state/roomStore.ts`
- `frontend/src/services/api.ts`
- `frontend/src/services/api.test.ts`
- `frontend/src/styles/app.css`

## Notes for Next Steps
- Inspect `backend/src/services/roomStore.ts` and `backend/src/api/rooms.ts` to confirm where room state should be extended.
- Inspect `frontend/src/state/roomStore.ts` and `frontend/src/pages/LobbyPage.tsx` to identify where polling and host controls should be introduced.
- Review existing tests in `backend/src/services/roomStore.test.ts` and `frontend/src/services/api.test.ts` to extend coverage for the missing behavior.
