import React, { useState } from "react";

// Pawn Icon
const PawnIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: color,
      border: "2px solid #333",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
    }}
  >
    <div
      style={{
        width: size * 0.3,
        height: size * 0.3,
        borderRadius: "50%",
        backgroundColor: "#fff",
      }}
    />
  </div>
);

// Rules and types
interface Pawn {
  id: number;
  position: number; // -1 = base, 0-51 = board, 100+ = home
  isHome: boolean;
  stepsMoved: number;
}

interface Player {
  id: number;
  name: string;
  color: string;
  pawns: Pawn[];
  score: number;
}

interface GameData {
  players: Player[];
  currentTurn: number;
}

const startingPositions: Record<string, number> = {
  green: 0,
  red: 13,
  blue: 26,
  yellow: 39,
};

const homeEntry: Record<string, number> = {
  green: 50,
  red: 12,
  blue: 25,
  yellow: 38,
};

const homePaths: Record<string, number[]> = {
  green: [52, 53, 54, 55, 56, 57],
  red: [58, 59, 60, 61, 62, 63],
  blue: [64, 65, 66, 67, 68, 69],
  yellow: [70, 71, 72, 73, 74, 75],
};

const rollDice = () => Math.floor(Math.random() * 6) + 1;

const handleCut = (gameData: GameData, movingPlayer: Player, pawnPos: number) => {
  gameData.players.forEach((player) => {
    if (player.id !== movingPlayer.id) {
      player.pawns.forEach((p) => {
        if (!p.isHome && p.position === pawnPos && pawnPos < 52) {
          const lostPoints = p.stepsMoved || 0;
          p.position = -1;
          p.stepsMoved = 0;
          p.isHome = false;
          player.score -= lostPoints;
          movingPlayer.score += lostPoints;
        }
      });
    }
  });
};

const getEligiblePawns = (player: Player, dice: number, gameData: GameData): number[] => {
  return player.pawns
    .map((pawn, idx) => ({ pawn, idx }))
    .filter(({ pawn }) => {
      if (pawn.isHome) return false;
      if (pawn.position === -1) return dice === 6;
      
      if (pawn.position >= 52) {
        // In home path
        const homePath = homePaths[player.color.toLowerCase()];
        const currentIndex = homePath.indexOf(pawn.position);
        return currentIndex + dice < homePath.length;
      }
      
      // On main board
      const stepsToHomeEntry = (homeEntry[player.color.toLowerCase()] - pawn.position + 52) % 52;
      return dice <= stepsToHomeEntry;
    })
    .map(({ idx }) => idx);
};

const movePawn = (gameData: GameData, playerId: number, pawnIndex: number, dice: number): GameData => {
  const player = gameData.players[playerId];
  const pawn = player.pawns[pawnIndex];
  if (pawn.isHome) return gameData;

  let pawnOpened = false;

  if (pawn.position === -1 && dice === 6) {
    pawn.position = startingPositions[player.color.toLowerCase()];
    pawnOpened = true;
  } else if (pawn.position >= 52) {
    // Moving in home path
    const homePath = homePaths[player.color.toLowerCase()];
    const currentIndex = homePath.indexOf(pawn.position);
    if (currentIndex + dice < homePath.length) {
      pawn.position = homePath[currentIndex + dice];
      pawn.stepsMoved += dice;
      if (currentIndex + dice === homePath.length - 1) {
        pawn.isHome = true;
        player.score += 50;
      }
    }
  } else {
    // Moving on main board
    const stepsToHomeEntry = (homeEntry[player.color.toLowerCase()] - pawn.position + 52) % 52;
    
    if (dice > stepsToHomeEntry) {
      // Can't move exact steps to home entry
      pawn.position = (pawn.position + dice) % 52;
      pawn.stepsMoved += dice;
    } else if (dice === stepsToHomeEntry) {
      // Enter home path
      const homePath = homePaths[player.color.toLowerCase()];
      pawn.position = homePath[0];
      pawn.stepsMoved += dice;
    } else {
      // Normal move
      pawn.position = (pawn.position + dice) % 52;
      pawn.stepsMoved += dice;
    }
  }

  if (pawn.position < 52) {
    handleCut(gameData, player, pawn.position);
  }

  player.score = player.pawns.reduce((sum, p) => sum + (p.stepsMoved || 0) + (p.isHome ? 50 : 0), 0);
  return gameData;
};

