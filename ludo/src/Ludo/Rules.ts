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
    currentTurn: number;
  }
  const SAFE_POSITIONS: number[] = [0, 8, 13, 21, 26, 34, 39, 47]; 
  export const rollDice = (): number => Math.floor(Math.random() * 6) + 1;
  
  const startingPositions: Record<string, number> = { red: 0, green: 13, yellow: 26, blue: 39 };
  const homeEntry: Record<string, number> = { red: 51, green: 12, yellow: 25, blue: 38 };
  
  // Check for collision and cut pawn
  const handleCut = (gameData: GameData, movingPlayer: Player, pawnPos: number) => {
    // If the position is safe, no cut
    if (SAFE_POSITIONS.includes(pawnPos)) return;
  
    gameData.players.forEach(player => {
      if (player.id !== movingPlayer.id) {
        player.pawns.forEach(p => {
          if (!p.isHome && p.position === pawnPos) {
            // Cut happens
            const lostPoints = p.stepsMoved || 0;
            p.position = -1;
            p.stepsMoved = 0;
            p.isHome = false;
  
            // Update scores
            player.score -= lostPoints;
            movingPlayer.score += lostPoints;
          }
        });
      }
    });
  };
  
  
  // Get eligible pawns
  export const getEligiblePawns = (player: Player, dice: number, gameData: GameData): number[] => {
    return player.pawns
      .map((pawn, idx) => ({ pawn, idx }))
      .filter(({ pawn, idx }) => {
        if (pawn.isHome) return false;
        if (pawn.position === -1) return dice === 6;
  
        const stepsToHome = (homeEntry[player.color.toLowerCase()] - pawn.position + 52) % 52;
        return dice <= stepsToHome;
      })
      .map(({ idx }) => idx);
  };
  
  // Move pawn
  export const movePawn = (gameData: GameData, playerId: number, pawnIndex: number, dice: number): GameData => {
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
        player.score += 50; // bonus for reaching home
      } else {
        pawn.position = (pawn.position + dice) % 52;
        pawn.stepsMoved += dice;
      }
    }
  
    // Handle cutting other pawns
    handleCut(gameData, player, pawn.position);
  
    // Update score (sum of stepsMoved + bonuses)
    player.score = player.pawns.reduce((sum, p) => sum + (p.stepsMoved || 0) + (p.isHome ? 50 : 0), 0);
  
    return gameData;
  };
  
  // Next turn logic
  export const nextTurn = (gameData: GameData, dice: number, pawnOpened?: boolean): GameData => {
    if (dice === 6 && pawnOpened) return gameData;
    gameData.currentTurn = (gameData.currentTurn + 1) % gameData.players.length;
    return gameData;
  };
  