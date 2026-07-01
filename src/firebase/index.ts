
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;
  
  if (getApps().length > 0) {
    firebaseApp = getApp();
  } else {
    // Priorizamos siempre la configuración explícita para evitar fallos en entornos de preview
    firebaseApp = initializeApp(firebaseConfig);
  }

  let storage = null;
  try {
    storage = getStorage(firebaseApp);
  } catch (e) {
    console.warn('Firebase Storage could not be initialized.', e);
  }

  return {
    firebaseApp,
    firestore: getFirestore(firebaseApp),
    auth: getAuth(firebaseApp),
    storage,
  };
}

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
