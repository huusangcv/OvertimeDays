// src/hooks/useEmployeeManager.js
import { useState, useMemo, useCallback } from 'react';
// MAX_ROWS không còn dùng trong hook — việc giới hạn đã được chuyển
// sang phân trang (PreviewPanel). Thêm bao nhiêu NV cũng tự thêm trang mới.

/**
 * Hook quản lý nhân viên và đăng ký tăng ca.
 * @param {Object} options
 * @param {Array}  options.initialEmployeeList - Danh sách nhân viên ban đầu của bộ phận
 * @param {string} options.departmentId        - ID bộ phận (dùng làm key localStorage)
 */
export function useEmployeeManager({ initialEmployeeList = [], departmentId = 'default' } = {}) {
  // Khóa localStorage riêng theo từng bộ phận để lịch sử không bị lẫn
  const HISTORY_KEY = `otHistory_${departmentId}`;

  const [employees, setEmployees] = useState(initialEmployeeList);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [otDate, setOtDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [otType, setOtType] = useState('TCA THƯỜNG');
  const [otTimes, setOtTimes] = useState({});
  const [otHistory, setOtHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalData, setModalData] = useState({ id: '', name: '', role: 'CN' });

  // Confirm delete dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Snackbar / Toast
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showToast = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Derived
  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return employees.filter(e => e.name.toLowerCase().includes(q) || e.id.includes(q));
  }, [searchQuery, employees]);

  const isSun = otType === 'CHỦ NHẬT';

  const getDateStr = useCallback(() => {
    if (!otDate) return 'Ngày ___ tháng ___ năm ______';
    const [y, m, d] = otDate.split('-');
    return `Ngày ${parseInt(d)} tháng ${parseInt(m)} năm ${y}`;
  }, [otDate]);

  // deptName không còn hard-code — được truyền vào từ bên ngoài qua prop departmentName
  // Giữ biến này để tương thích với DocumentSheet (PDF template dùng chung)
  const deptName = departmentId;

  // Sort priorities for roles
  const ROLE_PRIORITY = { TT: 1, CT: 2, NV: 3, CN: 4 };

  const selArr = useMemo(() => {
    const selected = employees.filter(e => selectedIds.has(e.id));
    return selected.sort((a, b) => {
      const pA = ROLE_PRIORITY[a.role] || 5;
      const pB = ROLE_PRIORITY[b.role] || 5;
      return pA - pB;
    });
  }, [employees, selectedIds]);

  // Handlers
  // Không giới hạn số lượng NV — phân trang tự động xử lý khi vượt MAX_ROWS
  const toggleEmp = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback((checked) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) {
        // Chọn tất cả — không giới hạn số lượng
        for (const emp of filteredEmployees) {
          next.add(emp.id);
        }
      } else {
        for (const emp of filteredEmployees) {
          next.delete(emp.id);
        }
      }
      return next;
    });
  }, [filteredEmployees]);

  const requestDelete = useCallback((id) => {
    setDeletingId(id);
    setConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deletingId) return;
    setEmployees(prev => prev.filter(e => e.id !== deletingId));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(deletingId);
      return next;
    });
    showToast('Đã xóa nhân viên');
    setConfirmOpen(false);
    setDeletingId(null);
  }, [deletingId, showToast]);

  const cancelDelete = useCallback(() => {
    setConfirmOpen(false);
    setDeletingId(null);
  }, []);

  const openAdd = useCallback(() => {
    setEditingId(null);
    setModalData({ id: '', name: '', role: 'CN' });
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((id) => {
    const emp = employees.find(x => x.id === id);
    if (emp) {
      setEditingId(id);
      setModalData({ id: emp.id, name: emp.name, role: emp.role || 'CN' });
      setModalOpen(true);
    }
  }, [employees]);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const saveEmp = useCallback(() => {
    const { id, name, role } = modalData;
    const trimId = id.trim();
    const trimName = name.trim();
    if (!trimId || !trimName) {
      showToast('Vui lòng nhập đủ thông tin', 'error');
      return;
    }
    if (!editingId) {
      if (employees.find(e => e.id === trimId)) {
        showToast('Mã NV đã tồn tại', 'error');
        return;
      }
      setEmployees(prev => [...prev, { id: trimId, name: trimName, role }]);
      showToast('Đã thêm nhân viên');
    } else {
      if (trimId !== editingId && employees.find(e => e.id === trimId)) {
        showToast('Mã NV đã tồn tại', 'error');
        return;
      }
      setEmployees(prev =>
        prev.map(e => e.id === editingId ? { ...e, id: trimId, name: trimName, role } : e)
      );
      if (trimId !== editingId && selectedIds.has(editingId)) {
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(editingId);
          next.add(trimId);
          return next;
        });
      }
      showToast('Đã cập nhật');
    }
    closeModal();
  }, [modalData, editingId, employees, showToast, closeModal]);

  const doPrint = useCallback(() => {
    if (selectedIds.size === 0) {
      showToast('Vui lòng chọn ít nhất 1 nhân viên', 'warning');
      return;
    }
    window.print();
  }, [selectedIds, showToast]);

  const resetSelection = useCallback(() => {
    setSelectedIds(new Set());
    setOtTimes({});
    showToast('Đã xóa tất cả lựa chọn');
  }, [showToast]);

  const setEmployeeTime = useCallback((id, time) => {
    setOtTimes(prev => ({ ...prev, [id]: time }));
  }, []);

  const saveHistory = useCallback(() => {
    if (selectedIds.size === 0) {
      showToast('Không có nhân viên nào được chọn để lưu', 'warning');
      return;
    }
    const newRecord = {
      id: Date.now().toString(),
      date: otDate,
      type: otType,
      selectedIds: Array.from(selectedIds),
      otTimes,
      timestamp: new Date().toISOString(),
    };
    // Lưu lịch sử vào key riêng của bộ phận
    setOtHistory(prev => {
      const next = [newRecord, ...prev];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
    showToast('Đã lưu biểu tăng ca');
  }, [otDate, otType, selectedIds, otTimes, showToast, HISTORY_KEY]);

  const loadHistory = useCallback((record) => {
    setOtDate(record.date || new Date().toISOString().split('T')[0]);
    setOtType(record.type || 'TCA THƯỜNG');
    setSelectedIds(new Set(record.selectedIds || []));
    setOtTimes(record.otTimes || {});
    showToast('Đã tải lại lịch sử');
  }, [showToast]);

  const deleteHistory = useCallback((id) => {
    setOtHistory(prev => {
      const next = prev.filter(r => r.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
    showToast('Đã xóa lịch sử');
  }, [showToast, HISTORY_KEY]);

  return {
    // state
    employees, selectedIds, activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    otDate, setOtDate, otType, setOtType,
    otTimes, setEmployeeTime, otHistory, saveHistory, loadHistory, deleteHistory,
    modalOpen, editingId, modalData, setModalData,
    confirmOpen, deletingId,
    snackbar, closeSnackbar,
    // derived
    filteredEmployees, isSun, getDateStr, deptName, selArr,
    // handlers
    toggleEmp, toggleAll,
    requestDelete, confirmDelete, cancelDelete,
    openAdd, openEdit, closeModal, saveEmp,
    doPrint, resetSelection,
  };
}
