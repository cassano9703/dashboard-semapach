import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // The SDK will automatically discover credentials in a production environment.
      // For local development, you might need to set GOOGLE_APPLICATION_CREDENTIALS.
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export default admin;
