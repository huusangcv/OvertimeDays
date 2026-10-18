// src/services/settingsService.js
// Cấu hình chung của ứng dụng trong Firestore systemSettings/general
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

const SETTINGS_DOC = 'systemSettings/general';

export const DEFAULT_SETTINGS = {
  companyName: 'CÔNG TY TNHH THIẾT BỊ KIỂM SOÁT DÒNG CHẢY KINGDOM VIỆT NAM',
  companySubName: '越南鐵王流體控制設備責任有限公司',
  maxRowsPerPage: 19,
  defaultNormalTime: '16:30 - ',
  defaultSundayTime: '7:30 - 16:30',
  allowSelfEmployeeManagement: true,
  updatedAt: new Date().toISOString(),
};

/**
 * Lấy cấu hình hệ thống
 */
export async function getSystemSettings() {
  if (!isFirebaseConfigured || !db) return DEFAULT_SETTINGS;

  try {
    const snap = await getDoc(doc(db, 'systemSettings', 'general'));
    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...snap.data() };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Lỗi đọc system settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Lưu cấu hình hệ thống
 */
export async function saveSystemSettings(settings) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase chưa cấu hình');
  }

  const payload = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'systemSettings', 'general'), payload, { merge: true });
  return payload;
}

export const getGeneralSettings = getSystemSettings;
export const updateGeneralSettings = saveSystemSettings;
