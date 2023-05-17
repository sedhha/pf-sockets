import express from 'express';
import { REST_ROUTES } from '@/constants/routes';

const app = express();

if (process.env.NEXT_PUBLIC_ONLY_DEV_ROUTE) {
  app.use(express.json());
  import('./simulateEvents').then(imported => {
    const handler = imported.default;
    app.post(REST_ROUTES.DEBUG, handler.eventInterceptor);
    app.get(
      REST_ROUTES.GET_FIREBASE_COLLECTION,
      handler.collectionFromFirebase,
    );
    app.get(
      REST_ROUTES.MIGRATE_FROM_FIREBASE_COLLECTION,
      handler.migrateFromFirebase,
    );
  });
}

export default app;
