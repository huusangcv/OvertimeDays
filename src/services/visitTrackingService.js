// src/services/visitTrackingService.js
// Dịch vụ ghi nhận và thống kê lượt truy cập các bộ phận (Bảo mật: Chỉ Admin mới được đọc)

import {
  doc,
  collection,
  runTransaction,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

export const STATS_COLLECTION = 'department_stats';
export const VISITS_COLLECTION = 'department_visits';
const COOLDOWN_MS = 30000; // 30 giây chống ghi trùng trong cùng tab session

/**
 * Lấy chuỗi ngày hôm nay YYYY-MM-DD theo giờ địa phương
 */
export function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format timestamp Firestore thành DD/MM/YYYY HH:mm
 */
export function formatVisitTimestamp(timestamp) {
  if (!timestamp) return 'Chưa có lượt truy cập';

  let date;
  if (timestamp && typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'number' || typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    return 'Chưa có lượt truy cập';
  }

  if (Number.isNaN(date.getTime())) {
    return 'Chưa có lượt truy cập';
  }

  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${d}/${m}/${y} ${h}:${min}`;
}

/**
 * Ghi nhận một lượt truy cập vào bộ phận
 * - Chống ghi trùng do React Strict Mode hoặc re-render
 * - Dùng Firestore Transaction atomic, không cần tải toàn bộ lịch sử
 * - Non-blocking: Bắt lỗi an toàn, không ảnh hưởng chức năng chính
 *
 * @param {string} departmentId Mã định danh bộ phận
 * @param {string} [departmentName] Tên bộ phận
 * @param {object} [currentUser] Thông tin người dùng hiện tại (nếu có)
 */
export async function recordDepartmentVisit(departmentId, departmentName = '', currentUser = null) {
  if (!isFirebaseConfigured || !db || !departmentId) {
    return false;
  }

  // 1. Kiểm tra session cooldown để tránh ghi nhận liên tục khi F5 hoặc switch nhanh
  const storageKey = `ot_visit_${departmentId}`;
  try {
    const lastVisit = sessionStorage.getItem(storageKey);
    const now = Date.now();
    if (lastVisit && now - Number(lastVisit) < COOLDOWN_MS) {
      // Đã ghi nhận trong 30s qua trong cùng tab -> bỏ qua
      return false;
    }
    sessionStorage.setItem(storageKey, String(now));
  } catch (e) {
    // sessionStorage có thể bị chặn ở incognito mode, tiếp tục bình thường
  }

  try {
    const todayStr = getLocalDateString();
    const statDocRef = doc(db, STATS_COLLECTION, departmentId);

    // 2. Chạy Firestore Transaction cập nhật tổng lượt và lượt hôm nay
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(statDocRef);

      if (!snap.exists()) {
        transaction.set(statDocRef, {
          departmentId,
          departmentName: departmentName || departmentId,
          totalVisits: 1,
          todayVisits: 1,
          todayDate: todayStr,
          lastVisitedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        const data = snap.data();
        const prevTotal = Number(data.totalVisits) || 0;
        const prevToday = Number(data.todayVisits) || 0;
        const prevDate = data.todayDate;

        // Nếu sang ngày mới, reset lượt hôm nay về 1; nếu cùng ngày thì tăng tiếp
        const newTodayVisits = (prevDate === todayStr) ? prevToday + 1 : 1;

        transaction.update(statDocRef, {
          departmentName: departmentName || data.departmentName || departmentId,
          totalVisits: prevTotal + 1,
          todayVisits: newTodayVisits,
          todayDate: todayStr,
          lastVisitedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    });

    // 3. Ghi log chi tiết vào department_visits (phục vụ đối soát/audit)
    addDoc(collection(db, VISITS_COLLECTION), {
      departmentId,
      departmentName: departmentName || departmentId,
      visitedAt: serverTimestamp(),
      userId: currentUser?.uid || null,
      userEmail: currentUser?.email || null,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      path: typeof window !== 'undefined' ? window.location.pathname : '',
    }).catch((err) => {
      console.warn('[VisitTracking] Ghi log chi tiết gặp lỗi nhỏ:', err?.message);
    });

    return true;
  } catch (error) {
    // Non-blocking: tuyệt đối không làm gián đoạn người dùng
    console.warn(`[VisitTracking] Không thể ghi nhận truy cập cho ${departmentId}:`, error?.message);
    return false;
  }
}

/**
 * Lấy toàn bộ thống kê các bộ phận một lần (Chỉ Admin)
 * @returns {Promise<Record<string, object>>} Map từ departmentId -> dữ liệu thống kê
 */
export async function getDepartmentStats() {
  if (!isFirebaseConfigured || !db) {
    return {};
  }

  const snap = await getDocs(collection(db, STATS_COLLECTION));
  const statsMap = {};
  const todayStr = getLocalDateString();

  snap.forEach((d) => {
    const data = d.data();
    const isCurrentDay = data.todayDate === todayStr;
    const normalizedTodayVisits = isCurrentDay ? (Number(data.todayVisits) || 0) : 0;

    statsMap[d.id] = {
      id: d.id,
      ...data,
      totalVisits: Number(data.totalVisits) || 0,
      todayVisits: normalizedTodayVisits,
    };
  });
  return statsMap;
}

/**
 * Đăng ký lắng nghe thống kê thời gian thực (Chỉ Admin)
 * @param {function} onUpdate Callback nhận map { [deptId]: statData }
 * @param {function} [onError] Callback xử lý lỗi (ví dụ permission-denied khi không phải admin)
 * @returns {function} Unsubscribe function
 */
export function subscribeDepartmentStats(onUpdate, onError) {
  if (!isFirebaseConfigured || !db) {
    if (onUpdate) onUpdate({});
    return () => {};
  }

  return onSnapshot(
    collection(db, STATS_COLLECTION),
    (snapshot) => {
      const statsMap = {};
      const todayStr = getLocalDateString();

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const isCurrentDay = data.todayDate === todayStr;
        const normalizedTodayVisits = isCurrentDay ? (Number(data.todayVisits) || 0) : 0;

        statsMap[docSnap.id] = {
          id: docSnap.id,
          ...data,
          totalVisits: Number(data.totalVisits) || 0,
          todayVisits: normalizedTodayVisits,
        };
      });

      if (onUpdate) {
        onUpdate(statsMap);
      }
    },
    (error) => {
      console.warn('[VisitTracking] Lỗi lắng nghe thống kê (kiểm tra quyền Admin):', error?.message);
      if (onError) {
        onError(error);
      }
    }
  );
}
