/**
 * config/firebase.js
 * Initializes Firebase Admin SDK for server-side file operations.
 */

const admin = require('firebase-admin');

let app;

function initFirebase() {
  if (admin.apps.length > 0) {
    app = admin.apps[0];
    return app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    console.warn('[Firebase] Missing Firebase credentials — file upload disabled.');
    return null;
  }

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey,
      clientEmail,
    }),
    storageBucket: `${projectId}.appspot.com`,
  });

  console.log('[Firebase] Admin SDK initialized ✓');
  return app;
}

const firebaseApp = initFirebase();
const storage = firebaseApp ? admin.storage() : null;
const bucket = storage ? storage.bucket() : null;

module.exports = { firebaseApp, storage, bucket };
