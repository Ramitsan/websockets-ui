export class User {
  name: string;
  password: string;
  connection: WebSocket;

  constructor(name: string, password: string) {
    this.name = name;
    this.password = password;
  }

  send(data: string) {
    this.connection.send(data);
  }
  updateConnection(connection: WebSocket) {
    this.connection = connection;
  }
}