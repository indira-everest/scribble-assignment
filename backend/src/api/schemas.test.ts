import { describe, expect, it } from "vitest";
import { createRoomSchema, roomCodeParamsSchema, startGameSchema } from "./schemas.js";

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
});
