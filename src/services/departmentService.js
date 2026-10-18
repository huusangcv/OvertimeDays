// src/services/departmentService.js
// Quản lý danh sách bộ phận của công ty trong Firestore
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

const DEPARTMENTS_COL = 'departments';

export const DEFAULT_DEPARTMENTS = [
  { id: 'cong-nghe', code: 'CNG', name: 'Công Nghệ', path: '/dept/cong-nghe', description: 'Kỹ thuật công nghệ và hỗ trợ hệ thống sản xuất.', icon: 'Cpu', accentColor: '#0284C7', accentBg: 'rgba(2, 132, 199, 0.08)', accentBorder: 'rgba(2, 132, 199, 0.25)', active: true, sortOrder: 1 },
  { id: 'sinh-quan', code: 'SQ', name: 'Sinh Quản', path: '/dept/sinh-quan', description: 'Quản lý kế hoạch, tiến độ và điều độ sản xuất.', icon: 'CalendarDays', accentColor: '#2563EB', accentBg: 'rgba(37, 99, 235, 0.08)', accentBorder: 'rgba(37, 99, 235, 0.25)', active: true, sortOrder: 2 },
  { id: 'thong-ke', code: 'TK', name: 'Thống Kê', path: '/dept/thong-ke', description: 'Tổng hợp sản lượng, dữ liệu và báo cáo.', icon: 'ChartNoAxesCombined', accentColor: '#7C3AED', accentBg: 'rgba(124, 58, 237, 0.08)', accentBorder: 'rgba(124, 58, 237, 0.25)', active: true, sortOrder: 3 },
  { id: 'post-processing', code: 'HXL', name: 'Hậu Xử Lý', path: '/post-processing', description: 'Các công đoạn xử lý, hoàn thiện sau đúc.', icon: 'Settings', accentColor: '#B91C1C', accentBg: 'rgba(185, 28, 28, 0.08)', accentBorder: 'rgba(185, 28, 28, 0.25)', active: true, sortOrder: 4 },
  { id: 'pre-processing', code: 'TXL', name: 'Trước Xử Lý', path: '/pre-processing', description: 'Các công đoạn chuẩn bị và xử lý trước khi hoàn thiện.', icon: 'ClipboardList', accentColor: '#EA580C', accentBg: 'rgba(234, 88, 12, 0.08)', accentBorder: 'rgba(234, 88, 12, 0.25)', active: true, sortOrder: 5 },
  { id: 'nhung-ho', code: 'NH', name: 'Nhúng Hồ', path: '/dept/nhung-ho', description: 'Nhúng hồ, rắc cát và tạo vỏ gốm.', icon: 'Layers3', accentColor: '#0D9488', accentBg: 'rgba(13, 148, 136, 0.08)', accentBorder: 'rgba(13, 148, 136, 0.25)', active: true, sortOrder: 6 },
  { id: 'to-ky-thuat', code: 'TKT', name: 'Tổ Kỹ Thuật', path: '/dept/to-ky-thuat', description: 'Bảo trì, sửa chữa và hỗ trợ kỹ thuật thiết bị.', icon: 'Wrench', accentColor: '#4F46E5', accentBg: 'rgba(79, 70, 229, 0.08)', accentBorder: 'rgba(79, 70, 229, 0.25)', active: true, sortOrder: 7 },
  { id: 'ke-toan', code: 'KT', name: 'Kế Toán', path: '/dept/ke-toan', description: 'Quản lý kế toán, tài chính và chi phí.', icon: 'Calculator', accentColor: '#059669', accentBg: 'rgba(5, 150, 105, 0.08)', accentBorder: 'rgba(5, 150, 105, 0.25)', active: true, sortOrder: 8 },
  { id: 'taro', code: 'TARO', name: 'Taro', path: '/dept/taro', description: 'Gia công lỗ ren và taro chi tiết.', icon: 'Drill', accentColor: '#D97706', accentBg: 'rgba(217, 119, 6, 0.08)', accentBorder: 'rgba(217, 119, 6, 0.25)', active: true, sortOrder: 9 },
  { id: 'van-cau', code: 'VC', name: 'Văn Cầu', path: '/dept/van-cau', description: 'Gia công hoặc xử lý sản phẩm van cầu theo nhiệm vụ thực tế của bộ phận.', icon: 'Gauge', accentColor: '#0891B2', accentBg: 'rgba(8, 145, 178, 0.08)', accentBorder: 'rgba(8, 145, 178, 0.25)', active: true, sortOrder: 10 },
  { id: 'chat-luong', code: 'QC', name: 'Chất Lượng', path: '/dept/chat-luong', description: 'Kiểm tra và kiểm soát chất lượng sản phẩm.', icon: 'ShieldCheck', accentColor: '#16A34A', accentBg: 'rgba(22, 163, 74, 0.08)', accentBorder: 'rgba(22, 163, 74, 0.25)', active: true, sortOrder: 11 },
  { id: 'ho-tro-san-xuat', code: 'HTSX', name: 'Hỗ Trợ Sản Xuất', path: '/dept/ho-tro-san-xuat', description: 'Hỗ trợ vật tư và hoạt động sản xuất.', icon: 'HandHelping', accentColor: '#6366F1', accentBg: 'rgba(99, 102, 241, 0.08)', accentBorder: 'rgba(99, 102, 241, 0.25)', active: true, sortOrder: 12 },
  { id: 'cong-trinh', code: 'CT', name: 'Công Trình', path: '/dept/cong-trinh', description: 'Thi công, sửa chữa và xây dựng.', icon: 'HardHat', accentColor: '#B45309', accentBg: 'rgba(180, 83, 9, 0.08)', accentBorder: 'rgba(180, 83, 9, 0.25)', active: true, sortOrder: 13 },
  { id: 'furnace', code: 'LO', name: 'Lò', path: '/furnace', description: 'Nấu chảy hợp kim và rót kim loại.', icon: 'Flame', accentColor: '#DC2626', accentBg: 'rgba(220, 38, 38, 0.08)', accentBorder: 'rgba(220, 38, 38, 0.25)', active: true, sortOrder: 14 },
  { id: 'sap', code: 'SAP', name: 'Sáp', path: '/dept/sap', description: 'Tạo mẫu sáp, lắp ráp cây sáp và sửa mẫu.', icon: 'Layers', accentColor: '#CA8A04', accentBg: 'rgba(202, 138, 4, 0.08)', accentBorder: 'rgba(202, 138, 4, 0.25)', active: true, sortOrder: 15 },
  { id: 'kho', code: 'KHO', name: 'Kho', path: '/dept/kho', description: 'Quản lý nguyên liệu, vật tư và thành phẩm.', icon: 'Warehouse', accentColor: '#475569', accentBg: 'rgba(71, 85, 105, 0.08)', accentBorder: 'rgba(71, 85, 105, 0.25)', active: true, sortOrder: 16 },
  { id: 'dong-goi', code: 'DG', name: 'Đóng Gói', path: '/dept/dong-goi', description: 'Đóng gói, dán nhãn và chuẩn bị xuất hàng.', icon: 'PackageCheck', accentColor: '#9333EA', accentBg: 'rgba(147, 51, 234, 0.08)', accentBorder: 'rgba(147, 51, 234, 0.25)', active: true, sortOrder: 17 },
  { id: 'cnc', code: 'CNC', name: 'CNC', path: '/dept/cnc', description: 'Gia công cơ khí chính xác.', icon: 'Cog', accentColor: '#0284C7', accentBg: 'rgba(2, 132, 199, 0.08)', accentBorder: 'rgba(2, 132, 199, 0.25)', active: true, sortOrder: 18 },
  { id: 'thu-mua', code: 'TM', name: 'Thu Mua', path: '/dept/thu-mua', description: 'Mua hàng và cung ứng.', icon: 'ShoppingCart', accentColor: '#059669', accentBg: 'rgba(5, 150, 105, 0.08)', accentBorder: 'rgba(5, 150, 105, 0.25)', active: true, sortOrder: 19 },
  { id: 'tong-vu', code: 'TV', name: 'Tổng Vụ', path: '/dept/tong-vu', description: 'Hành chính và quản lý dịch vụ nội bộ.', icon: 'ClipboardList', accentColor: '#64748B', accentBg: 'rgba(100, 116, 139, 0.08)', accentBorder: 'rgba(100, 116, 139, 0.25)', active: true, sortOrder: 20 },
  { id: 'an-toan', code: 'AT', name: 'An Toàn', path: '/dept/an-toan', description: 'An toàn lao động, phòng cháy chữa cháy và môi trường.', icon: 'HardHat', accentColor: '#EAB308', accentBg: 'rgba(234, 179, 8, 0.08)', accentBorder: 'rgba(234, 179, 8, 0.25)', active: true, sortOrder: 21 },
  { id: 'nhan-su', code: 'NS', name: 'Nhân Sự', path: '/dept/nhan-su', description: 'Tuyển dụng, hồ sơ và quản trị nhân sự.', icon: 'Users', accentColor: '#3B82F6', accentBg: 'rgba(59, 130, 246, 0.08)', accentBorder: 'rgba(59, 130, 246, 0.25)', active: true, sortOrder: 22 },
  { id: 'lop-hoc', code: 'LH', name: 'Lớp Học', path: '/dept/lop-hoc', description: 'Đào tạo và hướng dẫn quy trình công việc.', icon: 'GraduationCap', accentColor: '#10B981', accentBg: 'rgba(16, 185, 129, 0.08)', accentBorder: 'rgba(16, 185, 129, 0.25)', active: true, sortOrder: 23 },
  { id: 'khuon', code: 'KHUON', name: 'Khuôn', path: '/dept/khuon', description: 'Chế tạo, hiệu chỉnh và bảo dưỡng khuôn.', icon: 'Ruler', accentColor: '#6D28D9', accentBg: 'rgba(109, 40, 217, 0.08)', accentBorder: 'rgba(109, 40, 217, 0.25)', active: true, sortOrder: 24 },
];

