import express from 'express';
import { config } from 'dotenv';
config();
import expressWs from 'express-ws';
import { ROOT_ROUTES } from '@/constants/routes';
import restApp from '@/rest/app';
import serverApp from '@/rest/server';
import statsApp from '@/rest/stats';
import migrationApp from '@/rest/dev';
import withCSRFProtect from '@/middlewares/wsCSRFProtect';
import { IWSResult } from '@/interfaces/webSocket';
import { IExpectedWSPayload } from '@/interfaces/analytics';
import operationHandler, { IData } from '@/firebase/analytics';
import { supportedOperations } from '@/firebase/constants';
import { info } from './utils/dev-utils';

const appBase = express();
const wsInstance: expressWs.Instance = expressWs(appBase);
const { app } = wsInstance; // let app = wsInstance.app;

app.ws('/track', (ws, req) => {
  const { csrf } = req.query;
  const ua = req.headers['user-agent'] as string;
  info(`| WEB-SOCKET::NEW-CONNECTION ${req.ip} Trying to connect...`);
  if (!csrf || typeof csrf !== 'string' || !ua) {
    ws.send(
      JSON.stringify({
        status: 401,
        message: 'Invalid Connection Request - ' + `csrf:${csrf}`,
        identifier: supportedOperations.closedByServer,
      } as IWSResult<null>),
    );
    info(`Closing Connection:- ${req.url} | CSRF Not Present`);
    ws.close();
  }
  ws.on('message', async (msg: string) => {
    const response = withCSRFProtect<IExpectedWSPayload>({
      ua,
      message: msg,
    });
    if (!response.actionType || !response.csrf) {
      ws.close();
    }
    const result = await operationHandler(
      response.actionType,
      response.csrf,
      ua,
      response.body,
    );
    ws.send(
      JSON.stringify({
        status: response.status,
        message: response.message,
        identifier: response.actionType,
        payload: result.data,
      } as IWSResult<string | IData>),
    );
    if (response.actionType === supportedOperations.close) {
      ws.close();
    }
  });
  ws.on('close', async code => {
    if (code === 1005) {
      info(`| WEB-SOCKET::PAUSE Connection: ${code}`);
      return;
    }
    await operationHandler(supportedOperations.forceClose, csrf as string, ua);
    info(`| WEB-SOCKET::FORCE-CLOSE Connection Code: ${code}`);
  });
});
app.use(ROOT_ROUTES.REST, restApp);
app.use(ROOT_ROUTES.OPEN, serverApp);
app.use(ROOT_ROUTES.STATS, statsApp);
app.use(ROOT_ROUTES.DEV, migrationApp);
app.listen(process.env.PORT ?? 3000, () => {
  info(`| Listening on port ${process.env.PORT ?? 3000}`);
});
