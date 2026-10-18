import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel,
  Select, MenuItem, Alert, CircularProgress, Tooltip, Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Refresh as RefreshIcon, Block as BlockIcon, CheckCircle as ActiveIcon,
} from '@mui/icons-material';
import {
  getDepartments, saveDepartment, toggleDepartmentStatus, deleteDepartment,
} from '../../../services/departmentService';
import DepartmentIcon from '../../../components/common/DepartmentIcon';

const EMPTY_FORM = {
  code: '', name: '', description: '', icon: 'Flame',
  accentColor: '#B91C1C', sortOrder: 1, active: true,
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [dialogError, setDialogError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDepartments({ activeOnly: false });
      setDepartments(data);
    } catch (err) {
      setError('Loi khi tai danh sach bo phan: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({
      ...EMPTY_FORM,
      icon: String(departments.length + 1),
      sortOrder: departments.length + 1,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      code: dept.code || '',
      name: dept.name || '',
      description: dept.description || '',
      icon: dept.icon || '1',
      accentColor: dept.accentColor || '#B91C1C',
      sortOrder: dept.sortOrder || 1,
      active: dept.active !== false,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      setDialogError('Vui long nhap Ten bo phan va Ma bo phan.');
      return;
    }
    setSaving(true);
    setDialogError('');
    try {
      const payload = editingDept
        ? { ...formData, id: editingDept.id, createdAt: editingDept.createdAt }
        : { ...formData };
      await saveDepartment(payload);
      setSuccess(editingDept ? 'Da cap nhat bo phan thanh cong!' : 'Da tao bo phan moi thanh cong!');
      logAudit({
        action: editingDept ? 'EDIT' : 'ADD',
        entity: 'department',
        entityId: payload.id || payload.code,
        entityLabel: payload.name,
        department: payload.id || payload.code,
        before: editingDept ? { ...editingDept } : null,
        after: { ...payload },
        note: (editingDept ? 'Admin cập nhật bộ phận ' : 'Admin tạo bộ phận ') + payload.name,
      });
      setDialogOpen(false);
      loadData();
    } catch (err) {
      setDialogError(err.message || 'Loi khi luu bo phan');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (dept) => {
    const newActive = dept.active === false;
    const msg = newActive ? 'Kich hoat lai' : 'Tam dung';
    if (!window.confirm(msg + ' bo phan "' + dept.name + '"?')) return;
    try {
      await toggleDepartmentStatus(dept.id, newActive);
      setSuccess('Da cap nhat trang thai bo phan!');
      loadData();
    } catch (err) {
      setError('Loi cap nhat trang thai: ' + (err.message || ''));
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm('Xoa bo phan "' + dept.name + '"? Khong the hoan tac!')) return;
    try {
      await deleteDepartment(dept.id);
      setSuccess('Da xoa bo phan thanh cong.');
      logAudit({
        action: 'DELETE',
        entity: 'department',
        entityId: dept.id,
        entityLabel: dept.name,
        department: dept.id,
        before: { ...dept },
        note: 'Admin xoá bộ phận ' + dept.name,
      });
      loadData();
    } catch (err) {
      setError(err.message || 'Loi khi xoa bo phan');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Quan ly Bo phan
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tao, chinh sua, bat/tat bo phan trong he thong.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} disabled={loading}>
            Lam moi
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
            Them bo phan
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Ma</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ten bo phan</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mo ta</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Thu tu</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trang thai</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Hanh dong</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chua co bo phan nao.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : departments.map((dept) => {
              const isActive = dept.active !== false;
              return (
                <TableRow key={dept.id} hover>
                  <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#1e293b' }}>
                    {dept.code || dept.id}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 32, height: 32, borderRadius: '8px', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                          bgcolor: dept.accentBg || 'rgba(185,28,28,0.06)',
                          border: '1px solid', borderColor: dept.accentBorder || 'rgba(185,28,28,0.2)',
                        }}
                      >
                        <DepartmentIcon icon={dept.icon} deptId={dept.id} size={18} color={dept.accentColor || "#374151"} />
                      </Box>
                      <Typography fontWeight={600}>{dept.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 240 }}>
                      {dept.description || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{dept.sortOrder || '—'}</TableCell>
                  <TableCell>
                    {isActive
                      ? <Chip icon={<ActiveIcon />} label="Hoat dong" color="success" size="small" variant="outlined" />
                      : <Chip icon={<BlockIcon />} label="Tam dung" color="default" size="small" />
                    }
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Chinh sua">
                      <IconButton color="primary" size="small" onClick={() => handleOpenEdit(dept)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={isActive ? 'Tam dung' : 'Kich hoat lai'}>
                      <IconButton
                        color={isActive ? 'warning' : 'success'}
                        size="small"
                        onClick={() => handleToggleStatus(dept)}
                      >
                        {isActive ? <BlockIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    {!['furnace', 'pre-processing', 'post-processing'].includes(dept.id) && (
                      <Tooltip title="Xoa bo phan">
                        <IconButton color="error" size="small" onClick={() => handleDelete(dept)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingDept ? 'Chinh sua bo phan' : 'Tao bo phan moi'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {dialogError && <Alert severity="error">{dialogError}</Alert>}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Ma bo phan *"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                fullWidth
                disabled={Boolean(editingDept)}
                placeholder="VD: LO, TXL, SXL"
                helperText={editingDept ? 'Khong the thay doi ma sau khi tao' : ''}
              />
              <TextField
                label="Biểu tượng (Icon)"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                sx={{ width: 160 }}
                placeholder="Flame, Cpu..."
                helperText="Tên icon Lucide hoặc emoji"
              />
            </Box>

            <TextField
              label="Ten bo phan *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              placeholder="VD: Lo, Truoc Xu Ly"
            />

            <TextField
              label="Mo ta"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Thu tu sap xep"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                sx={{ width: 160 }}
              />
              <TextField
                label="Mau chinh"
                type="color"
                value={formData.accentColor}
                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                sx={{ width: 120 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(formData.active)}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                }
                label="Dang hoat dong"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Huy</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Dang luu...' : 'Luu bo phan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
