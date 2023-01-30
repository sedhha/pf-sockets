import express from 'express';
import { REST_ROUTES } from '@/constants/routes';
import handler from './handler';
const app = express();

app.get(REST_ROUTES.ADD_SESSION, handler.addSession);
app.get(REST_ROUTES.GET_SESSION, handler.getSession);

export default app;
