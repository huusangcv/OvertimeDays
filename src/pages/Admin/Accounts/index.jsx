import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  SupervisorAccount as RoleIcon,
} from '@mui/icons-material';
import { getAccounts, updateUserRole, toggleUserStatus } from '../../../services/accountService';
import { getDepartments } from '../../../services/departmentService';
import { useAuth } from '../../../context/AuthContext';
import { logAudit } from '../../../services/auditService';

export default function AccountsPage() {
  const { user: currentUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [role, setRole] = useState('user');
  const [departmentId, setDepartmentId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [accs, depts] = await Promise.all([
        getAccounts(),
        getDepartments({ activeOnly: false }),
      ]);
      setAccounts(accs);
      setDepartments(depts);
    } catch (err) {
      setError('Lỗi khi tải danh sách tài khoản: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (acc) => {
    setSelectedAccount(acc);
    setRole(acc.role || 'user');
    setDepartmentId(acc.departmentId || '');
    setOpenDialog(true);
  };

  const handleSaveRole = async () => {
    if (!selectedAccount) return;
    setSaving(true);
    setError('');
    try {
      await updateUserRole(selectedAccount.uid || selectedAccount.id, role, departmentId || null);
      setSuccess('Cập nhật phân quyền tài khoản thành công!');
      logAudit({
        action: 'GRANT_ROLE',
        entity: 'account',
        entityId: selectedAccount.uid || selectedAccount.id,
        entityLabel: selectedAccount.email || selectedAccount.displayName || 'Tài khoản',
        department: departmentId || null,
        before: { role: selectedAccount.role, departmentId: selectedAccount.departmentId },
        after: { role, departmentId: departmentId || null },
        note: `Phân quyền ${role} cho tài khoản ${selectedAccount.email}`,
      });
      setOpenDialog(false);
      loadData();
    } catch (err) {
      setError('Lỗi khi cập nhật quyền: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (acc) => {
    if (acc.uid === currentUser?.uid) {
      alert('Bạn không thể tự vô hiệu hoá tài khoản của chính mình!');
      return;
    }
    const currentActive = acc.isActive !== false;
    const confirmMsg = currentActive
      ? `Bạn có chắc muốn vô hiệu hoá tài khoản "${acc.email}"?`
      : `Bạn có muốn kích hoạt lại tài khoản "${acc.email}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await toggleUserStatus(acc.uid || acc.id, !currentActive);
      setSuccess(`Đã ${currentActive ? 'khoá' : 'mở khoá'} tài khoản ${acc.email}`);
      logAudit({
        action: currentActive ? 'DEACTIVATE' : 'ACTIVATE',
        entity: 'account',
        entityId: acc.uid || acc.id,
        entityLabel: acc.email || acc.displayName || 'Tài khoản',
        before: { active: currentActive },
        after: { active: !currentActive },
        note: `${currentActive ? 'Khoá' : 'Kích hoạt lại'} tài khoản ${acc.email}`,
      });
      loadData();
    } catch (err) {
      setError('Lỗi cập nhật trạng thái: ' + (err.message || ''));
    }
  };

  const getDeptName = (deptId) => {
    if (!deptId) return 'Tất cả / Quản trị viên';
    const dept = departments.find((d) => d.id === deptId);
    return dept ? dept.name : deptId;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Quản lý tài khoản & Phân quyền
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Xem danh sách tài khoản hệ thống, gán vai trò quản trị hoặc giới hạn phòng ban.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          disabled={loading}
        >
          Làm mới
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Tài khoản / Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tên hiển thị</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vai trò</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phòng ban phân quyền</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Đang tải danh sách tài khoản...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có tài khoản nào được lưu trữ trong danh sách người dùng.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((acc) => {
                const isActive = acc.isActive !== false;
                const isCurrent = acc.uid === currentUser?.uid;
                return (
                  <TableRow key={acc.id || acc.uid} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {acc.email}
                      {isCurrent && (
                        <Chip
                          label="Bạn"
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{acc.displayName || acc.name || '—'}</TableCell>
                    <TableCell>
                      {acc.role === 'admin' ? (
                        <Chip label="Quản trị viên" color="error" size="small" />
                      ) : acc.role === 'manager' ? (
                        <Chip label="Quản lý bộ phận" color="warning" size="small" />
                      ) : (
                        <Chip label="Nhân viên" variant="outlined" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{getDeptName(acc.departmentId)}</TableCell>
                    <TableCell>
                      {isActive ? (
                        <Chip
                          icon={<ActiveIcon />}
                          label="Hoạt động"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<BlockIcon />}
                          label="Đã khoá"
                          color="default"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Chỉnh sửa quyền">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenEdit(acc)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!isCurrent && (
                        <Tooltip title={isActive ? 'Vô hiệu hoá tài khoản' : 'Kích hoạt lại'}>
                          <IconButton
                            color={isActive ? 'error' : 'success'}
                            size="small"
                            onClick={() => handleToggleStatus(acc)}
                          >
                            {isActive ? <BlockIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Role Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <RoleIcon color="primary" />
          Phân quyền tài khoản
        </DialogTitle>
        <DialogContent dividers>
          {selectedAccount && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Tài khoản: {selectedAccount.email}
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Vai trò</InputLabel>
                <Select
                  value={role}
                  label="Vai trò"
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="admin">Quản trị viên hệ thống (Admin)</MenuItem>
                  <MenuItem value="manager">Quản lý bộ phận (Manager)</MenuItem>
                  <MenuItem value="user">Người dùng thông thường (User)</MenuItem>
                </Select>
              </FormControl>

              {role !== 'admin' && (
                <FormControl fullWidth>
                  <InputLabel>Phòng ban chỉ định</InputLabel>
                  <Select
                    value={departmentId}
                    label="Phòng ban chỉ định"
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    <MenuItem value="">-- Tất cả / Chưa chỉ định --</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={saving}>
            Huỷ
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveRole}
            disabled={saving}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
