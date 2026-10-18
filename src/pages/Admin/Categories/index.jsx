import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel,
  Select, MenuItem, Alert, CircularProgress, Tooltip, Tabs, Tab,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { getCategories, saveCategory, deleteCategory } from '../../../services/categoryService';

const CATEGORY_TYPES = [
  { value: 'ot_type', label: 'Loai tang ca' },
  { value: 'shift', label: 'Ca lam viec' },
  { value: 'role', label: 'Chuc vu / Vi tri' },
];

const EMPTY_FORM = { code: '', label: '', sortOrder: 1, active: true };

export default function CategoriesPage() {
  const [tab, setTab] = useState('ot_type');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [dialogError, setDialogError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCategories(tab);
      setCategories(data);
    } catch (err) {
      setError('Loi khi tai danh muc: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setFormData({ ...EMPTY_FORM, sortOrder: categories.length + 1 });
    setDialogError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setFormData({
      code: cat.code || cat.id || '',
      label: cat.label || cat.name || '',
      sortOrder: cat.sortOrder || 1,
      active: cat.active !== false,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.label.trim()) {
      setDialogError('Vui long nhap Ten hien thi.');
      return;
    }
    setSaving(true);
    setDialogError('');
    try {
      const payload = {
        ...formData,
        id: editingCat ? editingCat.id : undefined,
        type: tab,
      };
      await saveCategory(tab, payload);
      setSuccess(editingCat ? 'Da cap nhat danh muc!' : 'Da them danh muc moi!');
      setDialogOpen(false);
      loadData();
    } catch (err) {
      setDialogError(err.message || 'Loi khi luu danh muc');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm('Xoa "' + (cat.label || cat.name) + '"? Khong the hoan tac!')) return;
    try {
      await deleteCategory(tab, cat.id);
      setSuccess('Da xoa danh muc.');
      loadData();
    } catch (err) {
      setError('Loi: ' + (err.message || ''));
    }
  };

  const currentType = CATEGORY_TYPES.find((t) => t.value === tab);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Quan ly Danh muc
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cau hinh loai tang ca, ca lam viec va chuc vu nhan vien.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} disabled={loading}>
            Lam moi
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
            Them danh muc
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #e2e8f0', px: 2 }}>
          {CATEGORY_TYPES.map((t) => (
            <Tab key={t.value} value={t.value} label={t.label} sx={{ fontWeight: 600 }} />
          ))}
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Ma / ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ten hien thi</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Thu tu</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trang thai</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Hanh dong</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Chua co danh muc nao trong nhom nay.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : categories.map((cat) => (
                <TableRow key={cat.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{cat.code || cat.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{cat.label || cat.name}</TableCell>
                  <TableCell align="center">{cat.sortOrder || '—'}</TableCell>
                  <TableCell>
                    {cat.active !== false
                      ? <Chip label="Hoat dong" color="success" size="small" variant="outlined" />
                      : <Chip label="An" color="default" size="small" />
                    }
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Chinh sua">
                      <IconButton color="primary" size="small" onClick={() => handleOpenEdit(cat)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xoa">
                      <IconButton color="error" size="small" onClick={() => handleDelete(cat)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingCat ? 'Chinh sua danh muc' : 'Them danh muc - ' + (currentType ? currentType.label : '')}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {dialogError && <Alert severity="error">{dialogError}</Alert>}
            <TextField
              label="Ma / Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              fullWidth
              disabled={Boolean(editingCat)}
              placeholder="VD: TCA_THUONG"
              helperText={editingCat ? 'Khong the doi ma sau khi tao' : 'De trong de tu dong tao'}
            />
            <TextField
              label="Ten hien thi *"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              fullWidth
              placeholder="VD: TCA THUONG"
            />
            <TextField
              label="Thu tu sap xep"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
              fullWidth
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
