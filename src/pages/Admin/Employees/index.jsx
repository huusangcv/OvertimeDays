import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel,
  Select, MenuItem, Alert, CircularProgress, Tooltip,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Refresh as RefreshIcon, Block as BlockIcon, CheckCircle as ActiveIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { getAllEmployees, adminSaveEmployee, adminDeleteEmployee, adminToggleEmployeeActive } from '../../../services/adminEmployeeService';
import { getDepartments } from '../../../services/departmentService';
import { logAudit } from '../../../services/auditService';

const EMPTY_FORM = {
  id: '', name: '', role: 'CN', note: '', departmentId: '', active: true, userUid: '',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [dialogError, setDialogError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [emps, depts] = await Promise.all([
        getAllEmployees(filterDept),
        getDepartments({ activeOnly: false }),
      ]);
      setEmployees(emps);
      setDepartments(depts);
    } catch (err) {
      setError('Loi khi tai danh sach nhan vien: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, [filterDept]);

  useEffect(() => { loadData(); }, [loadData]);

  const displayed = employees.filter((e) => {
    if (filterStatus === 'active' && e.active === false) return false;
    if (filterStatus === 'inactive' && e.active !== false) return false;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      if (!e.name.toLowerCase().includes(q) && !e.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({ ...EMPTY_FORM, departmentId: filterDept === 'all' ? '' : filterDept });
    setDialogError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp);
    setFormData({
      id: emp.id || emp.employeeCode || '',
      name: emp.name || '',
      role: emp.role || 'CN',
      note: emp.note || '',
      departmentId: emp.departmentId || '',
      active: emp.active !== false,
      userUid: emp.userUid || '',
    });
    setDialogError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.id.trim() || !formData.name.trim() || !formData.departmentId) {
      setDialogError('Vui long nhap Ma NV, Ho ten va Phong ban.');
      return;
    }
    setSaving(true);
    setDialogError('');
    try {
      const originalDeptId = editingEmp ? editingEmp.departmentId : null;
      await adminSaveEmployee(
        { ...formData, createdAt: editingEmp ? editingEmp.createdAt : undefined },
        originalDeptId,
      );
      setSuccess(editingEmp ? 'Cap nhat nhan vien thanh cong!' : 'Them nhan vien thanh cong!');
      logAudit({
        action: editingEmp ? 'EDIT' : 'ADD',
        entity: 'employee',
        entityId: formData.id,
        entityLabel: formData.name,
        department: formData.departmentId,
        before: editingEmp ? { ...editingEmp } : null,
        after: { ...formData },
        note: (editingEmp ? 'Admin cập nhật nhân viên ' : 'Admin thêm nhân viên ') + formData.name + ' (' + formData.role + ')',
      });
      setDialogOpen(false);
      loadData();
    } catch (err) {
      setDialogError(err.message || 'Loi khi luu nhan vien');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (emp) => {
    const newActive = emp.active === false;
    if (!window.confirm((newActive ? 'Kich hoat lai' : 'Vo hieu hoa') + ' nhan vien "' + emp.name + '"?')) return;
    try {
      await adminToggleEmployeeActive(emp.departmentId, emp.id, newActive);
      setSuccess('Da cap nhat trang thai nhan vien!');
      loadData();
    } catch (err) {
      setError('Loi: ' + (err.message || ''));
    }
  };

  const handleDelete = async (emp) => {
    if (!window.confirm('Xoa nhan vien "' + emp.name + '"? Khong the hoan tac!')) return;
    try {
      await adminDeleteEmployee(emp.departmentId, emp.id);
      setSuccess('Da xoa nhan vien.');
      logAudit({
        action: 'DELETE',
        entity: 'employee',
        entityId: emp.id,
        entityLabel: emp.name,
        department: emp.departmentId,
        before: { ...emp },
        note: 'Admin xoá nhân viên ' + emp.name + ' (' + emp.id + ')',
      });
      loadData();
    } catch (err) {
      setError('Loi: ' + (err.message || ''));
    }
  };

  const getDeptName = (id) => {
    const d = departments.find((x) => x.id === id);
    return d ? d.name : id || '—';
  };

  const ROLES = ['TT', 'CT', 'NV', 'CN'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Quan ly Nhan vien
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tim kiem, loc va quan ly nhan vien toan cong ty.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} disabled={loading}>
            Lam moi
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
            Them nhan vien
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ p: 2, mb: 2, borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Phong ban</InputLabel>
          <Select value={filterDept} label="Phong ban" onChange={(e) => setFilterDept(e.target.value)}>
            <MenuItem value="all">Tat ca phong ban</MenuItem>
            {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Trang thai</InputLabel>
          <Select value={filterStatus} label="Trang thai" onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="all">Tat ca</MenuItem>
            <MenuItem value="active">Dang lam</MenuItem>
            <MenuItem value="inactive">Nghi viec</MenuItem>
          </Select>
        </FormControl>
        <TextField
          size="small"
          placeholder="Tim theo ten, ma NV..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5, color: 'text.disabled' }} /> }}
        />
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {displayed.length} nhan vien
          </Typography>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Ma NV</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ho va ten</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Chuc vu</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phong ban</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ghi chu</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trang thai</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Hanh dong</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : displayed.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Khong tim thay nhan vien nao.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : displayed.map((emp) => {
              const isActive = emp.active !== false;
              return (
                <TableRow key={emp.departmentId + '_' + emp.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{emp.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{emp.name}</TableCell>
                  <TableCell>
                    <Chip label={emp.role || 'CN'} size="small" variant="outlined"
                      color={emp.role === 'TT' ? 'primary' : emp.role === 'CT' ? 'secondary' : 'default'} />
                  </TableCell>
                  <TableCell>{getDeptName(emp.departmentId)}</TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">{emp.note || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    {isActive
                      ? <Chip icon={<ActiveIcon />} label="Dang lam" color="success" size="small" variant="outlined" />
                      : <Chip label="Nghi viec" color="default" size="small" />
                    }
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Chinh sua">
                      <IconButton color="primary" size="small" onClick={() => handleOpenEdit(emp)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={isActive ? 'Vo hieu hoa' : 'Kich hoat lai'}>
                      <IconButton color={isActive ? 'warning' : 'success'} size="small" onClick={() => handleToggle(emp)}>
                        {isActive ? <BlockIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xoa nhan vien">
                      <IconButton color="error" size="small" onClick={() => handleDelete(emp)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingEmp ? 'Chinh sua nhan vien' : 'Them nhan vien moi'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {dialogError && <Alert severity="error">{dialogError}</Alert>}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Ma nhan vien *"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value.trim() })}
                fullWidth
                disabled={Boolean(editingEmp)}
                placeholder="VD: NV001"
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Chuc vu</InputLabel>
                <Select value={formData.role} label="Chuc vu" onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Ho va ten *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Phong ban *</InputLabel>
              <Select
                value={formData.departmentId}
                label="Phong ban *"
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                <MenuItem value="">-- Chon phong ban --</MenuItem>
                {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Ghi chu"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Huy</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Dang luu...' : 'Luu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
