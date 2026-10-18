// src/services/accountService.js
// Quản lý danh sách tài khoản người dùng và vai trò trong Firestore users
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

const USERS_COL = 'users';

/**
 * Lấy tất cả tài khoản người dùng
 */
export async function getAccounts() {
  if (!isFirebaseConfigured || !db) return [];

  try {
    const q = query(collection(db, USERS_COL), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      uid: d.id,
      ...d.data(),
    }));
  } catch (error) {
    console.error('Lỗi lấy danh sách tài khoản:', error);
    return [];
  }
}

/**
 * Cập nhật vai trò tài khoản
 */
export async function updateUserRole(uid, role) {
  if (!isFirebaseConfigured || !db || !uid) return false;

  const validRoles = ['admin', 'manager', 'staff'];
  if (!validRoles.includes(role)) {
    throw new Error('Vai trò không hợp lệ');
  }

  await setDoc(doc(db, USERS_COL, uid), {
    role,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  return true;
}

/**
 * Kích hoạt hoặc vô hiệu hóa tài khoản
 */
export async function toggleAccountActive(uid, active) {
  if (!isFirebaseConfigured || !db || !uid) return false;

  await setDoc(doc(db, USERS_COL, uid), {
    active: Boolean(active),
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  return true;
}

/**
 * Gán bộ phận cho tài khoản
 */
export async function updateUserDepartment(uid, departmentId) {
  if (!isFirebaseConfigured || !db || !uid) return false;

  await setDoc(doc(db, USERS_COL, uid), {
    departmentId,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  return true;
}

export const toggleUserStatus = toggleAccountActive;
