// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAYRg1Xw1XA-mg22DVwCh-lbTLXK2sPkzg",
  authDomain: "ttaw-time-tracker.firebaseapp.com",
  projectId: "ttaw-time-tracker",
  storageBucket: "ttaw-time-tracker.firebasestorage.app",
  messagingSenderId: "529822266638",
  appId: "1:529822266638:web:6a6ed3f1752ce2ab37135f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
