// src/services/categoryService.js
// Quan ly danh muc cau hinh (Loai tang ca, Ca lam viec, Chuc vu)
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

const CATEGORIES_COL = 'categories';

export const DEFAULT_CATEGORIES = [
  { id: 'ot-thuong', type: 'ot_type', code: 'TCA THUONG', label: 'TCA Thuong (Ngay thuong)', name: 'TCA Thuong', active: true, sortOrder: 1 },
  { id: 'ot-chunhat', type: 'ot_type', code: 'CHU NHAT', label: 'Chu Nhat', name: 'Chu Nhat', active: true, sortOrder: 2 },
  { id: 'shift-day', type: 'shift', code: 'day', label: 'Ca Ngay (7h30 - 16h30)', name: 'Ca Ngay', active: true, sortOrder: 1 },
  { id: 'shift-night', type: 'shift', code: 'night', label: 'Ca Dem (19h30 - 4h00)', name: 'Ca Dem', active: true, sortOrder: 2 },
  { id: 'role-cn', type: 'role', code: 'CN', label: 'Cong nhan', name: 'Cong nhan', active: true, sortOrder: 1 },
  { id: 'role-nv', type: 'role', code: 'NV', label: 'Nhan vien', name: 'Nhan vien', active: true, sortOrder: 2 },
  { id: 'role-tp', type: 'role', code: 'TP', label: 'Tổ trưởng', name: 'Tổ trưởng', active: true, sortOrder: 3 },
  { id: 'role-ct', type: 'role', code: 'CT', label: 'Ca trưởng', name: 'Ca trưởng', active: true, sortOrder: 4 },
  { id: 'role-pk', type: 'role', code: 'PK', label: 'Phó khoa', name: 'Phó khoa', active: true, sortOrder: 5 },
  { id: 'role-kt', type: 'role', code: 'KT', label: 'Khoa trưởng', name: 'Khoa trưởng', active: true, sortOrder: 6 },
];

/**
 * Lay danh muc theo loai (hoac tat ca)
 */
export async function getCategories(type) {
  const categoryType = type || 'all';
  if (!isFirebaseConfigured || !db) {
    return categoryType === 'all'
      ? DEFAULT_CATEGORIES
      : DEFAULT_CATEGORIES.filter((c) => c.type === categoryType);
  }

  try {
    const colRef = collection(db, CATEGORIES_COL);
    let q = query(colRef, orderBy('sortOrder', 'asc'));
    if (categoryType !== 'all') {
      q = query(colRef, where('type', '==', categoryType), orderBy('sortOrder', 'asc'));
    }

    const snap = await getDocs(q);
    if (snap.empty) {
      await seedDefaultCategories();
      return categoryType === 'all'
        ? DEFAULT_CATEGORIES
        : DEFAULT_CATEGORIES.filter((c) => c.type === categoryType);
    }

    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return list;
  } catch (error) {
    console.error('Loi khi lay danh muc:', error);
    return categoryType === 'all'
      ? DEFAULT_CATEGORIES
      : DEFAULT_CATEGORIES.filter((c) => c.type === categoryType);
  }
}

/**
 * Khoi tao danh muc mac dinh
 */
export async function seedDefaultCategories() {
  if (!isFirebaseConfigured || !db) return;

  try {
    for (const cat of DEFAULT_CATEGORIES) {
      await setDoc(doc(db, CATEGORIES_COL, cat.id), {
        ...cat,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (err) {
    console.error('Loi seed categories:', err);
  }
}

/**
 * Luu hoac cap nhat danh muc
 * Accepts: saveCategory(type, catData)
 */
export async function saveCategory(typeOrCatData, catDataArg) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase chua cau hinh');
  }

  // Support both saveCategory(catData) and saveCategory(type, catData)
  let catData;
  if (typeof typeOrCatData === 'string' && catDataArg) {
    catData = { ...catDataArg, type: typeOrCatData };
  } else {
    catData = typeOrCatData;
  }

  const catType = catData.type || 'unknown';
  const codeSlug = (catData.code || '').toLowerCase().replace(/[^a-z0-9]/g, '-') || Date.now().toString();
  const id = catData.id || (catType + '-' + codeSlug);

  const payload = {
    type: catType,
    code: (catData.code || '').trim(),
    label: (catData.label || catData.name || '').trim(),
    name: (catData.name || catData.label || '').trim(),
    active: catData.active !== false,
    sortOrder: Number(catData.sortOrder) || 1,
    updatedAt: new Date().toISOString(),
  };

  if (!catData.createdAt) {
    payload.createdAt = new Date().toISOString();
  }

  await setDoc(doc(db, CATEGORIES_COL, id), payload, { merge: true });
  return { id, ...payload };
}

/**
 * Bat/tat trang thai danh muc
 */
export async function toggleCategoryStatus(id, active) {
  if (!isFirebaseConfigured || !db) return false;

  await setDoc(doc(db, CATEGORIES_COL, id), {
    active,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  return true;
}

/**
 * Xoa danh muc
 * Accepts: deleteCategory(id) or deleteCategory(type, id)
 */
export async function deleteCategory(typeOrId, idArg) {
  if (!isFirebaseConfigured || !db) return false;

  const docId = idArg !== undefined ? idArg : typeOrId;
  await deleteDoc(doc(db, CATEGORIES_COL, docId));
  return true;
}
