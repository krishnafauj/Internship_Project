import React, { useState } from "react";
import DiceRoller from "./DiceRoller";
import { LudoBoard } from "./LudoBoard";
import type { GameData, Player } from "./Rules";

const initPlayers = (): Player[] => [
  { id: 0, name: "Red", color: "red", pawns: Array(4).fill(0).map((_,i)=>({id:i,position:-1,isHome:false,stepsMoved:0})), score: 0 },
  { id: 1, name: "Green", color: "green", pawns: Array(4).fill(0).map((_,i)=>({id:i,position:-1,isHome:false,stepsMoved:0})), score: 0 },
  { id: 2, name: "Yellow", color: "yellow", pawns: Array(4).fill(0).map((_,i)=>({id:i,position:-1,isHome:false,stepsMoved:0})), score: 0 },
  { id: 3, name: "Blue", color: "blue", pawns: Array(4).fill(0).map((_,i)=>({id:i,position:-1,isHome:false,stepsMoved:0})), score: 0 }
];

const LudoPage: React.FC = () => {
  const [gameData, setGameData] = useState<GameData>({
    players: initPlayers(),
    currentTurn: 0
  });

  const currentPlayer = gameData.players[gameData.currentTurn];

  return (
    <div>
      <h1>Ludo Game</h1>
      <LudoBoard gameData={gameData} />
      <DiceRoller currentPlayer={currentPlayer} gameData={gameData} updateGame={setGameData} />
    </div>
  );
};

export default LudoPage;
