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
  ships: Array<IShip>;

}

export class Game {
  players: Array<Player> = [];
  currentPlayerIndex: number;

  constructor() {

  }
  attack() {

  }

}

