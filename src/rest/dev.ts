import express from 'express';
import handler from './simulateEvents';
import { REST_ROUTES } from '@/constants/routes';
const app = express();
app.use(express.json());

app.post(REST_ROUTES.DEBUG, handler.eventInterceptor);

export default app;
