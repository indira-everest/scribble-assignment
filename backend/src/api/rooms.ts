import { Router } from "express";
import {
  createRoomSchema,
  HttpError,
  joinRoomSchema,
  roomCodeParamsSchema,
  roomViewerQuerySchema,
  startGameSchema,
  strokeSchema,
  clearStrokesSchema,
  guessSchema
} from "./schemas.js";
import {
  addStroke,
  clearStrokes,
  createRoom,
  getRoom,
  joinRoom,
  startGame,
  submitGuess,
  toRoomSnapshot
} from "../services/roomStore.js";

export function createRoomsRouter() {
  const router = Router();

  router.post("/", (request, response, next) => {
    try {
      const { playerName } = createRoomSchema.parse(request.body);
      const result = createRoom(playerName);

      response.status(201).json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/join", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { playerName } = joinRoomSchema.parse(request.body);
      const roomCode = code.trim();

      if (!roomCode) {
        throw new HttpError(400, "Please enter a room code.");
      }

      const room = getRoom(roomCode.toUpperCase());

      if (!room) {
        throw new HttpError(404, "Room not found. Check your code and try again.");
      }

      const result = joinRoom(roomCode.toUpperCase(), playerName);

      if (!result) {
        throw new HttpError(400, "Name already taken. Choose a different name.");
      }

      response.json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:code", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = roomViewerQuerySchema.parse(request.query);
      const room = getRoom(code.toUpperCase());

      if (!room) {
        throw new HttpError(404, "Unable to load room");
      }

      response.json({
        room: toRoomSnapshot(room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/start", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = startGameSchema.parse(request.body);
      const result = startGame(code.toUpperCase(), participantId);

      if (!result.ok) {
        const statusMap: Record<string, number> = {
          "Room not found.": 404,
          "Game already started.": 409
        };
        const status = statusMap[result.error] ?? 403;
        throw new HttpError(status, result.error);
      }

      response.json({
        room: toRoomSnapshot(result.room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/strokes", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId, stroke } = strokeSchema.parse(request.body);
      const result = addStroke(code.toUpperCase(), participantId, stroke);

      if (!result.ok) {
        const statusMap: Record<string, number> = {
          "Room not found.": 404,
          "Only the drawer can draw.": 403
        };
        const status = statusMap[result.error] ?? 500;
        throw new HttpError(status, result.error);
      }

      response.json({
        room: toRoomSnapshot(result.room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:code/strokes", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = clearStrokesSchema.parse(request.body);
      const result = clearStrokes(code.toUpperCase(), participantId);

      if (!result.ok) {
        const statusMap: Record<string, number> = {
          "Room not found.": 404,
          "Only the drawer can clear the canvas.": 403
        };
        const status = statusMap[result.error] ?? 500;
        throw new HttpError(status, result.error);
      }

      response.json({
        room: toRoomSnapshot(result.room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/guess", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId, text } = guessSchema.parse(request.body);
      const result = submitGuess(code.toUpperCase(), participantId, text);

      if (!result.ok) {
        const statusMap: Record<string, number> = {
          "Room not found.": 404,
          "The drawer cannot submit guesses.": 403,
          "Guess cannot be empty.": 400
        };
        const status = statusMap[result.error] ?? 500;
        throw new HttpError(status, result.error);
      }

      response.json({
        room: toRoomSnapshot(result.room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
