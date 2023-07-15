import { User } from './index';

interface IShip {
    position: {
        x: number,
        y: number,
    },
    direction: boolean,
    length: number,
    type: "small"|"medium"|"large"|"huge",
}

export class Player {
  ships: Array<Ship>;
  user: User;

  constructor(user: User) {
    this.user = user;
  }

  addShips(data: Array<IShip>) {
    this.ships = data.map(it => new Ship(it));
  }

  send(data: string) {
    this.user.send(data);
  }

  checkWin() {
    return !this.ships.find(it => it.state.find(jt => jt == false) != null);    
  }
}

export class Ship {
  data: IShip;
  state: Array<boolean>;

  constructor(data: IShip) {
    this.data = data;
    this.state = new Array(data.length).fill(false);
  }

  attack(position: {x: number, y: number}): "miss"|"killed"|"shot" {
    for (let i = 0; i < this.data.length; i++) {
      const xk = !this.data.direction ? 1 : 0; 
      const yk = this.data.direction ? 1 : 0; 
      if (this.data.position.x + i * xk == position.x && this.data.position.y + i * yk == position.y /*&& this.state[i] == false*/) {
        this.state[i] = true;
        if(this.state.find(it => it == false)) {
          return 'shot';
        }
        else {
          return 'killed';
        }
      }      
    }
    return 'miss';
  }
}

export class Game {
  players: Array<Player> = [];
  currentPlayerIndex: number = 0;

  constructor() { }
  attack(position: {x: number, y: number}, playerIndex: number) {
   
    const enemy = this.players[(playerIndex + 1) % 2];
    for (let i = 0; i < enemy.ships.length; i++) {
      const ship = enemy.ships[i];
      const attackResult = ship.attack(position);
      if (attackResult !== 'miss') {
        return attackResult;
      } 
    }
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 2;
    return 'miss';   
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