const nextTurn = (gameData: GameData, dice: number, pawnOpened?: boolean): GameData => {
  if (dice === 6 && pawnOpened) return gameData;
  gameData.currentTurn = (gameData.currentTurn + 1) % gameData.players.length;
  return gameData;
};

// Matrix3x3
const Matrix3x3: React.FC<{ color?: string }> = ({ color = "#ffff99" }) => {
  const cellSize = 40;
  return (
    <div
      style={{
        width: cellSize * 3,
        height: cellSize * 3,
        backgroundColor: color,
        border: "3px solid black",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
      }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          style={{
            border: "1px solid black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      ))}
    </div>
  );
};

// Matrix6x6
const Matrix6x6: React.FC<{
  borderColor?: string;
  blockColor?: string;
  pathPawns?: (string | null)[][];
  homeAreaPawns?: (string | null)[][];
}> = ({ borderColor = "black", blockColor = "#cce5ff", pathPawns, homeAreaPawns }) => {
  const cellSize = 40;
  return (
    <div style={{ width: cellSize * 6, height: cellSize * 6, border: `3px solid ${borderColor}`, position: "relative" }}>
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => {
          const pathPawn = pathPawns && pathPawns[row] ? pathPawns[row][col] : null;
          const homePawn = homeAreaPawns && homeAreaPawns[row] ? homeAreaPawns[row][col] : null;
          const isHomeArea = row >= 1 && row <= 4 && col >= 1 && col <= 4;
          return (
            <div
              key={`${row}-${col}`}
              style={{
                position: "absolute",
                top: row * cellSize,
                left: col * cellSize,
                width: cellSize,
                height: cellSize,
                backgroundColor: isHomeArea ? blockColor : "transparent",
                border: isHomeArea ? "1px solid #ccc" : "1px solid transparent",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {pathPawn && <PawnIcon size={30} color={pathPawn} />}
              {homePawn && <PawnIcon size={25} color={homePawn} />}
            </div>
          );
        })
      )}
    </div>
  );
};

// UMatrix6x3
const UMatrix6x3: React.FC<{ 
  startNum?: number; 
  rotation?: number; 
  middleColor?: string; 
  pathPawns?: (string | null)[][];
  homePathPawns?: (string | null)[][];
}> = ({
  startNum = 1,
  rotation = 0,
  middleColor = "#eeeeee",
  pathPawns,
  homePathPawns
}) => {
  const matrix: number[][] = Array.from({ length: 6 }, () => Array(3).fill(0));
  let num = startNum;
  for (let i = 0; i < 6; i++) matrix[i][2] = num++;
  for (let j = 1; j >= 0; j--) matrix[5][j] = num++;
  for (let i = 4; i >= 0; i--) matrix[i][0] = num++;
  
  return (
    <div style={{ transform: `rotate(${rotation}deg)`, display: "inline-block" }}>
      {matrix.map((row, i) => (
        <div key={i} style={{ display: "flex" }}>
          {row.map((cell, j) => (
            <div
              key={j}
              style={{
                width: 40,
                height: 40,
                border: "1px solid black",
                backgroundColor: j === 1 ? middleColor : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "12px",
                position: "relative",
              }}
            >
              {pathPawns && pathPawns[i] && pathPawns[i][j] ? (
                <PawnIcon size={28} color={pathPawns[i][j]!} />
              ) : (
                cell || ""
              )}
              {/* Home path pawns in middle column */}
              {homePathPawns && j === 1 && homePathPawns[i] && homePathPawns[i][0] && (
                <div style={{ position: "absolute", top: 5, left: 5 }}>
                  <PawnIcon size={20} color={homePathPawns[i][0]!} />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Dice Roller
const DiceRoller: React.FC<{ currentPlayer: Player; gameData: GameData; updateGame: (game: GameData) => void }> = ({
  currentPlayer,
  gameData,
  updateGame,
}) => {
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [awaitingMove, setAwaitingMove] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  const handleRoll = () => {
    if (rolling || awaitingMove || actionInProgress) return;
    setRolling(true);
    let count = 0;
    const rollInterval = setInterval(() => {
      const temp = rollDice();
      setDiceValue(temp);
      count++;
      if (count >= 10) {
        clearInterval(rollInterval);
        finalizeRoll(temp);
      }
    }, 50);
  };

  const finalizeRoll = (dice: number) => {
    setRolling(false);
    let eligible = getEligiblePawns(currentPlayer, dice, gameData);
    
    if (dice === 6) {
      const hasPawnAtHome = currentPlayer.pawns.some((p) => p.position === -1);
      if (hasPawnAtHome) {
        eligible = currentPlayer.pawns
          .map((p, idx) => ({ pawn: p, idx }))
          .filter(({ pawn, idx }) => pawn.position === -1 || eligible.includes(idx))
          .map(({ idx }) => idx);
      }
    }
    
    if (eligible.length === 0) {
      setActionInProgress(true);
      setTimeout(() => {
        const newGame = nextTurn({ ...gameData }, dice);
        updateGame(newGame);
        setDiceValue(null);
        setActionInProgress(false);
      }, 1000);
      return;
    }
    
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
      }, 1000);
      return;
    }
    
    setAwaitingMove(true);
  };

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
    }, 1000);
  };

  return (
    <div style={{ margin: "20px 0" }}>
      <div style={{ marginBottom: "10px", fontWeight: "bold", color: currentPlayer.color }}>
        Current Turn: {currentPlayer.name.toUpperCase()}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button 
          onClick={handleRoll} 
          disabled={rolling || awaitingMove || actionInProgress}
          style={{
            padding: "10px 20px",
            backgroundColor: currentPlayer.color,
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          {rolling ? "Rolling..." : "Roll Dice"}
        </button>
        <div style={{ 
          width: 60, 
          height: 60, 
          border: "3px solid black", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          fontSize: 30,
          backgroundColor: "white"
        }}>
          {diceValue ?? "-"}
        </div>
      </div>
      {awaitingMove && (
        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          {currentPlayer.pawns.map((pawn, idx) => (
            <button 
              key={idx} 
              onClick={() => handlePawnClick(idx)} 
              disabled={!getEligiblePawns(currentPlayer, diceValue ?? 0, gameData).includes(idx)}
              style={{
                padding: "8px 12px",
                backgroundColor: currentPlayer.color,
                color: "white",
                border: "none",
                borderRadius: "3px",
                opacity: getEligiblePawns(currentPlayer, diceValue ?? 0, gameData).includes(idx) ? 1 : 0.4,
                cursor: getEligiblePawns(currentPlayer, diceValue ?? 0, gameData).includes(idx) ? "pointer" : "not-allowed"
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

// Fixed position mapping for all 52 positions
const getPositionMapping = () => {
  const mapping: Record<number, { section: string; row: number; col: number }> = {};

  // Bottom UMatrix (Green) - positions 0-12
  for (let i = 0; i < 6; i++) mapping[i] = { section: "bottom", row: 5, col: 2 - (i % 3) };
  mapping[6] = { section: "bottom", row: 4, col: 0 };
  mapping[7] = { section: "bottom", row: 3, col: 0 };
  mapping[8] = { section: "bottom", row: 2, col: 0 };
  mapping[9] = { section: "bottom", row: 1, col: 0 };
  mapping[10] = { section: "bottom", row: 0, col: 0 };
  mapping[11] = { section: "bottom", row: 0, col: 1 };
  mapping[12] = { section: "bottom", row: 0, col: 2 };

  // Left UMatrix (Red) - positions 13-25
  for (let i = 0; i < 6; i++) mapping[13 + i] = { section: "left", row: i, col: 0 };
  mapping[19] = { section: "left", row: 5, col: 1 };
  mapping[20] = { section: "left", row: 5, col: 2 };
  mapping[21] = { section: "left", row: 4, col: 2 };
  mapping[22] = { section: "left", row: 3, col: 2 };
  mapping[23] = { section: "left", row: 2, col: 2 };
  mapping[24] = { section: "left", row: 1, col: 2 };
  mapping[25] = { section: "left", row: 0, col: 2 };

  // Top UMatrix (Blue) - positions 26-38
  for (let i = 0; i < 6; i++) mapping[26 + i] = { section: "top", row: 0, col: i % 3 };
  mapping[32] = { section: "top", row: 1, col: 2 };
  mapping[33] = { section: "top", row: 2, col: 2 };
  mapping[34] = { section: "top", row: 3, col: 2 };
  mapping[35] = { section: "top", row: 4, col: 2 };
  mapping[36] = { section: "top", row: 5, col: 2 };
  mapping[37] = { section: "top", row: 5, col: 1 };
  mapping[38] = { section: "top", row: 5, col: 0 };

  // Right UMatrix (Yellow) - positions 39-51
  for (let i = 0; i < 6; i++) mapping[39 + i] = { section: "right", row: 5 - i, col: 2 };
  mapping[45] = { section: "right", row: 0, col: 1 };
  mapping[46] = { section: "right", row: 0, col: 0 };
  mapping[47] = { section: "right", row: 1, col: 0 };
  mapping[48] = { section: "right", row: 2, col: 0 };
  mapping[49] = { section: "right", row: 3, col: 0 };
  mapping[50] = { section: "right", row: 4, col: 0 };
  mapping[51] = { section: "right", row: 5, col: 0 };

  return mapping;
};

// Generate board pawns
const generateBoardPawns = (gameData: GameData) => {
  const positions = getPositionMapping();

  const redCorner: (string | null)[][] = Array.from({ length: 6 }, () => Array(6).fill(null));
  const blueCorner: (string | null)[][] = Array.from({ length: 6 }, () => Array(6).fill(null));
  const greenCorner: (string | null)[][] = Array.from({ length: 6 }, () => Array(6).fill(null));
  const yellowCorner: (string | null)[][] = Array.from({ length: 6 }, () => Array(6).fill(null));

  const topStrip: (string | null)[][] = Array.from({ length: 6 }, () => Array(3).fill(null));
  const rightStrip: (string | null)[][] = Array.from({ length: 6 }, () => Array(3).fill(null));
  const bottomStrip: (string | null)[][] = Array.from({ length: 6 }, () => Array(3).fill(null));
  const leftStrip: (string | null)[][] = Array.from({ length: 6 }, () => Array(3).fill(null));

  // Home paths
  const greenHomePath: (string | null)[][] = Array.from({ length: 6 }, () => Array(1).fill(null));
  const redHomePath: (string | null)[][] = Array.from({ length: 6 }, () => Array(1).fill(null));
  const blueHomePath: (string | null)[][] = Array.from({ length: 6 }, () => Array(1).fill(null));
  const yellowHomePath: (string | null)[][] = Array.from({ length: 6 }, () => Array(1).fill(null));

  gameData.players.forEach((player) => {
    player.pawns.forEach((pawn) => {
      if (pawn.position === -1) {
        // In home base
        const homePositions = [
          { row: 2, col: 2 }, { row: 2, col: 3 }, 
          { row: 3, col: 2 }, { row: 3, col: 3 }
        ];
        const homePos = homePositions[pawn.id];
        if (player.color === "green") greenCorner[homePos.row][homePos.col] = player.color;
        else if (player.color === "red") redCorner[homePos.row][homePos.col] = player.color;
        else if (player.color === "blue") blueCorner[homePos.row][homePos.col] = player.color;
        else if (player.color === "yellow") yellowCorner[homePos.row][homePos.col] = player.color;
      } else if (pawn.position >= 52) {
        // In home path
        const homePathIndex = pawn.position - 52;
        if (player.color === "green") greenHomePath[homePathIndex][0] = player.color;
        else if (player.color === "red") redHomePath[homePathIndex][0] = player.color;
        else if (player.color === "blue") blueHomePath[homePathIndex][0] = player.color;
        else if (player.color === "yellow") yellowHomePath[homePathIndex][0] = player.color;
      } else if (pawn.position >= 0 && pawn.position < 52) {
        // On main board
        const posInfo = positions[pawn.position];
        if (!posInfo) return;
        
        if (posInfo.section === "top") topStrip[posInfo.row][posInfo.col] = player.color;
        else if (posInfo.section === "right") rightStrip[posInfo.row][posInfo.col] = player.color;
        else if (posInfo.section === "bottom") bottomStrip[posInfo.row][posInfo.col] = player.color;
        else if (posInfo.section === "left") leftStrip[posInfo.row][posInfo.col] = player.color;
      }
    });
  });

  return {
    corners: { redCorner, blueCorner, greenCorner, yellowCorner },
    strips: { topStrip, rightStrip, bottomStrip, leftStrip },
    homePaths: { greenHomePath, redHomePath, blueHomePath, yellowHomePath }
  };
};

// Main LudoBoard
const LudoBoard: React.FC = () => {
  const [gameData, setGameData] = useState<GameData>({
    players: [
      { id: 0, name: "Green", color: "green", pawns: Array.from({ length: 4 }, (_, i) => ({ id: i, position: -1, isHome: false, stepsMoved: 0 })), score: 0 },
      { id: 1, name: "Red", color: "red", pawns: Array.from({ length: 4 }, (_, i) => ({ id: i, position: -1, isHome: false, stepsMoved: 0 })), score: 0 },
      { id: 2, name: "Blue", color: "blue", pawns: Array.from({ length: 4 }, (_, i) => ({ id: i, position: -1, isHome: false, stepsMoved: 0 })), score: 0 },
      { id: 3, name: "Yellow", color: "yellow", pawns: Array.from({ length: 4 }, (_, i) => ({ id: i, position: -1, isHome: false, stepsMoved: 0 })), score: 0 },
    ],
    currentTurn: 0,
  });

  const { corners, strips, homePaths } = generateBoardPawns(gameData);
  const currentPlayer = gameData.players[gameData.currentTurn];

  return (
    <div style={{ padding: 20, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>Ludo Game</h1>
      
      {/* Game Stats */}
      <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 20 }}>
        {gameData.players.map(player => (
          <div key={player.id} style={{ 
            padding: 10, 
            backgroundColor: player.color, 
            color: "white", 
            borderRadius: 5,
            border: gameData.currentTurn === player.id ? "3px solid #333" : "1px solid #ccc"
          }}>
            <div style={{ fontWeight: "bold" }}>{player.name}</div>
            <div>Score: {player.score}</div>
            <div>Home: {player.pawns.filter(p => p.isHome).length}/4</div>
          </div>
        ))}
      </div>

      {/* Ludo Board */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Top Row: Red | Top UMatrix | Blue */}
        <div style={{ display: "flex", gap: 4 }}>
          <Matrix6x6 blockColor="#ffcdd2" pathPawns={corners.redCorner} />
          <div style={{ margin: "0 10px" }}>
            <UMatrix6x3 
              startNum={26} 
              rotation={180} 
              middleColor="#ffe5e5"
              pathPawns={strips.topStrip}
              homePathPawns={homePaths.blueHomePath}
            />
          </div>
          <Matrix6x6 blockColor="#bbdefb" pathPawns={corners.blueCorner} />
        </div>

        {/* Middle Row: Left UMatrix | Center | Right UMatrix */}
        <div style={{ display: "flex", gap: 4, marginTop: 15 }}>
          <div style={{ margin: "0 16px" }}>
            <UMatrix6x3 
              startNum={13} 
              rotation={90} 
              middleColor="#e5e5ff"
              pathPawns={strips.leftStrip}
              homePathPawns={homePaths.redHomePath}
            />
          </div>
          <div style={{ margin: "15px 14px" }}>
            <Matrix3x3 color="#ffff99" />
          </div>
          <div style={{ marginLeft: 15 }}>
            <UMatrix6x3 
              startNum={39} 
              rotation={-90} 
              middleColor="#e5ffe5"
              pathPawns={strips.rightStrip}
              homePathPawns={homePaths.yellowHomePath}
            />
          </div>
        </div>

        {/* Bottom Row: Green | Bottom UMatrix | Yellow */}
        <div style={{ display: "flex", gap: 4, marginTop: 15 }}>
          <Matrix6x6 blockColor="#c8e6c9" pathPawns={corners.greenCorner} />
          <div style={{ margin: "0 10px" }}>
            <UMatrix6x3 
              startNum={1} 
              rotation={0} 
              middleColor="#fff4cc"
              pathPawns={strips.bottomStrip}
              homePathPawns={homePaths.greenHomePath}
            />
          </div>
          <Matrix6x6 blockColor="#fff9c4" pathPawns={corners.yellowCorner} />
        </div>
      </div>

      {/* Dice Roller */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <DiceRoller currentPlayer={currentPlayer} gameData={gameData} updateGame={setGameData} />
      </div>
    </div>
  );
};

export default LudoBoard;