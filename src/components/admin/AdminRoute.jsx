// src/components/admin/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import ShieldAlertIcon from '@mui/icons-material/GppBad';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isAdmin, isLoading, needsBootstrap, bootstrapAdmin } = useAuth();
  const location = useLocation();
  const [bootstrapLoading, setBootstrapLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const loading = isLoading;

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          bgcolor: '#F9FAFB',
        }}
      >
        <CircularProgress sx={{ color: '#B91C1C' }} />
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Dang kiem tra quyen quan tri...
        </Typography>
      </Box>
    );
  }

  // 1. Chua dang nhap -> redirect ve login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 2. He thong chua co Admin nao
  if (needsBootstrap) {
    const handleSetFirstAdmin = async () => {
      setBootstrapLoading(true);
      setErrorMsg('');
      try {
        await bootstrapAdmin();
      } catch (err) {
        setErrorMsg(err.message || 'Loi khi khoi tao tai khoan quan tri');
      } finally {
        setBootstrapLoading(false);
      }
    };

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#F4F5F7',
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            maxWidth: 480,
            width: '100%',
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <AdminPanelSettingsIcon sx={{ fontSize: 64, color: '#B91C1C', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Khoi Tao Quan Tri Vien Dau Tien
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tai khoan <b>{user.email}</b> dang dang nhap trong khi he thong chua co Quan tri vien nao.
            Nhan ben duoi de thiet lap tai khoan nay lam Quan tri vien toi cao.
          </Typography>

          {errorMsg && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Typography>
          )}

          <Button
            variant="contained"
            fullWidth
            disabled={bootstrapLoading}
            onClick={handleSetFirstAdmin}
            sx={{
              bgcolor: '#B91C1C',
              '&:hover': { bgcolor: '#991B1B' },
              py: 1.2,
              fontWeight: 600,
            }}
          >
            {bootstrapLoading ? 'Dang kich hoat...' : 'Kich hoat quyen Quan tri vien'}
          </Button>
        </Paper>
      </Box>
    );
  }

  // 3. Da dang nhap nhung khong co quyen admin
  if (!isAdmin) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#F4F5F7',
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            maxWidth: 460,
            width: '100%',
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <ShieldAlertIcon sx={{ fontSize: 64, color: '#DC2626', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} sx={{ color: '#111827', mb: 1 }}>
            Truy Cap Bi Tu Choi
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tai khoan <b>{user.email}</b> khong co quyen truy cap vao phan he Quan tri.
            Vui long lien he nguoi quan tri cong ty de duoc cap quyen.
          </Typography>
          <Button
            variant="contained"
            href="/"
            sx={{
              bgcolor: '#B91C1C',
              '&:hover': { bgcolor: '#991B1B' },
              fontWeight: 600,
            }}
          >
            Quay ve Trang Bieu Tang Ca
          </Button>
        </Paper>
      </Box>
    );
  }

  // 4. Hop le -> Render noi dung Admin
  return children || <Outlet />;
}
