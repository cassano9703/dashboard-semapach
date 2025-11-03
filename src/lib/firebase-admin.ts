import * as admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    // When running in a Google Cloud environment like App Hosting,
    // initializeApp() automatically discovers the service account credentials.
    admin.initializeApp();
  } catch (error) {
    console.error('Firebase admin initialization error', error);
    // It's possible the default credentials are not available in all local dev environments.
    // As a fallback for local development, you might use a service account file,
    // but that should not be committed to source control.
  }
}

export default admin;
