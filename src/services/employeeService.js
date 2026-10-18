import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

function employeesCollection(departmentId) {
  return collection(db, 'departments', departmentId, 'employees');
}

function normalizeEmployee(data, id) {
  return {
    id,
    name: data.name || '',
    role: data.role || 'CN',
    note: data.note || '',
  };
}

/**
 * Tải nhân viên từ Firestore. Nếu chưa có dữ liệu, seed từ danh sách mặc định.
 * @returns {Promise<Array>|null} null khi Firebase chưa cấu hình
 */
export async function loadEmployeesForDepartment(departmentId, seedList = []) {
  if (!isFirebaseConfigured || !db) {
    return null;
  }

  const snap = await getDocs(employeesCollection(departmentId));
  if (snap.empty) {
    if (seedList.length > 0) {
      await seedEmployees(departmentId, seedList);
    }
    return [...seedList];
  }

  const employees = snap.docs.map((d) => normalizeEmployee(d.data(), d.id));
  employees.sort((a, b) => a.id.localeCompare(b.id, 'vi'));
  return employees;
}

export async function seedEmployees(departmentId, employees) {
  if (!isFirebaseConfigured || !db || employees.length === 0) return;

  const batch = writeBatch(db);
  for (const emp of employees) {
    const ref = doc(employeesCollection(departmentId), emp.id);
    batch.set(ref, {
      name: emp.name,
      role: emp.role || 'CN',
      note: emp.note || '',
      updatedAt: new Date().toISOString(),
    });
  }
  await batch.commit();
}

export async function upsertEmployee(departmentId, employee) {
  if (!isFirebaseConfigured || !db) return false;

  await setDoc(
    doc(employeesCollection(departmentId), employee.id),
    {
      name: employee.name,
      role: employee.role || 'CN',
      note: employee.note || '',
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
  return true;
}

export async function removeEmployee(departmentId, employeeId) {
  if (!isFirebaseConfigured || !db) return false;
  await deleteDoc(doc(employeesCollection(departmentId), employeeId));
  return true;
}
