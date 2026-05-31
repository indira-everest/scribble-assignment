import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { DrawingCanvas } from "../components/DrawingCanvas";
import { GuessForm } from "../components/GuessForm";
import { ResultPanel } from "../components/ResultPanel";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { Scoreboard } from "../components/Scoreboard";
import { useRoomState, useRoomStore } from "../state/roomStore";

const POLL_INTERVAL = 2000;

export function GamePage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, participantId } = useRoomState();

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
    }
  }, [navigate, room]);

  const isDrawer = room !== null && room.drawerId === participantId;

  useEffect(() => {
    if (!room) return;

    const interval = setInterval(async () => {
      try {
        await roomStore.fetchRoom();
      } catch {
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [room, roomStore]);

  async function handleStrokeComplete(stroke: { points: Array<{ x: number; y: number }> }) {
    try {
      await roomStore.submitStroke(stroke);
    } catch {
    }
  }

  async function handleClear() {
    try {
      await roomStore.clearStrokes();
    } catch {
    }
  }

  async function handleGuess(text: string) {
    try {
      const updated = await roomStore.submitGuess(text);
      const guess = updated.guesses[updated.guesses.length - 1];
      return guess?.isCorrect ?? false;
    } catch {
      return false;
    }
  }

  if (!room || !participantId) {
    return null;
  }

  const viewer = room.participants.find((p) => p.id === participantId) ?? null;
  const drawer = room.participants.find((p) => p.id === room.drawerId) ?? null;

  return (
    <section className="panel game-page">
      <div className="game-page__header">
        <div className="game-page__header-left">
          <span className="section-kicker">Round {room.roundNumber}</span>
          <h1 className="game-page__title">Guess the Word!</h1>
        </div>
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="game-page__layout">
        <aside className="game-page__sidebar game-page__sidebar--left">
          <Scoreboard scores={room.scores} participants={room.participants} />
          <ResultPanel />
        </aside>

        <div className="game-page__main">
          <Card title="Canvas">
            <DrawingCanvas
              strokes={room.strokes}
              enabled={isDrawer}
              onStrokeComplete={handleStrokeComplete}
            />
            {isDrawer ? (
              <div className="button-row" style={{ marginTop: "12px" }}>
                <button className="button button--secondary" onClick={handleClear}>
                  Clear Canvas
                </button>
              </div>
            ) : null}
          </Card>
        </div>

        <aside className="game-page__sidebar game-page__sidebar--right">
          <Card title="Player Info">
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{viewer?.name ?? "Unknown player"}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{isDrawer ? "Drawing" : "Guessing"}</dd>
              </div>
              {drawer ? (
                <div>
                  <dt>Drawer</dt>
                  <dd><span className="badge badge--drawer">{drawer.name}</span></dd>
                </div>
              ) : null}
            </dl>
          </Card>

          {isDrawer ? null : (
            <Card title="Your Guess">
              <GuessForm onSubmit={handleGuess} />
            </Card>
          )}

          <Card title="Guess History">
            {room.guesses.length === 0 ? (
              <p className="guess-history__empty">No guesses yet.</p>
            ) : (
              <ul className="guess-list">
                {room.guesses.map((g, i) => {
                  const guesser = room.participants.find((p) => p.id === g.participantId);
                  return (
                    <li key={i} className={`guess-item ${g.isCorrect ? "guess-item--correct" : "guess-item--incorrect"}`}>
                      <span className="guess-item__name">{guesser?.name ?? "?"}</span>
                      <span className="guess-item__text">{g.text}</span>
                      <span className="guess-item__result">{g.isCorrect ? "✓" : "✗"}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </aside>
      </div>

      <div className="button-row">
        <button className="button button--secondary" onClick={() => navigate("/lobby")}>
          Exit Game
        </button>
      </div>
    </section>
  );
}
