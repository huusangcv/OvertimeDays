import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';

import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import FilterListIcon from '@mui/icons-material/FilterList';
import ComputerIcon from '@mui/icons-material/Computer';
import SecurityIcon from '@mui/icons-material/Security';

import { fetchAuditLogs } from '../../../services/auditService';
import { getDepartments } from '../../../services/departmentService';

const ACTION_COLORS = {
  ADD: { bg: '#DCFCE7', text: '#15803D', label: 'THÊM MỚI' },
  EDIT: { bg: '#DBEAFE', text: '#1D4ED8', label: 'CHỈNH SỬA' },
  DELETE: { bg: '#FEE2E2', text: '#B91C1C', label: 'XOÁ' },
  PRINT: { bg: '#FEF3C7', text: '#B45309', label: 'IN BIỂU' },
  GRANT_ROLE: { bg: '#F3E8FF', text: '#7E22CE', label: 'PHÂN QUYỀN' },
  ACTIVATE: { bg: '#E0E7FF', text: '#3730A3', label: 'KÍCH HOẠT' },
  DEACTIVATE: { bg: '#FEE2E2', text: '#991B1B', label: 'KHOÁ' },
  UPDATE_SETTINGS: { bg: '#F1F5F9', text: '#334155', label: 'CÀI ĐẶT' },
};

