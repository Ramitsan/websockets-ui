import { WebSocket, WebSocketServer } from 'ws';
import { Game, Player } from './game';

const wss = new WebSocketServer({ port: 3000 });
const messages: Array<string> = [];

interface IRegRequest {
  name: string,
  password: string,
}

interface IRegResponce {
  name: string,
  index: number,
  error: boolean,
  errorText: string,
}

interface IServerMessage<T> {
  type: string,
  data: T,
  id: number
}

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

const games: Array<Game> = [];
const users: Array<User> = [];
const sendGames = (ws: WebSocket) => {
  const result = {
    type: "update_room",
    data: JSON.stringify(
      games.map((_game, gameIndex) => {
        return {
          roomId: gameIndex,
          roomUsers: _game.players.map((player, playerIndex) => ({
            name: player.user.name,
            index: playerIndex
          }))
        }
      }))};
      console.log(result);

  ws.send(JSON.stringify(result
  ))}

const handlers = {
  reg: async (_data: string, ws: WebSocket) => {
    const data: IRegRequest = JSON.parse(_data);
    console.log(data);

    const userRegIndex = users.findIndex(it => it.name == data.name);
    const userReg = users[userRegIndex];
    if (!userReg) {
      const user = new User(data.name, data.password);
      console.log(user);
      user.updateConnection(ws);
      users.push(user);
      const result: IRegResponce = {
        name: data.name,
        index: users.length - 1,
        error: false,
        errorText: ''
      }
      sendGames(ws);
      return result;
    } else if (userReg.password == data.password) {
      userReg.updateConnection(ws);
      const result: IRegResponce = {
        name: data.name,
        index: userRegIndex,
        error: false,
        errorText: ''
      }
      sendGames(ws);
      return result;
    } else {
      const result: IRegResponce = {
        name: data.name,
        index: -1,
        error: true,
        errorText: 'Invalid password'
      }
      return result;
    }
  },

  create_room: async (data: '', ws: WebSocket) => {
    console.log(data);
    const userIndex = users.findIndex(it => it.connection == ws);
    const user = users[userIndex];
    if(!user) return;

    const game = new Game();
    game.players.push(new Player(user));
    games.push(game);
    wss.clients.forEach(it => {
      it.send(JSON.stringify({
        type: "update_room",
        data: JSON.stringify(
          games.map((_game, gameIndex) => {
            return {
              roomId: gameIndex,
              roomUsers: _game.players.map((player, playerIndex) => ({
                name: player.user.name,
                index: playerIndex
              }))
            }
          })
          // [
          // {
          //   roomId: games.length - 1,
          //   roomUsers:
          //     [
          //       {
          //         name: user.name,
          //         index: userIndex,
          //       }
          //     ],
          // },
        // ]
        ),
        id: 0,
      }));
    })
  },

  add_user_to_room: async (_data: any, ws: WebSocket) => {
    const data = JSON.parse(_data);
    console.log(data);
    const userIndex = users.findIndex(it => it.connection == ws);
    const user = users[userIndex];
    
    const game = games[data.indexRoom];
    game.players.push(new Player(user));
    game.players.forEach((it, index) => {
      it.send(JSON.stringify({
        type: "create_game", //send for both players in the room
        data: JSON.stringify(
          {
            idGame: data.indexRoom,
            idPlayer: index,
          }),
        id: 0,
      }));
    })
  },

  add_ships: async (_data: string) => {
    const data: {
      gameId: number,
      indexPlayer: number,
      ships: any
    } = JSON.parse(_data);

    games[data.gameId].players[data.indexPlayer].addShips(data.ships);
    if (games[data.gameId].players[0].ships && games[data.gameId].players[1].ships) {
      wss.clients.forEach(it => {
        it.send(JSON.stringify({
          type: "start_game",
          data: JSON.stringify(
            {

            }),
          id: 0,
        }));
      })
    }
  },

  attack: async (_data: string) => {
    const data: {
      gameId: number,
      x: number,
      y: number,
      indexPlayer: number, /* id of the player in the current game */
    } = JSON.parse(_data);

    const game = games[data.gameId];
    const status = game.attack({
      x: data.x,
      y: data.y
    }, data.indexPlayer);

    wss.clients.forEach(it => {
      it.send(JSON.stringify({
        type: "attack",
        data: JSON.stringify(
          {
            position:
            {
              x: data.x,
              y: data.y,
            },
            currentPlayer: (data.indexPlayer + 1) % 2, /* id of the player in the current game */
            status: status,
          }),
        id: 0,
      }));
    })
  }
}

wss.on('connection', (ws) => {
  ws.on('error', console.error);

  ws.on('message', async (data) => {
    console.log('received: %s', data);
    try {
      const parsedData: IServerMessage<any> = JSON.parse(data.toString());
      const handler = handlers[parsedData.type as keyof typeof handlers];
      if (handler) {
        const result = await handler(parsedData.data, ws);
        const response: IServerMessage<string> = {
          type: parsedData.type,
          id: parsedData.id,
          data: JSON.stringify(result)
        }
        ws.send(JSON.stringify(response))
      } else {
        console.log('unknown request type');
      }
    }
    catch (err) {
      console.log('server error', err);
    }
    // messages.push(data.toString());
    // wss.clients.forEach(it => {
    //   it.send(JSON.stringify(messages));
    // })
    // ws.send(JSON.stringify('ok'));
  });

  ws.send(JSON.stringify(messages));
});