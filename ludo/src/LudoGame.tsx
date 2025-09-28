// src/LudoGame.tsx
import React, { useState } from "react";
import { Matrix6x6 } from "./components/Matrix6x6";
import { Matrix3x3 } from "./components/Matrix3";
import { UMatrix6x3 } from "./components/UMatrix6x3";
import DiceRoller from "./components/DiceRoller";
import type { GameData, Player } from './components/rules'

const initialPlayers: Player[] = [
  { id: 0, name: "Blue", color: "blue", pawns: [{ id:0, position:-1, isHome:false, stepsMoved:0 },{ id:1, position:-1, isHome:false, stepsMoved:0 },{ id:2, position:-1, isHome:false, stepsMoved:0 },{ id:3, position:-1, isHome:false, stepsMoved:0 }], score:0 },
  { id: 1, name: "Red", color: "red", pawns: [{ id:0, position:-1, isHome:false, stepsMoved:0 },{ id:1, position:-1, isHome:false, stepsMoved:0 },{ id:2, position:-1, isHome:false, stepsMoved:0 },{ id:3, position:-1, isHome:false, stepsMoved:0 }], score:0 },
  { id: 2, name: "Green", color: "green", pawns: [{ id:0, position:-1, isHome:false, stepsMoved:0 },{ id:1, position:-1, isHome:false, stepsMoved:0 },{ id:2, position:-1, isHome:false, stepsMoved:0 },{ id:3, position:-1, isHome:false, stepsMoved:0 }], score:0 },
  { id: 3, name: "Yellow", color: "yellow", pawns: [{ id:0, position:-1, isHome:false, stepsMoved:0 },{ id:1, position:-1, isHome:false, stepsMoved:0 },{ id:2, position:-1, isHome:false, stepsMoved:0 },{ id:3, position:-1, isHome:false, stepsMoved:0 }], score:0 },
];

const LudoGame: React.FC = () => {
  const [gameData, setGameData] = useState<GameData>({ players: initialPlayers, currentTurn: 0 });

  const updateGame = (newData: GameData) => setGameData(newData);

  // Sample empty matrices for illustration (You can implement proper Ludo board numbering later)
  const empty6x6 = Array(6).fill(Array(6).fill(null));
  const empty3x3 = Array(3).fill(Array(3).fill(null));
  const empty6x3 = Array(6).fill(Array(3).fill(null));

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "20px" }}>Ludo Game</h1>

      <div style={{ display: "flex", gap: "20px" }}>
        <Matrix6x6 matrix={empty6x6} />
        <UMatrix6x3 matrix={empty6x3} />
      </div>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <UMatrix6x3 matrix={empty6x3} />
        <Matrix6x6 matrix={empty6x6} />
      </div>

      <div style={{ marginTop: "30px", width: "80%" }}>
        <DiceRoller 
          currentPlayer={gameData.players[gameData.currentTurn]} 
          gameData={gameData} 
          updateGame={updateGame} 
        />
      </div>
    </div>
  );
};

export default LudoGame;
