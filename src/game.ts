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

  addShips(data: Array<IShip>) {
    this.ships = data.map(it => new Ship(it));
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
      const xk = this.data.direction ? 1 : 0; 
      const yk = !this.data.direction ? 1 : 0; 
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
  currentPlayerIndex: number;

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
    return 'miss';   
  }
}
