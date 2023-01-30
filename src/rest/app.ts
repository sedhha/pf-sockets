import express from 'express';
import { REST_ROUTES } from '@/constants/routes';
import handler from './handler';
import cors, { CorsOptions } from 'cors';

const allowedOrigins = [
  'http://localhost:3000',
  'https://shivam-sahil.vercel.app',
  'https://shivam-sahil.web.app',
  'https://shivam-sahil-spidey.vercel.app',
];

const app = express();
const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(origin);
      callback({ message: 'Method not allowed', name: 'MethodNotAllowed' });
    }
  },
};

app.use(cors(corsOptions));

app.get(REST_ROUTES.ADD_SESSION, handler.addSession);
app.get(REST_ROUTES.GET_SESSION, handler.getSession);

export default app;
