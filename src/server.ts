import express from 'express';
import { config } from 'dotenv';
config();
import expressWs from 'express-ws';
import { ROOT_ROUTES } from '@/constants/routes';
import restApp from '@/rest/app';
import serverApp from '@/rest/server';
import withCSRFProtect from '@/middlewares/wsCSRFProtect';
import { IWSResult } from '@/interfaces/webSocket';
import { IFEGeo, FEventData } from '@/interfaces/analytics';
import operationHandler, { IData } from '@/firebase/analytics';

const appBase = express();
const wsInstance = expressWs(appBase);
const { app } = wsInstance; // let app = wsInstance.app;

app.ws('/track', (ws, req) => {
  ws.on('message', async (msg: string) => {
    const ua = req.headers['user-agent'] as string;
    const response = withCSRFProtect<IFEGeo | FEventData>({
      ua,
      message: msg,
    });
    // const { opType } = req.query;
    // if (response.closeConnection) ws.close();
    if (!response.actionType || !response.csrf) ws.close();
    const result = await operationHandler(response.actionType, response.csrf, ua, response.body);
    ws.send(
      JSON.stringify({
        status: response.status,
        message: response.message,
        identifier: response.actionType,
        payload: result.data,
      } as IWSResult<string | IData>),
    );
  });
  ws.on('close', (code, reason) => {
    console.log({ code, reason });
  });
});
app.use(ROOT_ROUTES.REST, restApp);
app.use(ROOT_ROUTES.OPEN, serverApp);
app.listen(process.env.PORT ?? 3000, () => {
  console.log(`Listening on port ${process.env.PORT ?? 3000}`);
});
