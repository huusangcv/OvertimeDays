// src/services/overtimeAdminService.js
// Tra cứu, thống kê và quản lý biểu tăng ca toàn công ty
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  setDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { getDepartments } from './departmentService';

/**
 * Lấy danh sách toàn bộ biểu tăng ca từ các bộ phận
 */
export async function getAllOvertimeRecords({
  departmentId = 'all',
  fromDate = '',
  toDate = '',
  searchQuery = '',
} = {}) {
  if (!isFirebaseConfigured || !db) return [];

  const depts = await getDepartments();
  const targetDepts = departmentId === 'all'
    ? depts
    : depts.filter(d => d.id === departmentId);

  let allRecords = [];

  for (const dept of targetDepts) {
    try {
      const colRef = collection(db, 'departments', dept.id, 'overtimeHistory');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      snap.docs.forEach(d => {
        const data = d.data();
        allRecords.push({
          id: d.id,
          ...data,
          departmentId: dept.id,
          departmentName: data.departmentName || dept.name,
        });
      });
    } catch (err) {
      console.error(`Lỗi đọc lịch sử tăng ca bộ phận ${dept.id}:`, err);
    }
  }

  // Lọc theo khoảng ngày (theo date của biểu)
  if (fromDate) {
    allRecords = allRecords.filter(r => (r.date || '') >= fromDate);
  }
  if (toDate) {
    allRecords = allRecords.filter(r => (r.date || '') <= toDate);
  }

  // Lọc theo từ khóa tìm kiếm
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    allRecords = allRecords.filter(r => {
      const matchShift = (r.shift || '').toLowerCase().includes(q);
      const matchDept = (r.departmentName || '').toLowerCase().includes(q);
      const matchEmp = (r.employees || []).some(
        e => (e.name || '').toLowerCase().includes(q) || (e.id || '').toLowerCase().includes(q)
      );
      return matchShift || matchDept || matchEmp;
    });
  }

  // Sắp xếp ngày tạo mới nhất lên đầu
  allRecords.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return allRecords;
}

/**
 * Alias for getAllOvertimeRecords — used by Admin Overtimes page
 */
export async function getOvertimes({
  departmentId,
  startDate,
  endDate,
  keyword,
} = {}) {
  return getAllOvertimeRecords({
    departmentId: departmentId || 'all',
    fromDate: startDate || '',
    toDate: endDate || '',
    searchQuery: keyword || '',
  });
}

/**
 * Xóa 1 bản ghi tăng ca
 */
export async function deleteOvertimeRecord(recordId, departmentId) {
  if (!isFirebaseConfigured || !db || !departmentId || !recordId) return false;

  const docRef = doc(db, 'departments', departmentId, 'overtimeHistory', String(recordId));
  await deleteDoc(docRef);
  return true;
}

/**
 * Cập nhật trạng thái duyệt biểu
 */
export async function updateOvertimeStatus(recordId, departmentId, status) {
  if (!isFirebaseConfigured || !db || !departmentId || !recordId) return false;

  const docRef = doc(db, 'departments', departmentId, 'overtimeHistory', String(recordId));
  await setDoc(docRef, {
    status,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  return true;
}
