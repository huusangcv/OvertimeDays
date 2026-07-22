// src/hooks/useEmployeeManager.js
import { useState, useMemo, useCallback, useEffect } from 'react';
import { MAX_ROWS } from '../constants';
import * as historyService from '../services/historyService';

// MAX_ROWS vẫn cần để tính pageCount khi lưu lịch sử.

/**
 * Hook quản lý nhân viên và đăng ký tăng ca.
 * @param {Object} options
 * @param {Array}  options.initialEmployeeList - Danh sách nhân viên ban đầu của bộ phận
 * @param {string} options.departmentName      - Tên bộ phận
 */
export function useEmployeeManager({ initialEmployeeList = [], departmentId = 'default', departmentName = '' } = {}) {

  const [employees, setEmployees] = useState(initialEmployeeList);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [otDate, setOtDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [otType, setOtType] = useState('TCA THƯỜNG');
  const [otTimes, setOtTimes] = useState({});
  const [notes, setNotes] = useState({});
  const [otHistory, setOtHistory] = useState(() => historyService.getHistory(departmentId));

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
      
      if (pA !== pB) {
        return pA - pB;
      }
      
      // Nếu cùng chức vụ là Công Nhân (CN) thì sắp xếp theo thời gian tăng ca
      const isAWorker = !a.role || a.role.toUpperCase() === 'CN';
      const isBWorker = !b.role || b.role.toUpperCase() === 'CN';
      
      if (isAWorker && isBWorker) {
        const timeA = otTimes[a.id] || '';
        const timeB = otTimes[b.id] || '';
        if (timeA !== timeB) {
          return timeA.localeCompare(timeB);
        }
        
        // Thêm sắp xếp theo ghi chú nếu thời gian giống nhau
        const noteA = notes[`emp-${a.id}`] !== undefined ? notes[`emp-${a.id}`] : (a.note || '');
        const noteB = notes[`emp-${b.id}`] !== undefined ? notes[`emp-${b.id}`] : (b.note || '');
        if (noteA !== noteB) {
          return noteA.localeCompare(noteB);
        }
      }
      
      return 0; // Giữ nguyên thứ tự nếu không phải CN hoặc thời gian/ghi chú giống nhau
    });
  }, [employees, selectedIds, otTimes, notes]);

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

  const refreshHistory = useCallback(() => {
    setOtHistory(historyService.getHistory(departmentId));
  }, [departmentId]);

  const doPrint = useCallback(() => {
    if (selectedIds.size === 0) {
      showToast('Vui lòng chọn ít nhất 1 nhân viên', 'warning');
      return;
    }

    // 1. Lưu snapshot trước khi in
    const snapshotData = {
      id: Date.now().toString(),
      departmentId,
      departmentName,
      createdAt: new Date().toISOString(),
      date: otDate,
      shift: otType,
      reason: '',
      employeeCount: selectedIds.size,
      employees: selArr, // Lưu toàn bộ data NV đã chọn
      formData: { otTimes },
      pageCount: Math.ceil(selectedIds.size / MAX_ROWS) || 1,
      version: 1,
    };

    historyService.saveHistory(snapshotData);
    refreshHistory();

    // 2. Gọi lệnh in
    // Cần 1 khoảng delay nhỏ để DOM render lại nhãn lịch sử nếu cần thiết
    setTimeout(() => {
      window.print();
    }, 100);
  }, [selectedIds, showToast, departmentId, departmentName, otDate, otType, selArr, otTimes, refreshHistory]);

  const resetSelection = useCallback(() => {
    setSelectedIds(new Set());
    setOtTimes({});
    showToast('Đã xóa tất cả lựa chọn');
  }, [showToast]);

  const setEmployeeTime = useCallback((id, time) => {
    setOtTimes(prev => ({ ...prev, [id]: time }));
  }, []);

  const setNote = useCallback((rowKey, value) => {
    setNotes(prev => ({ ...prev, [rowKey]: value }));
  }, []);

  const loadHistory = useCallback((record) => {
    // Không dùng để load vào form sửa nữa, chức năng này được thay thế bằng xem read-only
    showToast('Bản ghi lịch sử ở chế độ chỉ đọc (Read-only)', 'info');
  }, [showToast]);

  const deleteHistoryRecord = useCallback((id) => {
    if (historyService.deleteHistory(id)) {
      refreshHistory();
      showToast('Đã xóa biểu khỏi lịch sử');
    }
  }, [refreshHistory, showToast]);

  const clearAllHistory = useCallback(() => {
    if (historyService.clearHistory(departmentId)) {
      refreshHistory();
      showToast('Đã xóa toàn bộ lịch sử bộ phận');
    }
  }, [departmentId, refreshHistory, showToast]);

  return {
    // state
    employees, selectedIds, activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    otDate, setOtDate, otType, setOtType,
    otTimes, setEmployeeTime, notes, setNote, otHistory, loadHistory, deleteHistoryRecord, clearAllHistory,
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
