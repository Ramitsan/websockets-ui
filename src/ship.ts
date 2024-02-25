import { IShip } from './interfaces';

export const closest: Array<{x: number, y: number}> = [
  {x: -1, y: 0},
  {x: 1, y: 0},
  {x: 0, y: -1},
  {x: 0, y: 1},

  {x: -1, y: -1},
  {x: 1, y: 1},
  {x: 1, y: -1},
  {x: -1, y: 1},
]

export class Ship {
  data: IShip;
  state: Array<boolean>;

  constructor(data: IShip) {
    this.data = data;
    this.state = new Array(data.length).fill(false);
  }

  attack(position: { x: number, y: number }): "miss" | "killed" | "shot" {
    for (let i = 0; i < this.data.length; i++) {
      const xk = !this.data.direction ? 1 : 0;
      const yk = this.data.direction ? 1 : 0;
      if (this.data.position.x + i * xk == position.x && this.data.position.y + i * yk == position.y /*&& this.state[i] == false*/) {
        this.state[i] = true;
        const isKilled = this.state.findIndex(it => it == false) == -1;
        if (!isKilled) {
          return 'shot';
        }
        else {
          return 'killed';
        }
      }
    }
    return 'miss';
  }

  getClosest() {
    const result: Array<{x: number, y: number}> = [];
    const shipCells: Array<{x: number, y: number}> = [];
    for (let i = 0; i < this.data.length; i++) {
      const xk = !this.data.direction ? 1 : 0;
      const yk = this.data.direction ? 1 : 0;
      shipCells.push({
        x: this.data.position.x + i * xk,
        y: this.data.position.y + i * yk,
      })


      closest.forEach(it => {
        const pos = {
          x: this.data.position.x + i * xk + it.x,
          y: this.data.position.y + i * yk + it.y,
        }
        if(result.findIndex(jt => pos.x == jt.x && pos.y == jt.y) == -1) {
          result.push(pos);
        }        
      })
    }
    return result.filter(pos => {
      return shipCells.findIndex(jt => pos.x == jt.x && pos.y == jt.y) == -1;
    });
  }
}