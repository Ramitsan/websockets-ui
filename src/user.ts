import { WebSocket } from 'ws';
export class User {
  name: string;
  password: string;
  connection: WebSocket;
  wins: number;

  constructor(name: string, password: string) {
    this.name = name;
    this.password = password;
    this.wins = 0;
  }

  send(data: string) {
    this.connection.send(data);
  }
  updateConnection(connection: WebSocket) {
    this.connection = connection;
  }
}