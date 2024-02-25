import { Player } from './player';
import { Ship } from './ship';
export class Game {
  players: Array<Player> = [];
  currentPlayerIndex: number = 0;

  constructor() { }
  attack(position: {x: number, y: number}, playerIndex: number): {status: string, ship: Ship} {   
    const enemy = this.players[(playerIndex + 1) % 2];
    for (let i = 0; i < enemy.ships.length; i++) {
      const ship = enemy.ships[i];
      const attackResult = ship.attack(position);
      if (attackResult !== 'miss') {
        return { status: attackResult, ship};
      } 
    }
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 2;
    return {
      status: 'miss',
      ship: null
    };   
  }

  checkWin() {
    if(this.players[0].checkWin()) {
      return 1;
    } else if(this.players[1].checkWin()) {
      return 0;
    } else {
      return null;
    }
  }
}
