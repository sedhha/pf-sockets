import express from 'express';
import { REST_ROUTES } from '@/constants/routes';
import handler from './migration';
const app = express();
app.use(express.json());

app.get(REST_ROUTES.GET_ALL_FIREBASE_DOCS, handler.getGeoDocs);
app.get(REST_ROUTES.ADD_SAMPLE_NAVIGATION, handler.upsertASampleEvent);
app.post(REST_ROUTES.UPLOAD_TO_SB, handler.uploadDocument);
export default app;
