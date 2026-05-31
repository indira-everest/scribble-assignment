import type { RoomSnapshot } from "../services/api";
import { Card } from "./Card";

interface ResultsPanelProps {
  room: RoomSnapshot;
  onRestart?: () => void;
  isHost: boolean;
}

export function ResultsPanel({ room, isHost, onRestart }: ResultsPanelProps) {
  return (
    <section className="panel results-panel">
      <div className="results-panel__header">
        <span className="section-kicker">Round Over</span>
        <h2 className="results-panel__title">Results</h2>
      </div>

      <div className="results-panel__word">
        <span className="results-panel__word-label">The word was</span>
        <span className="results-panel__word-value">{room.secretWord ?? "???"}</span>
      </div>

      <Card title="Final Scores">
        {room.participants.length === 0 ? (
          <p className="guess-history__empty">No players.</p>
        ) : (
          <ul className="score-list">
            {room.participants.map((p) => (
              <li key={p.id} className="score-entry">
                <span className="score-entry__name">{p.name}</span>
                <strong className="score-entry__value">{room.scores[p.id] ?? 0}</strong>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Guess History">
        {room.guesses.length === 0 ? (
          <p className="guess-history__empty">No guesses were submitted.</p>
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

      {isHost ? (
        <div className="button-row">
          <button className="button button--primary" onClick={onRestart}>
            Restart Game
          </button>
        </div>
      ) : null}
    </section>
  );
}
