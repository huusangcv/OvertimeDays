import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { getGeneralSettings, updateGeneralSettings } from '../../../services/settingsService';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    systemName: 'Overtimes – Kingdom Vietnam',
    companyName: 'Kingdom Vietnam Co., Ltd.',
    maxDailyOvertimeHours: 4,
    maxMonthlyOvertimeHours: 40,
    defaultStartTime: '16:30',
    defaultEndTime: '19:30',
    allowSelfRegistration: false,
    requireApproval: false,
    contactSupport: 'admin@kingdom.com',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getGeneralSettings();
      if (data) {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      setError('Lỗi khi tải cài đặt hệ thống: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateGeneralSettings(settings);
      setSuccess('Cài đặt hệ thống đã được lưu thành công!');
    } catch (err) {
      setError('Lỗi khi lưu cài đặt: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Cấu hình & Cài đặt hệ thống
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thiết lập các thông số vận hành chung cho biểu mẫu và quy trình tăng ca.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadSettings}
          disabled={loading || saving}
        >
          Tải lại
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper
          component="form"
          onSubmit={handleSave}
          sx={{ p: 4, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon color="primary" fontSize="small" />
            Thông tin tổ chức & Tiêu đề biểu mẫu
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên ứng dụng / Hệ thống"
                value={settings.systemName || ''}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên công ty / Doanh nghiệp"
                value={settings.companyName || ''}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email liên hệ quản trị"
                type="email"
                value={settings.contactSupport || ''}
                onChange={(e) => setSettings({ ...settings, contactSupport: e.target.value })}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Khung giờ làm việc mặc định
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giờ bắt đầu tăng ca mặc định"
                type="time"
                value={settings.defaultStartTime || '16:30'}
                onChange={(e) => setSettings({ ...settings, defaultStartTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giờ kết thúc tăng ca mặc định"
                type="time"
                value={settings.defaultEndTime || '19:30'}
                onChange={(e) => setSettings({ ...settings, defaultEndTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giới hạn giờ tăng ca tối đa / ngày"
                type="number"
                value={settings.maxDailyOvertimeHours ?? 4}
                onChange={(e) => setSettings({ ...settings, maxDailyOvertimeHours: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giới hạn giờ tăng ca tối đa / tháng"
                type="number"
                value={settings.maxMonthlyOvertimeHours ?? 40}
                onChange={(e) => setSettings({ ...settings, maxMonthlyOvertimeHours: Number(e.target.value) })}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Chính sách & Phê duyệt
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(settings.requireApproval)}
                  onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })}
                />
              }
              label="Yêu cầu phê duyệt cấp quản lý trước khi xuất phiếu chính thức"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(settings.allowSelfRegistration)}
                  onChange={(e) => setSettings({ ...settings, allowSelfRegistration: e.target.checked })}
                />
              }
              label="Cho phép nhân viên tự tạo tài khoản đăng nhập (Chờ admin kích hoạt)"
            />
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
