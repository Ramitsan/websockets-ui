import { WebSocketServer } from 'ws';

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

const handlers = {
  reg: async (data: IRegRequest) => {
    console.log(data);
    const result: IRegResponce = {
      name: data.name,
      index: 0,
      error: false,
      errorText: ''
    }
    return result;
  }
}

wss.on('connection',  (ws) => {
  ws.on('error', console.error);

  ws.on('message', async (data) => {
    console.log('received: %s', data);
    try {
      const parsedData: IServerMessage<any> = JSON.parse(data.toString());
      const handler = handlers[parsedData.type as keyof typeof handlers];
      if(handler) {
        const result = await handler(parsedData.data);
        const response: IServerMessage<string> = {
          type: 'reg',
          id: parsedData.id,
          data: JSON.stringify(result)
        }
        ws.send(JSON.stringify(response))
      } else {
        console.log('unknown request type');
      }
    }
    catch(err) {
      console.log('server error');
    }
    // messages.push(data.toString());
    // wss.clients.forEach(it => {
    //   it.send(JSON.stringify(messages));
    // })
    // ws.send(JSON.stringify('ok'));
  });

  ws.send(JSON.stringify(messages));
});