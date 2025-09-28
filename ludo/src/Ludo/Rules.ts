// Rules.ts
export interface Pawn {
    id: number;
    position: number; // -1 = base/home, 0-51 = board, 100+ = home stretch
    isHome: boolean;
    stepsMoved: number;
  }
  
  export interface Player {
    id: number;
    name: string;
    color: string;
    pawns: Pawn[];
    score: number;
  }
  
  export interface GameData {
    players: Player[];
    currentTurn: number; // index of current player
  }
  
  export const rollDice = (): number => Math.floor(Math.random() * 6) + 1;
  
  // Starting positions for each color
  const startingPositions: Record<string, number> = {
    red: 0,
    green: 13,
    yellow: 26,
    blue: 39
  };
  
  // Home entry positions
  const homeEntry: Record<string, number> = {
    red: 51,
    green: 12,
    yellow: 25,
    blue: 38
  };
  
  // Get eligible pawns that can move given a dice
  export const getEligiblePawns = (player: Player, dice: number, gameData: GameData): number[] => {
    return player.pawns
      .map((pawn, idx) => ({ pawn, idx }))
      .filter(({ pawn, idx }) => {
        // Pawn is already home
        if (pawn.isHome) return false;
  
        // Pawn is at base, needs 6 to open
        if (pawn.position === -1) return dice === 6;
  
        // Calculate steps to reach home
        const stepsToHome = (homeEntry[player.color.toLowerCase()] - pawn.position + 52) % 52;
        return dice <= stepsToHome;
      })
      .map(({ idx }) => idx);
  };
  
  // Move pawn according to dice
  export const movePawn = (gameData: GameData, playerId: number, pawnIndex: number, dice: number): GameData => {
    const player = gameData.players[playerId];
    const pawn = player.pawns[pawnIndex];
  
    if (pawn.isHome) return gameData;
  
    // Open pawn from base if dice = 6
    if (pawn.position === -1 && dice === 6) {
      pawn.position = startingPositions[player.color.toLowerCase()];
    } else {
      const stepsToHome = (homeEntry[player.color.toLowerCase()] - pawn.position + 52) % 52;
  
      if (dice > stepsToHome) return gameData; // cannot overshoot
  
      if (dice === stepsToHome) {
        pawn.position = 100 + pawn.id; // home stretch
        pawn.isHome = true;
      } else {
        pawn.position = (pawn.position + dice) % 52;
      }
    }
  
    // Update steps moved
    pawn.stepsMoved = (pawn.stepsMoved || 0) + dice;
  
    // Update player score (sum of stepsMoved of all pawns)
    player.score = player.pawns.reduce((sum, p) => sum + (p.stepsMoved || 0), 0);
  
    return gameData;
  };
  
  // Next turn logic
  export const nextTurn = (gameData: GameData, dice: number, pawnOpened?: boolean): GameData => {
    // Only re-roll if a pawn was opened from home with 6
    if (dice === 6 && pawnOpened) return gameData;
  
    gameData.currentTurn = (gameData.currentTurn + 1) % gameData.players.length;
    return gameData;
  };
  