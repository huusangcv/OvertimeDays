// api/admin-init.js
// Khởi tạo firebase-admin một lần dùng chung cho serverless functions

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountRaw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not configured');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountRaw);
  } catch {
    try {
      const decoded = Buffer.from(serviceAccountRaw, 'base64').toString('utf8');
      serviceAccount = JSON.parse(decoded);
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT must be valid JSON or base64 encoded JSON');
    }
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export function getAdminServices() {
  const app = getAdminApp();
  return {
    auth: getAuth(app),
    db: getFirestore(app),
  };
}
