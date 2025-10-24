
export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-2e242",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1012876694619:web:1e37389569766324670591",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "api-key-is-a-secret",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-2e242.firebaseapp.com",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-2e242.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1012876694619",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-149V4V31G0",
};
