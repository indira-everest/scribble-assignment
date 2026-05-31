import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";

const mockRoom = {
  code: "ABCD",
  status: "lobby" as const,
  hostId: "p1",
  participants: [],
  availableWords: [],
  roles: [],
  roundNumber: 0,
  drawerId: null,
  secretWord: null,
  orderedWords: [],
  strokes: [],
  guesses: [],
  scores: {},
};

describe("api service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("createRoom sends POST to /rooms with playerName in body", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          participantId: "p1",
          room: mockRoom,
        }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    await api.createRoom("Alice");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ playerName: "Alice" }),
      })
    );
  });

  it("fetchRoom sends GET to /rooms/:code with participantId query param", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          room: { ...mockRoom, code: "XYZW" },
        }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    await api.fetchRoom("XYZW", "p1");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms/XYZW?participantId=p1"),
      expect.anything()
    );
  });

  it("startGame sends POST to /rooms/:code/start", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          room: { ...mockRoom, status: "active" },
        }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    const result = await api.startGame("ABCD", "p1");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms/ABCD/start"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ participantId: "p1" }),
      })
    );
    expect(result.room.status).toBe("active");
  });
});
