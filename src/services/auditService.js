// src/services/auditService.js
// Quản lý Audit Log: Ghi trực tiếp vào Firestore collection 'audit_logs'
// Đồng thời tương thích với Vercel Function /api/audit khi chạy production.

import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit as firestoreLimit,
  where,
  serverTimestamp,
} from 'firebase/firestore';

const AUDIT_COL = 'audit_logs';
const DEVICE_ID_KEY = 'audit_device_id';
const DEVICE_NAME_KEY = 'audit_device_name';

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getDeviceName() {
  let name = localStorage.getItem(DEVICE_NAME_KEY);
  if (!name) {
    const ua = navigator.userAgent;
    let browser = 'Trình duyệt';
    if (ua.includes('Edg/')) browser = 'MS Edge';
    else if (ua.includes('Chrome/')) browser = 'Google Chrome';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Safari/')) browser = 'Safari';

    let os = 'Thiết bị';
    if (ua.includes('Windows')) os = 'Windows PC';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Mac')) os = 'Mac';

    name = `${browser} (${os})`;
    localStorage.setItem(DEVICE_NAME_KEY, name);
  }
  return name;
}

/**
 * Ghi 1 bản ghi audit log
 * Ghi trực tiếp vào Firestore collection 'audit_logs' để lưu trữ tức thì
 * Đồng thời gọi /api/audit nếu đang chạy trên Vercel.
 *
 * @param {Object} params
 * @param {string} params.action - 'ADD' | 'EDIT' | 'DELETE' | 'PRINT' | 'ACTIVATE' | 'DEACTIVATE' | 'GRANT_ROLE' | 'UPDATE_SETTINGS'
 * @param {string} params.entity - 'employee' | 'overtime' | 'history' | 'account' | 'department' | 'category' | 'settings'
 * @param {string} [params.entityId] - ID của đối tượng bị thay đổi
 * @param {string} [params.entityLabel] - Tên hoặc nhãn hiển thị dễ đọc của đối tượng
 * @param {string} [params.department] - Mã bộ phận (nếu có)
 * @param {any}    [params.before] - Trạng thái trước khi sửa/xoá (nhỏ gọn)
 * @param {any}    [params.after] - Trạng thái sau khi thêm/sửa
 * @param {string} [params.note] - Ghi chú bổ sung
 * @returns {Promise<boolean>}
 */
export async function logAudit({
  action,
  entity,
  entityId = null,
  entityLabel = null,
  department = null,
  before = null,
  after = null,
  note = null,
}) {
  try {
    const currentUser = auth?.currentUser;
    const deviceId = getDeviceId();
    const deviceName = getDeviceName();

    const recordData = {
      ts: serverTimestamp(),
      action: String(action || 'ACTION').toUpperCase(),
      entity: String(entity || 'item').toLowerCase(),
      entityId: entityId ? String(entityId) : null,
      entityLabel: entityLabel ? String(entityLabel) : null,
      department: department ? String(department) : null,
      before: before !== undefined ? before : null,
      after: after !== undefined ? after : null,
      note: note ? String(note) : null,
      actor: {
        uid: currentUser?.uid || 'client-user',
        email: currentUser?.email || currentUser?.displayName || 'Người dùng nội bộ',
      },
      device: {
        id: deviceId,
        name: deviceName,
      },
      ip: 'Client Web',
    };

    // 1. Ghi trực tiếp vào Firestore collection 'audit_logs'
    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, AUDIT_COL), recordData);
        console.log('[audit] Đã ghi thành công vào Firestore audit_logs:', docRef.id, action, entity);
      } catch (fsErr) {
        console.warn('[audit] Ghi Firestore trực tiếp thất bại:', fsErr.message);
      }
    }

    // 2. Đồng thời gọi API /api/audit (cho Vercel serverless log nếu có)
    try {
      fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          entity,
          entityId,
          entityLabel,
          department,
          before,
          after,
          note,
        }),
      }).catch(() => {});
    } catch {
      // bỏ qua lỗi API
    }

    return true;
  } catch (error) {
    console.warn('[audit] Không thể lưu audit log:', error.message);
    return false;
  }
}

/**
 * Đọc danh sách audit logs từ Firestore trực tiếp (hoặc /api/audit-list)
 * @param {Object} options
 * @param {string} [options.department]
 * @param {string} [options.action]
 * @param {string} [options.entity]
 * @param {number} [options.limit]
 * @returns {Promise<Array>}
 */
export async function fetchAuditLogs({
  department = '',
  action = '',
  entity = '',
  limit = 50,
} = {}) {
  // 1. Ưu tiên đọc trực tiếp từ Firestore collection 'audit_logs'
  if (isFirebaseConfigured && db) {
    try {
      // Query theo ts giảm dần (không cần tạo composite index trên Firebase)
      const q = query(
        collection(db, AUDIT_COL),
        orderBy('ts', 'desc'),
        firestoreLimit(Math.max(limit * 3, 100))
      );

      const snap = await getDocs(q);
      let logs = snap.docs.map((d) => {
        const item = d.data();
        let tsMillis = null;
        if (item.ts?.toMillis) {
          tsMillis = item.ts.toMillis();
        } else if (item.ts?.seconds) {
          tsMillis = item.ts.seconds * 1000;
        } else if (item.ts) {
          tsMillis = new Date(item.ts).getTime();
        }
        return {
          id: d.id,
          ...item,
          ts: tsMillis,
        };
      });

      if (department) {
        logs = logs.filter((l) => l.department === department);
      }
      if (action) {
        logs = logs.filter((l) => l.action === action.toUpperCase());
      }
      if (entity) {
        logs = logs.filter((l) => l.entity === entity.toLowerCase());
      }
      return logs.slice(0, limit);
    } catch (fbErr) {
      console.warn('[audit] Lỗi đọc Firestore trực tiếp:', fbErr.message);
    }
  }

  // 2. Thử gọi /api/audit-list nếu Firestore client bị lỗi
  try {
    const params = new URLSearchParams();
    if (department) params.set('department', department);
    if (action) params.set('action', action);
    if (entity) params.set('entity', entity);
    if (limit) params.set('limit', String(limit));

    const response = await fetch(`/api/audit-list?${params.toString()}`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.logs)) return data.logs;
    }
  } catch (apiErr) {
    console.warn('[audit] Lỗi gọi /api/audit-list:', apiErr.message);
  }

  return [];
}
