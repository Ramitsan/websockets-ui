import { WebSocket, WebSocketServer } from 'ws';
import { IRegRequest, IRegResponce, IServerMessage } from './interfaces';
import { Game } from './game';
import { User } from './user';
import { Player } from './player';

const wss = new WebSocketServer({ port: 3000 });
const messages: Array<string> = [];
const games: Array<Game> = [];
const users: Array<User> = [];

const sendGames = (ws: WebSocket) => {
  const result = {
    id: 0,
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
      }))
  };
  console.log(result);

  ws.send(JSON.stringify(result
  ))
}

const handlers = {
  reg: async (_data: string, ws: WebSocket) => {
    const data: IRegRequest = JSON.parse(_data);
    console.log(data);

    const userRegIndex = users.findIndex(it => it.name == data.name);
    const userReg = users[userRegIndex];
    if (!userReg) {
      const user = new User(data.name, data.password);
      user.updateConnection(ws);
      users.push(user);
      const result: IRegResponce = {
        name: data.name,
        index: users.length - 1,
        error: false,
        errorText: '',
      }
      sendGames(ws);
      return result;
    } else if (userReg.password == data.password) {
      userReg.updateConnection(ws);
      const result: IRegResponce = {
        name: data.name,
        index: userRegIndex,
        error: false,
        errorText: '',
      }
      sendGames(ws);
      return result;
    } else {
      const result: IRegResponce = {
        name: data.name,
        index: -1,
        error: true,
        errorText: 'Invalid password',
      }
      return result;
    }
  },

  create_room: async (data: '', ws: WebSocket) => {
    const userIndex = users.findIndex(it => it.connection == ws);
    const user = users[userIndex];
    if (!user) return;

    const game = new Game();
    game.players.push(new Player(user));
    games.push(game);
    wss.clients.forEach(it => {
      sendGames(it);
    });
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
          data: JSON.stringify({}),
          id: 0,
        }));
        it.send(JSON.stringify({
          type: "turn",
          data: JSON.stringify(
            {
              currentPlayer: 0,
            },
          ),     
          id: 0,
        }))
      })
    }
  },

  randomAttack: async (_data: string) => {
    const data: {
      gameId: number,      
      indexPlayer: number, /* id of the player in the current game */
    } = JSON.parse(_data);
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    return handlers.attack(JSON.stringify({
      gameId: data.gameId,
      indexPlayer: data.indexPlayer,
      x,
      y,
    }))
  },

  attack: async (_data: string) => {
    const data: {
      gameId: number,
      x: number,
      y: number,
      indexPlayer: number, /* id of the player in the current game */
    } = JSON.parse(_data);

    const game = games[data.gameId];
    if (data.indexPlayer !== game.currentPlayerIndex) {
      return '';
    }
    const status = game.attack({
      x: data.x,
      y: data.y
    }, data.indexPlayer);

    const winner = game.checkWin();
    if (winner !== null) {
      game.players[winner].user.wins += 1;
    }
   
   game.players.forEach(it => {
      it.send(JSON.stringify({
        type: "attack",
        data: JSON.stringify(
          {
            position:
            {
              x: data.x,
              y: data.y,
            },
            currentPlayer: (data.indexPlayer) % 2, /* id of the player in the current game */
            status: status,
          }),
        id: 0,
      }));
      it.send(JSON.stringify({
        type: "turn",
        data: JSON.stringify(
          {
            currentPlayer: game.currentPlayerIndex,
          },
        ),     
        id: 0,
      }))
   
      if(winner !== null) {
        it.send(JSON.stringify({
          type: "finish",
          data: JSON.stringify(
            {
              winPlayer: winner,
            },
          ),     
          id: 0,
        }))
      }
    })

    if (winner !== null) {
    wss.clients.forEach(it => {
      it.send(JSON.stringify({
        type: "update_winners",
        data: JSON.stringify(
          users.filter(jt => jt.wins > 0).map(jt => ({
            name: jt.name, 
            wins: jt.wins,
          }))        
        ),
        id: 0,
    }))
    })
  }
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
  });

  ws.send(JSON.stringify(messages));
});