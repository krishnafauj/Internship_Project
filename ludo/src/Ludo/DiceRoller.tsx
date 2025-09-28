import React, { useState } from "react";
import type { GameData, Player } from "./Rules";
import { rollDice, getEligiblePawns, movePawn, nextTurn } from "./Rules";

interface DiceRollerProps {
  currentPlayer: Player;
  gameData: GameData;
  updateGame: (game: GameData) => void;
}

const DiceRoller: React.FC<DiceRollerProps> = ({ currentPlayer, gameData, updateGame }) => {
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [awaitingMove, setAwaitingMove] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Roll dice animation
  const handleRoll = () => {
    if (rolling || awaitingMove || actionInProgress) return;

    setRolling(true);
    let count = 0;

    const rollInterval = setInterval(() => {
      const temp = Math.floor(Math.random() * 6) + 1;
      setDiceValue(temp);
      count++;
      if (count >= 10) {
        clearInterval(rollInterval);
        finalizeRoll(temp);
      }
    }, 50);
  };

  // Finalize dice roll
  const finalizeRoll = (dice: number) => {
    setRolling(false);
    let eligible = getEligiblePawns(currentPlayer, dice, gameData);

    // Include pawns at home if dice=6
    if (dice === 6) {
      const hasPawnAtHome = currentPlayer.pawns.some(p => p.position === -1);
      if (hasPawnAtHome) {
        eligible = currentPlayer.pawns
          .map((p, idx) => ({ pawn: p, idx }))
          .filter(({ pawn, idx }) => pawn.position === -1 || eligible.includes(idx))
          .map(({ idx }) => idx);
      }
    }

    // No eligible pawns → next turn after 2s
    if (eligible.length === 0) {
      setActionInProgress(true);
      setTimeout(() => {
        const newGame = nextTurn({ ...gameData }, dice);
        updateGame(newGame);
        setDiceValue(null);
        setActionInProgress(false);
      }, 2000);
      return;
    }

    // Only one pawn eligible → auto move after 2s
    if (eligible.length === 1) {
      const pawn = currentPlayer.pawns[eligible[0]];
      const pawnOpened = pawn.position === -1 && dice === 6;

      setActionInProgress(true);
      setTimeout(() => {
        const newGame = movePawn({ ...gameData }, currentPlayer.id, eligible[0], dice);
        const finalGame = nextTurn({ ...newGame }, dice, pawnOpened);
        updateGame(finalGame);
        setDiceValue(null);
        setActionInProgress(false);
      }, 2000);
      return;
    }

    // Multiple pawns → wait for player click
    setAwaitingMove(true);
  };

  // Handle pawn click
  const handlePawnClick = (pawnIndex: number) => {
    if (!diceValue) return;

    const eligible = getEligiblePawns(currentPlayer, diceValue, gameData);
    if (!eligible.includes(pawnIndex)) return;

    const pawn = currentPlayer.pawns[pawnIndex];
    const pawnOpened = pawn.position === -1 && diceValue === 6;

    setActionInProgress(true);
    setTimeout(() => {
      const newGame = movePawn({ ...gameData }, currentPlayer.id, pawnIndex, diceValue);
      const finalGame = nextTurn({ ...newGame }, diceValue, pawnOpened);
      updateGame(finalGame);
      setDiceValue(null);
      setAwaitingMove(false);
      setActionInProgress(false);
    }, 2000);
  };

  return (
    <div style={{ margin: "20px 0" }}>
      <div style={{ marginBottom: "10px", fontWeight: "bold", color: currentPlayer.color }}>
        Current Turn: {currentPlayer.name.toUpperCase()}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button onClick={handleRoll} disabled={rolling || awaitingMove || actionInProgress}>
          {rolling ? "Rolling..." : "Roll Dice"}
        </button>
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "3px solid black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "30px",
            backgroundColor: "#fff",
            color:"black",
            borderRadius: "8px",
            boxShadow: "2px 2px 5px rgba(0,0,0,0.3)",
            transition: "transform 0.1s",
            transform: rolling ? "rotate(360deg)" : "rotate(0deg)",
          }}
        >
          {diceValue ?? "-"}
        </div>
      </div>

      {awaitingMove && (
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          {currentPlayer.pawns.map((pawn, idx) => (
            <button
              key={idx}
              onClick={() => handlePawnClick(idx)}
              disabled={!getEligiblePawns(currentPlayer, diceValue ?? 0, gameData).includes(idx)}
              style={{
                backgroundColor: currentPlayer.color,
                opacity: getEligiblePawns(currentPlayer, diceValue ?? 0, gameData).includes(idx) ? 1 : 0.4,
                boxShadow: gameData.currentTurn === currentPlayer.id ? `0 0 10px 3px ${currentPlayer.color}` : "none",
                transform: gameData.currentTurn === currentPlayer.id ? "scale(1.1)" : "scale(1)",
                borderRadius: "50%",
                cursor: "pointer",
                transition: "all 0.2s",
                color: "#fff",
                padding: "8px 12px",
              }}
            >
              Pawn {pawn.id + 1} {pawn.isHome ? "🏠" : `[${pawn.position}]`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiceRoller;
