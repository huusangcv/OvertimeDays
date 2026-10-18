// src/services/adminEmployeeService.js
// Quản trị viên quản lý danh sách toàn bộ nhân viên các bộ phận
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { getDepartments } from './departmentService';

/**
 * Lấy danh sách nhân viên của tất cả bộ phận (hoặc 1 bộ phận cụ thể)
 */
export async function getAllEmployees(selectedDeptId = 'all') {
  if (!isFirebaseConfigured || !db) return [];

  const depts = await getDepartments();
  const targetDepts = selectedDeptId === 'all'
    ? depts
    : depts.filter(d => d.id === selectedDeptId);

  const results = [];

  for (const dept of targetDepts) {
    try {
      const colRef = collection(db, 'departments', dept.id, 'employees');
      const snap = await getDocs(colRef);
      snap.docs.forEach(d => {
        const data = d.data();
        results.push({
          id: d.id,
          employeeCode: d.id,
          name: data.name || '',
          role: data.role || 'CN',
          note: data.note || '',
          departmentId: dept.id,
          departmentName: dept.name,
          active: data.active !== false,
          userUid: data.userUid || '',
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null,
        });
      });
    } catch (err) {
      console.error(`Lỗi đọc nhân viên bộ phận ${dept.id}:`, err);
    }
  }

  // Sắp xếp theo tên hoặc mã NV
  results.sort((a, b) => a.id.localeCompare(b.id, 'vi'));
  return results;
}

/**
 * Kiểm tra xem mã nhân viên đã tồn tại chưa
 */
export async function checkEmployeeCodeExists(employeeCode, departmentId, currentEmployeeId = null) {
  if (!isFirebaseConfigured || !db) return false;

  const colRef = collection(db, 'departments', departmentId, 'employees');
  const snap = await getDocs(colRef);
  return snap.docs.some(d => d.id === employeeCode && d.id !== currentEmployeeId);
}

/**
 * Lưu / cập nhật thông tin nhân viên từ trang Quản trị
 */
export async function adminSaveEmployee(empData, originalDeptId = null) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase chưa cấu hình');
  }

  const {
    id,
    name,
    role,
    note,
    departmentId,
    active = true,
    userUid = '',
  } = empData;

  if (!id || !name || !departmentId) {
    throw new Error('Vui lòng điền đầy đủ Mã nhân viên, Họ tên và Bộ phận');
  }

  // Nếu chuyển đổi bộ phận, xóa ở bộ phận cũ và ghi vào bộ phận mới
  if (originalDeptId && originalDeptId !== departmentId) {
    const oldRef = doc(db, 'departments', originalDeptId, 'employees', id);
    await deleteDoc(oldRef);
  }

  const newRef = doc(db, 'departments', departmentId, 'employees', id);
  const payload = {
    name: name.trim(),
    role: role || 'CN',
    note: (note || '').trim(),
    active: Boolean(active),
    userUid: (userUid || '').trim(),
    updatedAt: new Date().toISOString(),
  };

  if (!empData.createdAt) {
    payload.createdAt = new Date().toISOString();
  }

  await setDoc(newRef, payload, { merge: true });
  return { id, departmentId, ...payload };
}

/**
 * Bật/tắt trạng thái hoạt động của nhân viên (không xóa lịch sử)
 */
export async function adminToggleEmployeeActive(departmentId, employeeId, active) {
  if (!isFirebaseConfigured || !db) return false;

  const docRef = doc(db, 'departments', departmentId, 'employees', employeeId);
  await setDoc(docRef, { active, updatedAt: new Date().toISOString() }, { merge: true });
  return true;
}

/**
 * Xóa hẳn nhân viên
 */
export async function adminDeleteEmployee(departmentId, employeeId) {
  if (!isFirebaseConfigured || !db) return false;

  const docRef = doc(db, 'departments', departmentId, 'employees', employeeId);
  await deleteDoc(docRef);
  return true;
}
