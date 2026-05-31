# Research: Results and Restart

**Date**: 2026-05-31 | **Plan**: [plan.md](./plan.md)

## Overview

This feature extends the existing room lifecycle with a "results" status and a host-driven restart flow. It reuses existing patterns: host-only server-enforced actions, HTTP polling for state sync, and in-memory state management. No new technology, library, or external dependency is required.

## Resolved Unknowns

No [NEEDS CLARIFICATION] markers remained in the spec after `/speckit.clarify`. The two clarifications resolved during specification were:

| Decision | Rationale | Alternatives |
|----------|-----------|--------------|
| End Round is a host click — immediate, no confirmation | Matches existing host-action pattern (Start Game, Restart are also single-click) | Auto-end on all-correct; grace period with countdown |
| Host must rejoin to restart if disconnected | Simplest; no host-transfer logic needed | Transfer host to next player; indefinite stall |

## Key Design Decisions

| Decision | Rationale |
|----------|----------|
| No new room fields needed | Scores, guesses, strokes, secretWord already exist and are polled |
| "results" is a new RoomStatus value alongside "lobby" and "active" | Minimal change; status gating already works via `toRoomSnapshot` |
| End Round and Restart are separate endpoints | Keeps actions independent; follows existing `POST /:code/start` pattern |
| Results panel replaces game canvas in GamePage | No new page needed; conditional rendering based on `room.status` |
| Same lobby page reused after restart | LobbyPage already handles "lobby" status; no changes needed |

## Design Constraints

- No changes to existing voting, scoring, or word-selection logic
- No changes to participant join/leave flow (except rejecting join during "results")
- No new polling mechanisms — reuse existing 2s interval in GamePage
