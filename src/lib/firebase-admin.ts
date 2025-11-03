import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // This will use the service account credentials available in the App Hosting environment.
    admin.initializeApp();
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export default admin;
