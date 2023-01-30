import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { config } from 'dotenv';

config();
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (message: string) => {
    console.log(`Received message: ${message}`);
    ws.send(`You sent: ${message}`);
  });
});

app.get('/api/ping', (req, res) => {
  res.send('pong');
});

server.listen(process.env.PORT ?? 3000, () => {
  console.log(`Server started on port ${process.env.PORT ?? 3000}`);
});
