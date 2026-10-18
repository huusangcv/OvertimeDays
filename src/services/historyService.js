// src/services/historyService.js
// Lịch sử in biểu tăng ca — Firestore (ưu tiên) + LocalStorage (fallback)

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

const HISTORY_KEY = 'overtime-history';

function historyCollection(departmentId) {
  return collection(db, 'departments', departmentId, 'overtimeHistory');
}

function getRawHistoryLocal() {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Lỗi khi đọc lịch sử từ LocalStorage:', error);
    return [];
  }
}

function saveRawHistoryLocal(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/**
 * Lưu 1 bản ghi vào lịch sử
 * @param {Object} snapshotData
 */
export async function saveHistory(snapshotData) {
  if (isFirebaseConfigured && db) {
    try {
      const { departmentId, id } = snapshotData;
      if (!departmentId || !id) {
        throw new Error('Thiếu departmentId hoặc id');
      }
      await setDoc(doc(historyCollection(departmentId), String(id)), {
        ...snapshotData,
        createdAt: snapshotData.createdAt || new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Lỗi khi lưu lịch sử Firestore:', error);
      return false;
    }
  }

  try {
    const history = getRawHistoryLocal();
    const newHistory = [snapshotData, ...history];
    saveRawHistoryLocal(newHistory);
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu lịch sử:', error);
    return false;
  }
}

/**
 * Lấy lịch sử của 1 bộ phận
 * @param {string} departmentId
 * @returns {Promise<Array>}
 */
export async function getHistory(departmentId) {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(historyCollection(departmentId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Lỗi khi đọc lịch sử Firestore:', error);
      return [];
    }
  }

  const history = getRawHistoryLocal();
  return history.filter((item) => item.departmentId === departmentId);
}

/**
 * Xóa 1 bản ghi lịch sử
 * @param {string} id
 * @param {string} [departmentId]
 */
export async function deleteHistory(id, departmentId) {
  if (isFirebaseConfigured && db && departmentId) {
    try {
      await deleteDoc(doc(historyCollection(departmentId), String(id)));
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa lịch sử Firestore:', error);
      return false;
    }
  }

  try {
    const history = getRawHistoryLocal();
    const newHistory = history.filter((item) => item.id !== id);
    saveRawHistoryLocal(newHistory);
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa lịch sử:', error);
    return false;
  }
}

/**
 * Xóa toàn bộ lịch sử của 1 bộ phận
 * @param {string} departmentId
 */
export async function clearHistory(departmentId) {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(historyCollection(departmentId));
      if (snap.empty) return true;

      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa tất cả lịch sử Firestore:', error);
      return false;
    }
  }

  try {
    const history = getRawHistoryLocal();
    const newHistory = history.filter((item) => item.departmentId !== departmentId);
    saveRawHistoryLocal(newHistory);
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa tất cả lịch sử:', error);
    return false;
  }
}

export { isFirebaseConfigured };
