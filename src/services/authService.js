// src/services/authService.js
// Quản lý xác thực và phân quyền Admin qua Firebase Auth + Firestore
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

const USERS_COL = 'users';

/**
 * Đăng nhập bằng Email & Mật khẩu
 */
export async function loginWithEmail(email, password) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase Auth chưa được khởi tạo. Vui lòng kiểm tra cấu hình.');
  }

  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return userCredential.user;
}

/**
 * Đăng xuất
 */
export async function logoutUser() {
  if (!auth) return;
  await fbSignOut(auth);
}

/**
 * Lắng nghe thay đổi trạng thái Auth
 */
export function subscribeToAuthState(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return fbOnAuthStateChanged(auth, callback);
}

/**
 * Lấy profile người dùng từ Firestore users/{uid}
 */
export async function getUserProfile(uid) {
  if (!isFirebaseConfigured || !db || !uid) return null;

  try {
    const userDoc = await getDoc(doc(db, USERS_COL, uid));
    if (userDoc.exists()) {
      return { uid, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Lỗi khi đọc profile users/{uid}:', error);
    return null;
  }
}

/**
 * Kiểm tra xem hệ thống đã có tài khoản Quản trị viên nào chưa
 */
export async function hasAnyAdmin() {
  if (!isFirebaseConfigured || !db) return false;

  try {
    const q = query(collection(db, USERS_COL), where('role', '==', 'admin'), limit(1));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.error('Lỗi kiểm tra admin hiện hữu:', error);
    return false;
  }
}

/**
 * Khởi tạo người dùng đầu tiên làm Quản trị viên (First Admin Bootstrap)
 * Chỉ cho phép khi hệ thống chưa có Quản trị viên nào
 */
export async function bootstrapFirstAdmin(user, extraData = {}) {
  if (!isFirebaseConfigured || !db || !user) {
    throw new Error('Không thể thiết lập admin: Thiếu thông tin người dùng hoặc database');
  }

  const existingAdmin = await hasAnyAdmin();
  if (existingAdmin) {
    throw new Error('Hệ thống đã có quản trị viên. Việc phân quyền mới phải do quản trị viên hiện tại thực hiện.');
  }

  const adminProfile = {
    uid: user.uid,
    email: user.email,
    displayName: extraData.displayName || user.displayName || user.email.split('@')[0],
    role: 'admin',
    departmentId: 'all',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, USERS_COL, user.uid), adminProfile);
  return adminProfile;
}

/**
 * Cập nhật hồ sơ người dùng
 */
export async function saveUserProfile(uid, data) {
  if (!isFirebaseConfigured || !db || !uid) return false;

  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, USERS_COL, uid), payload, { merge: true });
  return true;
}