const ENTITY_LABELS = {
  employee: 'Nhân viên',
  overtime: 'Biểu tăng ca',
  history: 'Lịch sử in',
  account: 'Tài khoản',
  department: 'Bộ phận',
  category: 'Danh mục',
  settings: 'Hệ thống',
};

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pageLimit, setPageLimit] = useState(50);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [logsData, deptsData] = await Promise.all([
        fetchAuditLogs({
          action: filterAction || undefined,
          entity: filterEntity || undefined,
          department: filterDept || undefined,
          limit: pageLimit,
        }),
        getDepartments({ activeOnly: false }).catch(() => []),
      ]);
      setLogs(logsData);
      setDepartments(deptsData);
    } catch (err) {
      console.error('Lỗi khi tải audit logs:', err);
      setError(err.message || 'Không thể tải nhật ký kiểm toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [filterAction, filterEntity, filterDept, pageLimit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredLogs = useMemo(() => {
    if (!searchKeyword.trim()) return logs;
    const q = searchKeyword.toLowerCase();
    return logs.filter((log) => {
      const actor = (log.actor?.email || log.actor?.uid || '').toLowerCase();
      const label = (log.entityLabel || '').toLowerCase();
      const entityId = (log.entityId || '').toLowerCase();
      const note = (log.note || '').toLowerCase();
      const ip = (log.ip || '').toLowerCase();
      return (
        actor.includes(q) ||
        label.includes(q) ||
        entityId.includes(q) ||
        note.includes(q) ||
        ip.includes(q)
      );
    });
  }, [logs, searchKeyword]);

  const getDeptName = (deptId) => {
    if (!deptId) return '—';
    const dept = departments.find((d) => d.id === deptId);
    return dept ? dept.name : deptId;
  };

  const formatTimestamp = (ts) => {
    if (!ts) return '—';
    const date = new Date(ts);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleOpenDetail = (log) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#16181b', fontFamily: "'IBM Plex Sans', sans-serif" }}>
              Nhật ký kiểm toán (Audit Logs)
            </Typography>
            <Chip
              icon={<SecurityIcon style={{ fontSize: 14 }} />}
              label="Bảo mật Server-side"
              size="small"
              sx={{ bgcolor: '#ECFDF5', color: '#047857', fontWeight: 600, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#4A5057', mt: 0.5 }}>
            Ghi nhận tự động mọi thao tác Thêm, Sửa, Xoá, In biểu mẫu tăng ca kèm định danh, thiết bị và IP.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          disabled={loading}
          sx={{
            bgcolor: '#B4400E',
            borderRadius: 0,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { bgcolor: '#92330A' },
          }}
        >
          Làm mới
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filter Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: '1px solid #D3D6DA',
          bgcolor: '#F7F7F6',
          borderRadius: 0,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Hành động"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              sx={{ bgcolor: '#fff' }}
            >
              <MenuItem value="">Tất cả hành động</MenuItem>
              <MenuItem value="ADD">Thêm mới (ADD)</MenuItem>
              <MenuItem value="EDIT">Chỉnh sửa (EDIT)</MenuItem>
              <MenuItem value="DELETE">Xoá (DELETE)</MenuItem>
              <MenuItem value="PRINT">In biểu mẫu (PRINT)</MenuItem>
              <MenuItem value="GRANT_ROLE">Phân quyền (GRANT_ROLE)</MenuItem>
              <MenuItem value="ACTIVATE">Kích hoạt (ACTIVATE)</MenuItem>
              <MenuItem value="DEACTIVATE">Khoá (DEACTIVATE)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              select
              fullWidth
              size="small"
              label="Đối tượng"
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              sx={{ bgcolor: '#fff' }}
            >
              <MenuItem value="">Tất cả đối tượng</MenuItem>
              <MenuItem value="employee">Nhân viên</MenuItem>
              <MenuItem value="overtime">Biểu tăng ca</MenuItem>
              <MenuItem value="history">Lịch sử in</MenuItem>
              <MenuItem value="account">Tài khoản</MenuItem>
              <MenuItem value="department">Bộ phận</MenuItem>
              <MenuItem value="category">Danh mục</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              select
              fullWidth
              size="small"
              label="Bộ phận"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              sx={{ bgcolor: '#fff' }}
            >
              <MenuItem value="">Tất cả bộ phận</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm theo email, tên, ghi chú, IP..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              sx={{ bgcolor: '#fff' }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={1}>
            <TextField
              select
              fullWidth
              size="small"
              label="Số lượng"
              value={pageLimit}
              onChange={(e) => setPageLimit(Number(e.target.value))}
              sx={{ bgcolor: '#fff' }}
            >
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Table Container */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid #D3D6DA',
          borderRadius: 0,
          bgcolor: '#FFFFFF',
        }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: '#F7F7F6' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem', width: 170 }}>
                THỜI GIAN
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem', width: 130 }}>
                HÀNH ĐỘNG
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                ĐỐI TƯỢNG TÁC ĐỘNG
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                BỘ PHẬN
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                NGƯỜI THỰC HIỆN
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                THIẾT BỊ / IP
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem', width: 80 }} align="center">
                CHI TIẾT
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} sx={{ color: '#B4400E' }} />
                  <Typography variant="body2" sx={{ mt: 1.5, color: '#6B7280' }}>
                    Đang tải nhật ký kiểm toán từ máy chủ...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#6B7280' }}>
                  <ReceiptLongIcon sx={{ fontSize: 44, color: '#9CA3AF', mb: 1 }} />
                  <Typography variant="body1" fontWeight={600}>
                    Chưa có nhật ký kiểm toán nào
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Các thao tác thêm, sửa, xoá, in biểu sẽ tự động xuất hiện tại đây.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => {
                const actionMeta = ACTION_COLORS[log.action] || {
                  bg: '#F3F4F6',
                  text: '#374151',
                  label: log.action,
                };
                return (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: '#F9FAFB' },
                      borderBottom: '1px solid #DCDEE1',
                    }}
                  >
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#16181B' }}>
                      {formatTimestamp(log.ts)}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={actionMeta.label}
                        size="small"
                        sx={{
                          bgcolor: actionMeta.bg,
                          color: actionMeta.text,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          borderRadius: '3px',
                          height: 22,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#16181B' }}>
                          {log.entityLabel || log.entityId || '—'}
                        </Typography>
                        <Chip
                          label={ENTITY_LABELS[log.entity] || log.entity}
                          size="small"
                          variant="outlined"
                          sx={{ height: 18, fontSize: '0.65rem', color: '#5B6168', borderColor: '#D3D6DA' }}
                        />
                      </Box>
                      {log.note && (
                        <Typography variant="caption" sx={{ color: '#5B6168', display: 'block', mt: 0.25 }}>
                          {log.note}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={{ fontSize: '0.85rem', color: '#374151' }}>
                      {getDeptName(log.department)}
                    </TableCell>

                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      <Typography variant="body2" fontWeight={500} sx={{ color: '#16181B' }}>
                        {log.actor?.email || 'Người dùng'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280', fontFamily: 'monospace' }}>
                        UID: {(log.actor?.uid || '').slice(0, 10)}...
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ fontSize: '0.8rem', color: '#4B5563' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ComputerIcon sx={{ fontSize: 14, color: '#6B7280' }} />
                        <Typography variant="caption" fontWeight={500}>
                          {log.device?.name || log.device?.id?.slice(0, 8) || 'Trình duyệt'}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#6B7280', fontFamily: 'monospace', display: 'block' }}>
                        IP: {log.ip || '—'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Xem chi tiết dữ liệu snapshot">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDetail(log)}
                          sx={{ color: '#4B5563', '&:hover': { color: '#B4400E' } }}
                        >
                          <VisibilityIcon fontSize="small" />
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
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 0 } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB', py: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLongIcon sx={{ color: '#B4400E' }} />
          <Typography variant="h6" fontWeight={700}>
            Chi tiết bản ghi kiểm toán #{selectedLog?.id}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          {selectedLog && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Thời điểm ghi nhận</Typography>
                  <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                    {formatTimestamp(selectedLog.ts)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Hành động</Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#B4400E' }}>
                    {selectedLog.action} ({ENTITY_LABELS[selectedLog.entity] || selectedLog.entity})
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Người thực hiện</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedLog.actor?.email || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Địa chỉ IP & Thiết bị</Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {selectedLog.ip} — {selectedLog.device?.name || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>

              {selectedLog.note && (
                <Box sx={{ p: 1.5, bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <Typography variant="caption" color="text.secondary" display="block">Ghi chú thao tác:</Typography>
                  <Typography variant="body2" fontWeight={500}>{selectedLog.note}</Typography>
                </Box>
              )}

              {/* Before snapshot */}
              {selectedLog.before && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#B91C1C', mb: 0.5 }}>
                    Dữ liệu trước thao tác (Before):
                  </Typography>
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: 0,
                      maxHeight: 200,
                      overflow: 'auto',
                    }}
                  >
                    <pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {JSON.stringify(selectedLog.before, null, 2)}
                    </pre>
                  </Paper>
                </Box>
              )}

              {/* After snapshot */}
              {selectedLog.after && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#15803D', mb: 0.5 }}>
                    Dữ liệu sau thao tác (After):
                  </Typography>
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: 0,
                      maxHeight: 250,
                      overflow: 'auto',
                    }}
                  >
                    <pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {JSON.stringify(selectedLog.after, null, 2)}
                    </pre>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
          <Button onClick={() => setDetailOpen(false)} sx={{ borderRadius: 0 }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
