// src/hooks/useEmployeeManager.js
import { useState, useMemo, useCallback, useEffect } from 'react';
import { MAX_ROWS } from '../constants';
import * as historyService from '../services/historyService';
import * as employeeService from '../services/employeeService';
import { logAudit } from '../services/auditService';

// MAX_ROWS vẫn cần để tính pageCount khi lưu lịch sử.

/**
 * Hook quản lý nhân viên và đăng ký tăng ca.
 * @param {Object} options
 * @param {Array}  options.initialEmployeeList - Danh sách nhân viên ban đầu của bộ phận
 * @param {string} options.departmentName      - Tên bộ phận
 */
export function useEmployeeManager({ initialEmployeeList = [], departmentId = 'default', departmentName = '' } = {}) {


  const [employees, setEmployees] = useState(initialEmployeeList);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [otDate, setOtDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [otType, setOtType] = useState('TCA THƯỜNG');
  const [otShift, setOtShift] = useState('day'); // 'day' | 'night'
  const [otTimes, setOtTimes] = useState({});
  const [notes, setNotes] = useState({});
  const [otHistory, setOtHistory] = useState([]);

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

  const refreshHistory = useCallback(async () => {
    const history = await historyService.getHistory(departmentId);
    setOtHistory(history);
  }, [departmentId]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapDepartmentData() {
      setEmployeesLoading(true);
      try {
        const remoteEmployees = await employeeService.loadEmployeesForDepartment(
          departmentId,
          initialEmployeeList,
        );
        if (!cancelled) {
          setEmployees(remoteEmployees ?? initialEmployeeList);
        }
        await refreshHistory();
      } catch (error) {
        console.error('Lỗi tải dữ liệu bộ phận:', error);
        if (!cancelled) {
          setEmployees(initialEmployeeList);
          showToast('Không tải được dữ liệu cloud, dùng dữ liệu cục bộ', 'warning');
        }
      } finally {
        if (!cancelled) {
          setEmployeesLoading(false);
        }
      }
    }

    bootstrapDepartmentData();
    return () => {
      cancelled = true;
    };
  }, [departmentId, initialEmployeeList, refreshHistory, showToast]);

  // Derived
  const POSITION_RANK = { KT: 1, PK: 2, TT: 3, TP: 4, CT: 5, NV: 6, CN: 7 };
  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return employees
      .filter(e => e.name.toLowerCase().includes(q) || e.id.includes(q))
      .sort((a, b) => {
        const ra = POSITION_RANK[a.role] ?? 8;
        const rb = POSITION_RANK[b.role] ?? 8;
        if (ra !== rb) return ra - rb;
        return a.name.localeCompare(b.name, 'vi');
      });
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
  const ROLE_PRIORITY = { KT: 1, PK: 2, TT: 3, TP: 4, CT: 5, NV: 6, CN: 7 };

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

  const handleShiftChange = useCallback((newShift) => {
    setOtShift(newShift);
    if (departmentId === 'furnace') {
      const defaultTime = newShift === 'day' ? '15h30 - ' : '4h00 - ';
      setOtTimes(times => {
        const newTimes = { ...times };
        for (const id of selectedIds) {
          newTimes[id] = defaultTime;
        }
        return newTimes;
      });
    }
  }, [departmentId, selectedIds]);

  // Không giới hạn số lượng NV — phân trang tự động xử lý khi vượt MAX_ROWS
  const toggleEmp = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (departmentId === 'furnace' || departmentId === 'pre-processing') {
          const defaultTime = departmentId === 'furnace'
            ? (otShift === 'day' ? '15h30 - ' : '4h00 - ')
            : '16h30 - ';
          setOtTimes(times => {
            if (!times[id]) {
              return { ...times, [id]: defaultTime };
            }
            return times;
          });
        }
      }
      return next;
    });
  }, [departmentId, otShift]);

  const toggleAll = useCallback((checked) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) {
        // Chọn tất cả — không giới hạn số lượng
        for (const emp of filteredEmployees) {
          next.add(emp.id);
        }
        if (departmentId === 'furnace' || departmentId === 'pre-processing') {
          const defaultTime = departmentId === 'furnace'
            ? (otShift === 'day' ? '15h30 - ' : '4h00 - ')
            : '16h30 - ';
          setOtTimes(times => {
            const newTimes = { ...times };
            for (const emp of filteredEmployees) {
              if (!newTimes[emp.id]) {
                newTimes[emp.id] = defaultTime;
              }
            }
            return newTimes;
          });
        }
      } else {
        for (const emp of filteredEmployees) {
          next.delete(emp.id);
        }
      }
      return next;
    });
  }, [filteredEmployees, departmentId, otShift]);

  const requestDelete = useCallback((id) => {
    setDeletingId(id);
    setConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingId) return;
    setEmployees(prev => prev.filter(e => e.id !== deletingId));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(deletingId);
      return next;
    });
    try {
      const targetEmp = employees.find(e => e.id === deletingId);
      await employeeService.removeEmployee(departmentId, deletingId);
      showToast('Đã xóa nhân viên');
      logAudit({
        action: 'DELETE',
        entity: 'employee',
        entityId: deletingId,
        entityLabel: targetEmp?.name || deletingId,
        department: departmentId,
        before: targetEmp || null,
        note: `Xoá nhân viên ${targetEmp?.name || deletingId} khỏi bộ phận ${departmentName || departmentId}`,
      });
    } catch (error) {
      console.error('Lỗi xóa nhân viên trên Firebase:', error);
      showToast('Đã xóa trên màn hình nhưng chưa đồng bộ cloud', 'warning');
    }
    setConfirmOpen(false);
    setDeletingId(null);
  }, [deletingId, departmentId, employees, departmentName, showToast]);

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

  const saveEmp = useCallback(async () => {
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
      const newEmployee = { id: trimId, name: trimName, role };
      setEmployees(prev => [...prev, newEmployee]);
      try {
        await employeeService.upsertEmployee(departmentId, newEmployee);
      } catch (error) {
        console.error('Lỗi lưu nhân viên Firebase:', error);
        showToast('Đã thêm cục bộ nhưng chưa đồng bộ cloud', 'warning');
      }
      showToast('Đã thêm nhân viên');
      logAudit({
        action: 'ADD',
        entity: 'employee',
        entityId: trimId,
        entityLabel: trimName,
        department: departmentId,
        after: newEmployee,
        note: `Thêm nhân viên ${trimName} (${role}) vào bộ phận ${departmentName || departmentId}`,
      });
    } else {
      if (trimId !== editingId && employees.find(e => e.id === trimId)) {
        showToast('Mã NV đã tồn tại', 'error');
        return;
      }
      const oldEmp = employees.find(e => e.id === editingId);
      const updatedEmployee = { id: trimId, name: trimName, role };
      setEmployees(prev =>
        prev.map(e => e.id === editingId ? { ...e, ...updatedEmployee } : e)
      );
      if (trimId !== editingId && selectedIds.has(editingId)) {
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(editingId);
          next.add(trimId);
          return next;
        });
        try {
          await employeeService.removeEmployee(departmentId, editingId);
        } catch (error) {
          console.error('Lỗi xóa mã NV cũ trên Firebase:', error);
        }
      }
      try {
        await employeeService.upsertEmployee(departmentId, updatedEmployee);
      } catch (error) {
        console.error('Lỗi cập nhật nhân viên Firebase:', error);
        showToast('Đã cập nhật cục bộ nhưng chưa đồng bộ cloud', 'warning');
      }
      showToast('Đã cập nhật');
      logAudit({
        action: 'EDIT',
        entity: 'employee',
        entityId: trimId,
        entityLabel: trimName,
        department: departmentId,
        before: oldEmp || null,
        after: updatedEmployee,
        note: `Cập nhật thông tin nhân viên ${trimName} (${role})`,
      });
    }
    closeModal();
  }, [modalData, editingId, employees, departmentId, selectedIds, showToast, closeModal]);

  const doPrint = useCallback(async () => {
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

    const saved = await historyService.saveHistory(snapshotData);
    if (!saved) {
      showToast('Không lưu được lịch sử in', 'error');
      return;
    }
    await refreshHistory();

    logAudit({
      action: 'PRINT',
      entity: 'overtime',
      entityId: snapshotData.id,
      entityLabel: `${departmentName || departmentId} - Ngày ${otDate} (${otType})`,
      department: departmentId,
      after: {
        id: snapshotData.id,
        date: otDate,
        shift: otType,
        count: selectedIds.size,
      },
      note: `In biểu tăng ca ${departmentName || departmentId} (${selectedIds.size} người)`,
    });

    // 2. Gọi lệnh in
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

  const deleteHistoryRecord = useCallback(async (id) => {
    const ok = await historyService.deleteHistory(id, departmentId);
    if (ok) {
      await refreshHistory();
      showToast('Đã xóa biểu khỏi lịch sử');
      logAudit({
        action: 'DELETE',
        entity: 'history',
        entityId: id,
        entityLabel: `Biểu tăng ca #${id}`,
        department: departmentId,
        note: `Xoá biểu lịch sử #${id}`,
      });
    }
  }, [departmentId, refreshHistory, showToast]);

  const clearAllHistory = useCallback(async () => {
    const ok = await historyService.clearHistory(departmentId);
    if (ok) {
      await refreshHistory();
      showToast('Đã xóa toàn bộ lịch sử bộ phận');
    }
  }, [departmentId, refreshHistory, showToast]);

  return {
    // state
    employees, employeesLoading, selectedIds, activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    otDate, setOtDate, otType, setOtType,
    otShift, setOtShift: handleShiftChange,
    otTimes, setEmployeeTime, notes, setNote, otHistory, loadHistory, deleteHistoryRecord, clearAllHistory,
    modalOpen, editingId, modalData, setModalData,
    confirmOpen, deletingId,
    snackbar, closeSnackbar, showToast,
    // derived
    filteredEmployees, isSun, getDateStr, deptName, selArr,
    // handlers
    toggleEmp, toggleAll,
    requestDelete, confirmDelete, cancelDelete,
    openAdd, openEdit, closeModal, saveEmp,
    doPrint, resetSelection,
  };
}