/**
 * Lấy danh sách tất cả bộ phận (hoặc chỉ bộ phận đang active)
 */
export async function getDepartments({ activeOnly = false } = {}) {
  if (!isFirebaseConfigured || !db) {
    return activeOnly ? DEFAULT_DEPARTMENTS.filter(d => d.active) : DEFAULT_DEPARTMENTS;
  }

  try {
    const colRef = collection(db, DEPARTMENTS_COL);
    let q = query(colRef, orderBy('sortOrder', 'asc'));
    if (activeOnly) {
      q = query(colRef, where('active', '==', true), orderBy('sortOrder', 'asc'));
    }

    const snap = await getDocs(q);
    if (snap.empty) {
      // Seed mặc định lần đầu nếu Firestore chưa có
      await seedDefaultDepartments();
      return activeOnly ? DEFAULT_DEPARTMENTS.filter(d => d.active) : DEFAULT_DEPARTMENTS;
    }

    const list = snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    // Đảm bảo sortOrder
    list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return list;
  } catch (error) {
    console.error('Lỗi khi tải danh sách bộ phận:', error);
    return activeOnly ? DEFAULT_DEPARTMENTS.filter(d => d.active) : DEFAULT_DEPARTMENTS;
  }
}

/**
 * Lấy chi tiết 1 bộ phận theo id
 */
