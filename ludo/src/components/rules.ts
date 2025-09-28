// src/Rules.ts
export interface Pawn {
    id: number;
    position: number; // -1 = base/home, 0-51 = board, 100+ = home column
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
  
  export const SAFE_POSITIONS: number[] = [0, 8, 13, 21, 26, 34, 39, 47];
  
  export const rollDice = (): number => Math.floor(Math.random() * 6) + 1;
  
  export const startingPositions: Record<string, number> = {
    green: 9,
    red: 21,
    blue: 34,
    yellow: 47,
  };
  
  export const homeEntry: Record<string, number> = {
    green: 8,
    red: 20,
    blue: 33,
    yellow: 46,
  };
  
  // Handle collision and cutting pawn
  export const handleCut = (gameData: GameData, movingPlayer: Player, pawnPos: number) => {
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
  
  // Get eligible pawns for current dice roll
  export const getEligiblePawns = (player: Player, dice: number, gameData: GameData): number[] => {
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
  export const nextTurn = (gameData: GameData, dice: number, pawnOpened?: boolean): GameData => {
    if (dice === 6 && pawnOpened) return gameData;
    gameData.currentTurn = (gameData.currentTurn + 1) % gameData.players.length;
    return gameData;
  };
  