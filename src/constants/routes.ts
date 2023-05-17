const REST_ROUTES = {
  ADD_SESSION: '/add-session',
  GET_SESSION: '/get-session',
  CLOSE_SESSION: '/close-session',
  ADD_ANALYTICS: '/add-analytics',
  GET_ALL_FIREBASE_DOCS: '/get-firebase-docs',
  UPLOAD_TO_SB: '/upload-to-sb',
  ADD_SAMPLE_NAVIGATION: '/add-sample-navigation',
  DEBUG: '/debug',
  PING: '/ping',

  // dev routes
  GET_FIREBASE_COLLECTION: '/get-firebase-collection',
  MIGRATE_FROM_FIREBASE_COLLECTION: '/migrate-from-firebase-collection',
};

const ROOT_ROUTES = {
  REST: '/rest',
  OPEN: '/open',
  STATS: '/stats',
  DEV: '/dev',
};

export { REST_ROUTES, ROOT_ROUTES };
