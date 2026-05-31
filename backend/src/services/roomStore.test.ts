import { describe, expect, it } from "vitest";
import { createRoom, getRoom, joinRoom, startGame } from "./roomStore.js";

describe("roomStore", () => {
  it("createRoom sets creator as host", () => {
    const result = createRoom("Alice");

    expect(result.room.code).toMatch(/^[A-Z0-9]{4}$/);
    expect(result.room.participants).toHaveLength(1);
    expect(result.room.hostId).toBe(result.participantId);
    expect(result.room.participants[0].name).toBe("Alice");
    expect(result.participantId).toBeDefined();
  });

  it("joinRoom returns null for an unknown room code", () => {
    const result = joinRoom("ZZZZ", "Bob");

    expect(result).toBeNull();
  });

  it("joinRoom rejects duplicate non-host name", () => {
    const { room } = createRoom("Alice");
    joinRoom(room.code, "Bob");
    const result = joinRoom(room.code, "Bob");

    expect(result).toBeNull();
  });

  it("joinRoom allows unique name", () => {
    const { room } = createRoom("Alice");
    const result = joinRoom(room.code, "Bob");

    expect(result).not.toBeNull();
    expect(result!.room.participants).toHaveLength(2);
  });

  it("joinRoom reassigns hostId when host rejoins", () => {
    const { room: createdRoom } = createRoom("Alice");
    const result = joinRoom(createdRoom.code, "Alice");

    expect(result).not.toBeNull();
    expect(result!.room.hostId).toBe(result!.participantId);
    expect(result!.room.participants).toHaveLength(2);
    expect(result!.room.participants[1].name).toBe("Alice");
  });

  it("startGame returns error for non-existent room", () => {
    const result = startGame("ZZZZ", "p1");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Room not found.");
  });

  it("startGame returns error for non-host", () => {
    const { room: createdRoom, participantId: hostId } = createRoom("Alice");
    joinRoom(createdRoom.code, "Bob");
    const result = startGame(createdRoom.code, "non-host-id");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Only the host can start the game.");
  });

  it("startGame returns error when fewer than 2 players", () => {
    const { room: createdRoom, participantId: hostId } = createRoom("Alice");
    const result = startGame(createdRoom.code, hostId);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Need at least 2 players to start.");
  });

  it("startGame sets status to active with 2+ players", () => {
    const { room: createdRoom, participantId: hostId } = createRoom("Alice");
    joinRoom(createdRoom.code, "Bob");
    const result = startGame(createdRoom.code, hostId);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.room.status).toBe("active");
    }
  });

  it("getRoom returns null for unknown code", () => {
    const room = getRoom("NONEXIST");

    expect(room).toBeNull();
  });
});
