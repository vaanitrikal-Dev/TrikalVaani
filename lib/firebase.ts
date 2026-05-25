// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// FILE: lib/firebase.ts
// VERSION: v1.0
// DATE: 2026-05-24
// PURPOSE:
//   Firebase app initializer — Phone OTP login for mobile users.
//   Keys stored in Vercel env vars (NEXT_PUBLIC_FIREBASE_*).
//   Safe to import in any client component.
// ============================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Prevent duplicate initialization in Next.js hot-reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export default app;
