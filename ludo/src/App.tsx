import React, { useState, useEffect } from "react";

// PawnIcon Component
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

// Rules and Types
interface Pawn {
  id: number;
  position: number; // -1 = base/home, 1-51 = board, 100+ = home column
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

const SAFE_POSITIONS: number[] = [0, 8, 13, 21, 26, 34, 39, 47];

const rollDice = (): number => Math.floor(Math.random() * 6) + 1;

// Updated starting positions
const startingPositions: Record<string, number> = {
  green: 9,
  red: 21,
  blue: 34,
  yellow: 47
};

// Updated home entry positions
const homeEntry: Record<string, number> = {
  green: 8,
  red: 20,
  blue: 33,
  yellow: 46
};

// Check for collision and cut pawn
const handleCut = (gameData: GameData, movingPlayer: Player, pawnPos: number) => {
  gameData.players.forEach(player => {
    if (player.id !== movingPlayer.id) {
      player.pawns.forEach(p => {
        if (!p.isHome && p.position === pawnPos) {
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

// Get eligible pawns
const getEligiblePawns = (player: Player, dice: number, gameData: GameData): number[] => {
  return player.pawns
    .map((pawn, idx) => ({ pawn, idx }))
    .filter(({ pawn }) => {
      if (pawn.isHome) return false;
      if (pawn.position === -1) return dice === 6;

      const stepsToHome = (homeEntry[player.color.toLowerCase()] - pawn.position + 52) % 52;
      return dice <= stepsToHome;
    })
    .map(({ idx }) => idx);
};

// Move pawn
const movePawn = (gameData: GameData, playerId: number, pawnIndex: number, dice: number): GameData => {
  const player = gameData.players[playerId];
  const pawn = player.pawns[pawnIndex];
  if (pawn.isHome) return gameData;

  let pawnOpened = false;

  if (pawn.position === -1 && dice === 6) {
    pawn.position = startingPositions[player.color.toLowerCase()];
    pawnOpened = true;
  } else {
    const stepsToHome = (homeEntry[player.color.toLowerCase()] - pawn.position + 52) % 52;
    if (dice > stepsToHome) return gameData;

    if (dice === stepsToHome) {
      pawn.position = 100 + pawn.id;
      pawn.isHome = true;
      pawn.stepsMoved += dice;
      player.score += 50;
    } else {
      pawn.position = (pawn.position + dice) % 52;
      pawn.stepsMoved += dice;
    }
  }

  handleCut(gameData, player, pawn.position);

  player.score = player.pawns.reduce((sum, p) => sum + (p.stepsMoved || 0) + (p.isHome ? 50 : 0), 0);
  return gameData;
};

// Next turn
const nextTurn = (gameData: GameData, dice: number, pawnOpened?: boolean): GameData => {
  if (dice === 6 && pawnOpened) return gameData;
  gameData.currentTurn = (gameData.currentTurn + 1) % gameData.players.length;
  return gameData;
};

// Matrix3x3 Component
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

// Matrix6x6 Component
interface Matrix6x6Props {
  borderColor?: string;
  blockColor?: string;
  pathPawns?: (string | null)[][];
  homeAreaPawns?: (string | null)[][];
}

const Matrix6x6: React.FC<Matrix6x6Props> = ({
  borderColor = "black",
  blockColor = "#cce5ff",
  pathPawns,
  homeAreaPawns,
}) => {
  const cellSize = 40;

  return (
    <div
      style={{
        width: cellSize * 6,
        height: cellSize * 6,
        border: `3px solid ${borderColor}`,
        position: "relative",
      }}
    >
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => {
          const pathPawn = pathPawns && pathPawns[row] ? pathPawns[row][col] : null;
          const homePawn = homeAreaPawns && homeAreaPawns[row] ? homeAreaPawns[row][col] : null;
          
          // Home area (center 4x4)
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

// UMatrix6x3 Component
interface UMatrix6x3Props {
  startNum?: number;
  rotation?: number;
  middleColor?: string;
  pathPawns?: (string | null)[][];
}

const UMatrix6x3: React.FC<UMatrix6x3Props> = ({
  startNum = 1,
  rotation = 0,
  middleColor = "#eeeeee",
  pathPawns,
}) => {
  const matrix: number[][] = Array.from({ length: 6 }, () => Array(3).fill(0));

  // Fill U-shape numbers
  let num = startNum;
  // Right column
  for (let i = 0; i < 6; i++) matrix[i][2] = num++;
  // Bottom row
  for (let j = 1; j >= 0; j--) matrix[5][j] = num++;
  // Left column excluding bottom
  for (let i = 4; i >= 0; i--) matrix[i][0] = num++;

  return (
    <div
      style={{ transform: `rotate(${rotation}deg)`, display: "inline-block" }}
    >
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
              }}
            >
              {pathPawns && pathPawns[i] && pathPawns[i][j] ? (
                <PawnIcon size={28} color={pathPawns[i][j]!} />
              ) : (
                cell || ""
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// DiceRoller Component
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

  const finalizeRoll = (dice: number) => {
    setRolling(false);
    let eligible = getEligiblePawns(currentPlayer, dice, gameData);

    if (dice === 6) {
      const hasPawnAtHome = currentPlayer.pawns.some(p => p.position === -1);
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
      }, 2000);
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
      }, 2000);
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
    }, 2000);
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
            fontSize: "16px",
            backgroundColor: currentPlayer.color,
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: rolling || awaitingMove || actionInProgress ? "not-allowed" : "pointer",
            opacity: rolling || awaitingMove || actionInProgress ? 0.6 : 1,
          }}
        >
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
            color: "black",
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
        <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
          {currentPlayer.pawns.map((pawn, idx) => (
            <button
              key={idx}
              onClick={() => handlePawnClick(idx)}
              disabled={!getEligiblePawns(currentPlayer, diceValue ?? 0, gameData).includes(idx)}
              style={{
                backgroundColor: currentPlayer.color,
                opacity: getEligiblePawns(currentPlayer, diceValue ?? 0, gameData).includes(idx) ? 1 : 0.4,
                color: "#fff",
                padding: "8px 12px",
                border: "none",
                borderRadius: "5px",
                cursor: getEligiblePawns(currentPlayer, diceValue ?? 0, gameData).includes(idx) ? "pointer" : "not-allowed",
                fontSize: "12px",
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

// Main Ludo Game Component
const LudoGame: React.FC = () => {
  const [gameData, setGameData] = useState<GameData>(() => {
    const players: Player[] = [
      {
        id: 0,
        name: "Green",
        color: "#4CAF50",
        pawns: Array.from({ length: 4 }, (_, i) => ({
          id: i,
          position: -1,
          isHome: false,
          stepsMoved: 0,
        })),
        score: 0,
      },
      {
        id: 1,
        name: "Red",
        color: "#F44336",
        pawns: Array.from({ length: 4 }, (_, i) => ({
          id: i,
          position: -1,
          isHome: false,
          stepsMoved: 0,
        })),
        score: 0,
      },
      {
        id: 2,
        name: "Blue",
        color: "#2196F3",
        pawns: Array.from({ length: 4 }, (_, i) => ({
          id: i,
          position: -1,
          isHome: false,
          stepsMoved: 0,
        })),
        score: 0,
      },
      {
        id: 3,
        name: "Yellow",
        color: "#FFEB3B",
        pawns: Array.from({ length: 4 }, (_, i) => ({
          id: i,
          position: -1,
          isHome: false,
          stepsMoved: 0,
        })),
        score: 0,
      },
    ];

    return {
      players,
      currentTurn: 0,
    };
  });

  // Fixed position mapping function
  const getPositionMapping = () => {
    const mapping: Record<number, { section: string; row: number; col: number }> = {};
    
    // Bottom strip (Green area) - positions 1-7
    for (let i = 0; i < 7; i++) {
      mapping[i + 1] = { section: 'bottom', row: 5, col: 2 - i };
    }
    
    // Left side of bottom UMatrix - positions 8-12
    mapping[8] = { section: 'bottom', row: 4, col: 0 };
    mapping[9] = { section: 'bottom', row: 3, col: 0 };
    mapping[10] = { section: 'bottom', row: 2, col: 0 };
    mapping[11] = { section: 'bottom', row: 1, col: 0 };
    mapping[12] = { section: 'bottom', row: 0, col: 0 };
    
    // Left strip - positions 13-18
    for (let i = 0; i < 6; i++) {
      mapping[13 + i] = { section: 'left', row: i, col: 0 };
    }
    
    // Top strip - positions 19-24  
    for (let i = 0; i < 6; i++) {
      mapping[19 + i] = { section: 'top', row: 0, col: i };
    }
    
    // Right strip - positions 25-30
    for (let i = 0; i < 6; i++) {
      mapping[25 + i] = { section: 'right', row: i, col: 2 };
    }
    
    // Bottom of right UMatrix - positions 31-35
    mapping[31] = { section: 'right', row: 5, col: 1 };
    mapping[32] = { section: 'right', row: 5, col: 0 };
    mapping[33] = { section: 'right', row: 4, col: 0 };
    mapping[34] = { section: 'right', row: 3, col: 0 };
    mapping[35] = { section: 'right', row: 2, col: 0 };
    
    // Top of right UMatrix - positions 36-38
    mapping[36] = { section: 'right', row: 1, col: 0 };
    mapping[37] = { section: 'right', row: 0, col: 0 };
    mapping[38] = { section: 'right', row: 0, col: 1 };
    
    // Top strip continuation - positions 39-44
    for (let i = 0; i < 6; i++) {
      mapping[39 + i] = { section: 'top', row: 5, col: i };
    }
    
    // Left strip continuation - positions 45-50
    for (let i = 0; i < 6; i++) {
      mapping[45 + i] = { section: 'left', row: 5 - i, col: 2 };
    }
    
    // Bottom strip completion - positions 51-52
    mapping[51] = { section: 'bottom', row: 0, col: 1 };
    mapping[52] = { section: 'bottom', row: 0, col: 2 };

    return mapping;
  };

  // Generate pawn positions for each board section
  const generateBoardPawns = () => {
    const positions = getPositionMapping();
    
    // Initialize empty boards for each section
    const redCorner: (string | null)[][] = Array.from({ length: 6 }, () => Array(6).fill(null));
    const blueCorner: (string | null)[][] = Array.from({ length: 6 }, () => Array(6).fill(null));
    const greenCorner: (string | null)[][] = Array.from({ length: 6 }, () => Array(6).fill(null));
    const yellowCorner: (string | null)[][] = Array.from({ length: 6 }, () => Array(6).fill(null));
    
    const topStrip: (string | null)[][] = Array.from({ length: 6 }, () => Array(3).fill(null));
    const rightStrip: (string | null)[][] = Array.from({ length: 6 }, () => Array(3).fill(null));
    const bottomStrip: (string | null)[][] = Array.from({ length: 6 }, () => Array(3).fill(null));
    const leftStrip: (string | null)[][] = Array.from({ length: 6 }, () => Array(3).fill(null));

    // Home areas for each corner
    const redHome: (string | null)[][] = Array.from({ length: 6 }, () => Array(6).fill(null));
    const blueHome: (string | null)[][] = Array.from({ length: 6 }, () => Array(6).fill(null));
    const greenHome: (string | null)[][] = Array.from({ length: 6 }, () => Array(6).fill(null));
    const yellowHome: (string | null)[][] = Array.from({ length: 6 }, () => Array(6).fill(null));

    // Place pawns based on their positions
    gameData.players.forEach(player => {
      player.pawns.forEach(pawn => {
        if (pawn.position === -1) {
          // Pawn is in base/home area
          const homePositions = [
            { row: 2, col: 2 }, { row: 2, col: 3 }, 
            { row: 3, col: 2 }, { row: 3, col: 3 }
          ];
          const homePos = homePositions[pawn.id];
          
          if (player.color === "#4CAF50") greenHome[homePos.row][homePos.col] = player.color;
          else if (player.color === "#F44336") redHome[homePos.row][homePos.col] = player.color;
          else if (player.color === "#2196F3") blueHome[homePos.row][homePos.col] = player.color;
          else if (player.color === "#FFEB3B") yellowHome[homePos.row][homePos.col] = player.color;
        } else if (pawn.position >= 100) {
          // Pawn is in winning area - handle if needed
        } else {
          // Pawn is on the board
          const posInfo = positions[pawn.position];
          if (posInfo) {
            const { section, row, col } = posInfo;
            
            if (section === 'bottom') {
              bottomStrip[row][col] = player.color;
            } else if (section === 'top') {
              topStrip[row][col] = player.color;
            } else if (section === 'left') {
              leftStrip[row][col] = player.color;
            } else if (section === 'right') {
              rightStrip[row][col] = player.color;
            }
          }
        }
      });
    });

    return {
      redCorner, blueCorner, greenCorner, yellowCorner,
      topStrip, rightStrip, bottomStrip, leftStrip,
      redHome, blueHome, greenHome, yellowHome
    };
  };

  const boardPawns = generateBoardPawns();
  const currentPlayer = gameData.players[gameData.currentTurn];

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Ludo Game</h1>
      
      {/* Game Stats */}
      <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
        {gameData.players.map(player => (
          <div 
            key={player.id} 
            style={{ 
              padding: "10px", 
              backgroundColor: player.color, 
              color: "white", 
              borderRadius: "5px",
              border: gameData.currentTurn === player.id ? "3px solid #333" : "1px solid #ccc",
            }}
          >
            <div style={{ fontWeight: "bold" }}>{player.name}</div>
            <div>Score: {player.score}</div>
            <div>Home: {player.pawns.filter(p => p.isHome).length}/4</div>
          </div>
        ))}
      </div>

      {/* Dice Roller */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <DiceRoller
          currentPlayer={currentPlayer}
          gameData={gameData}
          updateGame={setGameData}
        />
      </div>

      {/* Ludo Board */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>
        {/* First row: Red | Top UMatrix | Blue */}
        <div style={{ display: "flex", gap: 4 }}>
          <Matrix6x6 
            blockColor="#ffcdd2" 
            pathPawns={boardPawns.redCorner}
            homeAreaPawns={boardPawns.redHome}
          />
          <div style={{ margin: "0 10px" }}>
            <UMatrix6x3 
              startNum={26} 
              rotation={180} 
              middleColor="#ffe5e5"
              pathPawns={boardPawns.topStrip}
            />
          </div>
          <Matrix6x6 
            blockColor="#bbdefb" 
            pathPawns={boardPawns.blueCorner}
            homeAreaPawns={boardPawns.blueHome}
          />
        </div>

        {/* Second row: Left UMatrix | Center 3x3 | Right UMatrix */}
        <div style={{ display: "flex", gap: 4, marginTop: 15 }}>
          <div style={{ margin: "0 16px 0 16px" }}>
            <UMatrix6x3 
              startNum={13} 
              rotation={90} 
              middleColor="#e5e5ff"
              pathPawns={boardPawns.leftStrip}
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
              pathPawns={boardPawns.rightStrip}
            />
          </div>
        </div>

        {/* Third row: Green | Bottom UMatrix | Yellow */}
        <div style={{ display: "flex", gap: 4, marginTop: 15 }}>
          <Matrix6x6 
            blockColor="#c8e6c9" 
            pathPawns={boardPawns.greenCorner}
            homeAreaPawns={boardPawns.greenHome}
          />
          <div style={{ margin: "0 10px" }}>
            <UMatrix6x3 
              startNum={1} 
              rotation={0} 
              middleColor="#fff4cc"
              pathPawns={boardPawns.bottomStrip}
            />
          </div>
          <Matrix6x6 
            blockColor="#fff9c4" 
            pathPawns={boardPawns.yellowCorner}
            homeAreaPawns={boardPawns.yellowHome}
          />
        </div>
      </div>
    </div>
  );
};

export default LudoGame;