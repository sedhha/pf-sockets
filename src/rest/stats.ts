import express from 'express';
import { REST_ROUTES } from '@/constants/routes';
import handler from './handler';
const app = express();
app.get(REST_ROUTES.PING, handler.pingRoute);
export default app;