export async function getDepartmentById(id) {
  if (!isFirebaseConfigured || !db) {
    return DEFAULT_DEPARTMENTS.find(d => d.id === id) || null;
  }

  try {
    const docRef = doc(db, DEPARTMENTS_COL, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return DEFAULT_DEPARTMENTS.find(d => d.id === id) || null;
  } catch (error) {
    console.error('Lỗi khi lấy bộ phận:', error);
    return DEFAULT_DEPARTMENTS.find(d => d.id === id) || null;
  }
}

/**
 * Khởi tạo dữ liệu 3 bộ phận ban đầu nếu chưa có
 */
export async function seedDefaultDepartments() {
  if (!isFirebaseConfigured || !db) return;

  try {
    for (const dept of DEFAULT_DEPARTMENTS) {
      const docRef = doc(db, DEPARTMENTS_COL, dept.id);
      await setDoc(docRef, dept, { merge: true });
    }
  } catch (err) {
    console.error('Lỗi seed departments:', err);
  }
}

/**
 * Tạo mới hoặc cập nhật thông tin bộ phận
 */
export async function saveDepartment(deptData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase chưa được cấu hình');
  }

  const id = deptData.id || deptData.code?.toLowerCase().replace(/[^a-z0-9]/g, '-') || Date.now().toString();
  const path = deptData.path || (['furnace', 'pre-processing', 'post-processing'].includes(id) ? `/${id}` : `/dept/${id}`);

  const payload = {
    code: (deptData.code || '').trim().toUpperCase(),
    name: (deptData.name || '').trim(),
    description: (deptData.description || '').trim(),
    icon: deptData.icon || '🏢',
    accentColor: deptData.accentColor || '#B91C1C',
    accentBg: deptData.accentBg || 'rgba(185,28,28,0.06)',
    accentBorder: deptData.accentBorder || 'rgba(185,28,28,0.2)',
    active: deptData.active !== false,
    sortOrder: Number(deptData.sortOrder) || 1,
    path,
    updatedAt: new Date().toISOString(),
  };

  if (!deptData.createdAt) {
    payload.createdAt = new Date().toISOString();
  }

  const docRef = doc(db, DEPARTMENTS_COL, id);
  await setDoc(docRef, payload, { merge: true });
  return { id, ...payload };
}

/**
 * Bật/tắt trạng thái hoạt động của bộ phận
 */
export async function toggleDepartmentStatus(id, active) {
  if (!isFirebaseConfigured || !db) return false;

  const docRef = doc(db, DEPARTMENTS_COL, id);
  await setDoc(docRef, { active, updatedAt: new Date().toISOString() }, { merge: true });
  return true;
}

/**
 * Xóa bộ phận (chỉ cho phép khi không có dữ liệu nhân viên / lịch sử)
 */
export async function deleteDepartment(id) {
  if (!isFirebaseConfigured || !db) return false;

  // Kiểm tra an toàn: không cho xóa 3 bộ phận cốt lõi
  if (['furnace', 'pre-processing', 'post-processing'].includes(id)) {
    throw new Error('Không thể xóa 3 bộ phận mặc định của hệ thống. Bạn có thể chọn Tạm dừng (Deactivate).');
  }

  // Kiểm tra nhân viên thuộc bộ phận
  const empCol = collection(db, 'departments', id, 'employees');
  const empSnap = await getDocs(empCol);
  if (!empSnap.empty) {
    throw new Error(`Bộ phận còn ${empSnap.size} nhân viên. Vui lòng chuyển hoặc xóa nhân viên trước.`);
  }

  const docRef = doc(db, DEPARTMENTS_COL, id);
  await deleteDoc(docRef);
  return true;
}
