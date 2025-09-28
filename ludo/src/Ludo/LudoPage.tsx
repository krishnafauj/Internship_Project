import React, { useState } from "react";
import DiceRoller from "./DiceRoller";
import type { GameData, Player } from "./Rules";

const initPlayers = (): Player[] => [
  { id: 0, name: "Red", color: "red", pawns: Array(4).fill(0).map((_,i)=>({id:i,position:-1,isHome:false})), score: 0 },
  { id: 1, name: "Green", color: "green", pawns: Array(4).fill(0).map((_,i)=>({id:i,position:-1,isHome:false})), score: 0 },
  { id: 2, name: "Yellow", color: "yellow", pawns: Array(4).fill(0).map((_,i)=>({id:i,position:-1,isHome:false})), score: 0 },
  { id: 3, name: "Blue", color: "blue", pawns: Array(4).fill(0).map((_,i)=>({id:i,position:-1,isHome:false})), score: 0 }
];

const LudoPage: React.FC = () => {
  const [gameData, setGameData] = useState<GameData>({
    players: initPlayers(),
    currentTurn: 0,
    STARTING_POSITIONS: { red: 0, green: 13, yellow: 26, blue: 39 },
    HOME_ENTRY_POSITIONS: { red: 50, green: 11, yellow: 24, blue: 37 },
    PAWN_HOME_POSITIONS: { red: 100, green: 110, yellow: 120, blue: 130 }
  });

  const currentPlayer = gameData.players[gameData.currentTurn];
  const highScore = Math.max(...gameData.players.map(p => p.score));

  return (
    <div>
      <h1>Ludo Game</h1>
      <DiceRoller
        currentPlayer={currentPlayer}
        gameData={gameData}
        updateGame={setGameData}
      />

      <h2>Scores</h2>
      {gameData.players.map(player => (
        <div key={player.id} style={{ color: player.color }}>
          <h4>
            {player.name} — Score: {player.score} {player.score === highScore && highScore > 0 ? "🏆" : ""}
            
          </h4>
          <p>Pawns: {player.pawns.map(p => (p.isHome ? "🏠" : `[${p.position}]`)).join(" ")}</p>
        </div>
      ))}
    </div>
  );
};

export default LudoPage;
