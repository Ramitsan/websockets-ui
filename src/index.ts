import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
const messages: Array<string> = [];

wss.on('connection',  (ws) => {
  ws.on('error', console.error);

  ws.on('message', (data) => {
    console.log('received: %s', data);
    messages.push(data.toString());
    wss.clients.forEach(it => {
      it.send(JSON.stringify(messages));
    })
    ws.send(JSON.stringify('ok'));
  });

  ws.send(JSON.stringify(messages));
});