import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useAuth } from '../../../context/AuthContext';
import { LOGO_B64 } from '../../../constants';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Vui long nhap Email va Mat khau.');
      return;
    }
    setSubmitting(true);
    setErrorMessage('');
    try {
      const result = await login(email.trim(), password);
      if (result && result.isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        setErrorMessage('Tai khoan nay khong co quyen truy cap trang Quan tri.');
      }
    } catch (err) {
      let msg = 'Da xay ra loi khi dang nhap. Vui long thu lai.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Email hoac mat khau khong chinh xac.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Tai khoan tam thoi bi khoa do dang nhap sai nhieu lan. Vui long thu lai sau.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Loi ket noi mang hoac Firebase khong phan hoi.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F4F5F7',
        backgroundImage: [
          'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(185,28,28,0.08) 0%, transparent 60%)',
          'radial-gradient(circle, #C9CDD3 0.5px, transparent 0.5px)',
        ].join(', '),
        backgroundSize: '100% 100%, 24px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          maxWidth: 440,
          width: '100%',
          p: { xs: 3, sm: 4.5 },
          borderRadius: 3.5,
          bgcolor: '#FFFFFF',
          border: '1px solid #E5E7EB',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5, textAlign: 'center' }}>
          <Avatar
            src={'data:image/png;base64,' + LOGO_B64}
            alt="Kingdom Logo"
            variant="rounded"
            sx={{ width: 56, height: 56, borderRadius: '14px', mb: 2, border: '1px solid #E5E7EB' }}
          />
          <Typography variant="h5" fontWeight={800} sx={{ color: '#111827', mb: 0.5 }}>
            Dang Nhap Quan Tri
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
            He thong Quan ly Tang ca - Kingdom Vietnam
          </Typography>
        </Box>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Email quan tri"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            autoComplete="email"
            placeholder="admin@example.com"
          />
          <TextField
            label="Mat khau"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <LockOutlinedIcon />}
            sx={{
              mt: 1,
              height: 48,
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: 2,
              bgcolor: '#B91C1C',
              '&:hover': { bgcolor: '#991B1B' },
            }}
          >
            {submitting ? 'Dang dang nhap...' : 'Dang Nhap'}
          </Button>
        </Box>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: '#9CA3AF' }}>
          Quyen truy cap danh cho Quan tri vien he thong.
        </Typography>
      </Paper>
    </Box>
  );
}
