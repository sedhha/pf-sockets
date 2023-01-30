import express from 'express';
import { config } from 'dotenv';
import expressWs from 'express-ws';
import { ROOT_ROUTES } from '@/constants/routes';
import restApp from '@/rest/app';

config();
const appBase = express();
const wsInstance = expressWs(appBase);
const { app } = wsInstance; // let app = wsInstance.app;

app.ws('/init-analytics', (ws, req) => {
  console.log(req.headers['user-agent'], req.headers['sec-ch-ua-platform'] ?? 'unknown');
  ws.on('message', (msg: string) => {
    console.log('Message Recieved = ', JSON.parse(msg));
    ws.send('You sent - ' + msg);
  });
});
app.use(ROOT_ROUTES.REST, restApp);
app.listen(process.env.PORT ?? 3000, () => {
  console.log(`Listening on port ${process.env.PORT ?? 3000}`);
});
