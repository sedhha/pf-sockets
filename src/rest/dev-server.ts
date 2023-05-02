import express from 'express';
import { REST_ROUTES } from '@/constants/routes';
import handler from './migration';
const app = express();
app.get(REST_ROUTES.GET_ALL_FIREBASE_DOCS, handler.getGeoDocs);
export default app;
