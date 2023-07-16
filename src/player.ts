import { User } from './user';
import { Ship } from './ship';
import { IShip } from './interfaces';

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