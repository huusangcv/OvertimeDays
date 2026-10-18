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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Business as DeptIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { getOvertimes, deleteOvertimeRecord, updateOvertimeStatus } from '../../../services/overtimeAdminService';
import { getDepartments } from '../../../services/departmentService';

export default function OvertimesPage() {
  const [records, setRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [deptFilter, setDeptFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // View modal state
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadDepartments();
    loadOvertimes();
  }, []);

  const loadDepartments = async () => {
    try {
      const depts = await getDepartments({ activeOnly: false });
      setDepartments(depts);
    } catch (err) {
      console.error('Failed to load depts:', err);
    }
  };

  const loadOvertimes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOvertimes({
        departmentId: deptFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        keyword: searchKeyword || undefined,
      });
      setRecords(data);
    } catch (err) {
      setError('Lỗi khi tải danh sách tăng ca: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    loadOvertimes();
  };

  const handleResetFilter = () => {
    setDeptFilter('');
    setStartDate('');
    setEndDate('');
    setSearchKeyword('');
    setTimeout(() => {
      loadOvertimes();
    }, 50);
  };

  const handleOpenDetail = (record) => {
    setSelectedRecord(record);
    setViewDialog(true);
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Bạn có chắc muốn xoá phiếu tăng ca ngày "${record.date || record.id}"? Thao tác này không thể hoàn tác!`)) {
      return;
    }
    try {
      await deleteOvertimeRecord(record.id);
      setSuccess('Đã xoá phiếu tăng ca thành công.');
      logAudit({
        action: 'DELETE',
        entity: 'overtime',
        entityId: record.id,
        entityLabel: `Phiếu ngày ${record.date || record.id}`,
        department: record.departmentId,
        before: { date: record.date, shift: record.shift, count: record.employeeCount },
        note: `Admin xoá phiếu tăng ca ngày ${record.date} của ${getDeptName(record.departmentId)}`,
      });
      loadOvertimes();
    } catch (err) {
      setError('Lỗi khi xoá phiếu: ' + (err.message || ''));
    }
  };

  const getDeptName = (deptId) => {
    if (!deptId) return 'Không rõ';
    const dept = departments.find((d) => d.id === deptId);
    return dept ? dept.name : deptId;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Quản lý hồ sơ tăng ca toàn công ty
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tra cứu, kiểm tra danh sách nhân sự làm thêm giờ và quản lý các đợt tăng ca theo từng bộ phận.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadOvertimes}
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

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Bộ lọc & Tìm kiếm
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Phòng ban</InputLabel>
            <Select
              value={deptFilter}
              label="Phòng ban"
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <MenuItem value="">-- Tất cả phòng ban --</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Từ ngày"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 160 }}
          />

          <TextField
            label="Đến ngày"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 160 }}
          />

          <TextField
            label="Tìm kiếm người tạo / ghi chú"
            size="small"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Từ khoá..."
            sx={{ minWidth: 220 }}
          />

          <Button variant="contained" onClick={handleApplyFilter} disabled={loading}>
            Áp dụng
          </Button>
          <Button variant="text" color="inherit" onClick={handleResetFilter}>
            Xoá bộ lọc
          </Button>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Ngày tăng ca</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phòng ban</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Thời gian / Khung giờ</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Số nhân sự</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Người lập / Ghi chú</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Đang tải danh sách tăng ca...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Không tìm thấy hồ sơ tăng ca nào phù hợp điều kiện.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => {
                const empCount = Array.isArray(r.employees) ? r.employees.length : 0;
                return (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {r.date || '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<DeptIcon />}
                        label={getDeptName(r.departmentId)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {r.timeRange || (r.startTime && r.endTime ? `${r.startTime} - ${r.endTime}` : '—')}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<PersonIcon />}
                        label={`${empCount} người`}
                        size="small"
                        color={empCount > 0 ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {r.creatorName || r.createdBy || '—'}
                      </Typography>
                      {r.notes && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {r.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.status === 'approved' ? 'Đã duyệt' : r.status === 'rejected' ? 'Từ chối' : 'Hoàn tất'}
                        color={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenDetail(r)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xoá phiếu">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(r)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detail Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon color="primary" />
          Chi tiết phiếu tăng ca
        </DialogTitle>
        <DialogContent dividers>
          {selectedRecord && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Ngày tăng ca</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedRecord.date || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Phòng ban</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{getDeptName(selectedRecord.departmentId)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Khung giờ</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedRecord.timeRange || (selectedRecord.startTime && selectedRecord.endTime ? `${selectedRecord.startTime} - ${selectedRecord.endTime}` : '—')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Người tạo</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedRecord.creatorName || selectedRecord.createdBy || '—'}</Typography>
                </Box>
              </Box>

              {selectedRecord.notes && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Ghi chú công việc:</Typography>
                  <Typography variant="body2" sx={{ bgcolor: '#f1f5f9', p: 1.5, borderRadius: 1.5 }}>
                    {selectedRecord.notes}
                  </Typography>
                </Box>
              )}

              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                Danh sách nhân viên tăng ca ({Array.isArray(selectedRecord.employees) ? selectedRecord.employees.length : 0} người):
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>STT</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Mã NV</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Họ và tên</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Chức vụ / Vị trí</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Thời gian cụ thể</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(selectedRecord.employees) && selectedRecord.employees.length > 0 ? (
                      selectedRecord.employees.map((emp, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{emp.employeeId || emp.code || '—'}</TableCell>
                          <TableCell>{emp.name || '—'}</TableCell>
                          <TableCell>{emp.position || emp.role || '—'}</TableCell>
                          <TableCell>{emp.overtimeHours ? `${emp.overtimeHours} giờ` : (emp.customTime || 'Theo ca')}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Không có dữ liệu chi tiết danh sách nhân viên.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setViewDialog(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
