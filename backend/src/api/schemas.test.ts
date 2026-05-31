import { describe, expect, it } from "vitest";
import { createRoomSchema, joinRoomSchema, roomCodeParamsSchema, startGameSchema } from "./schemas.js";

describe("schemas", () => {
  it("createRoomSchema accepts a valid body with playerName", () => {
    const result = createRoomSchema.parse({ playerName: "Alice" });

    expect(result.playerName).toBe("Alice");
  });

  it("roomCodeParamsSchema rejects missing code", () => {
    expect(() => roomCodeParamsSchema.parse({})).toThrow();
  });

  it("startGameSchema accepts a valid body with participantId", () => {
    const result = startGameSchema.parse({ participantId: "p1" });

    expect(result.participantId).toBe("p1");
  });

  it("startGameSchema rejects empty participantId", () => {
    expect(() => startGameSchema.parse({ participantId: "" })).toThrow();
  });

  it("createRoomSchema trims whitespace from playerName", () => {
    const result = createRoomSchema.parse({ playerName: "  Alice  " });

    expect(result.playerName).toBe("Alice");
  });

  it("createRoomSchema trims whitespace from playerName", () => {
    const result = createRoomSchema.parse({ playerName: "  Alice  " });

    expect(result.playerName).toBe("Alice");
  });

  it("createRoomSchema rejects whitespace-only playerName", () => {
    expect(() => createRoomSchema.parse({ playerName: "   " })).toThrow("Name cannot be empty");
  });

  it("joinRoomSchema trims whitespace from playerName", () => {
    const result = joinRoomSchema.parse({ playerName: "  Bob  " });

    expect(result.playerName).toBe("Bob");
  });

  it("joinRoomSchema rejects whitespace-only playerName", () => {
    expect(() => joinRoomSchema.parse({ playerName: "   " })).toThrow("Name cannot be empty");
  });
});
