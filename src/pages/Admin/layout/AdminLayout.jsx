// src/pages/Admin/layout/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CategoryIcon from '@mui/icons-material/Category';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SettingsIcon from '@mui/icons-material/Settings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAuth } from '../../../context/AuthContext';
import { LOGO_B64 } from '../../../constants';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { path: '/admin', label: 'Tong quan', icon: <DashboardIcon />, exact: true },
  { path: '/admin/departments', label: 'Bo phan cong ty', icon: <BusinessIcon /> },
  { path: '/admin/employees', label: 'Quan ly nhan vien', icon: <PeopleAltIcon /> },
  { path: '/admin/overtimes', label: 'Lich su tang ca', icon: <AccessTimeFilledIcon /> },
  { path: '/admin/categories', label: 'Danh muc cau hinh', icon: <CategoryIcon /> },
  { path: '/admin/accounts', label: 'Tai khoan & Quyen', icon: <ManageAccountsIcon /> },
  { path: '/admin/audit', label: 'Nhat ky kiem toan', icon: <ReceiptLongIcon /> },
  { path: '/admin/settings', label: 'Cai dat he thong', icon: <SettingsIcon /> },
];

export default function AdminLayout() {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    if (window.confirm('Ban co chac chan muon dang xuat khoi trang Quan tri?')) {
      await logout();
      navigate('/admin/login');
    }
  };

  const isSelected = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #E5E7EB' }}>
        <Avatar
          src={'data:image/png;base64,' + LOGO_B64}
          alt="Kingdom Logo"
          variant="rounded"
          sx={{ width: 40, height: 40, borderRadius: '10px' }}
        />
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ color: '#111827', fontSize: '0.95rem' }}>
            Kingdom Vietnam
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              label="QUAN TRI VIEN"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 700,
                bgcolor: '#FEE2E2',
                color: '#B91C1C',
                borderRadius: '4px',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Nav List */}
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = isSelected(item);
          return (
            <ListItemButton
              key={item.path}
              component={RouterLink}
              to={item.path}
              onClick={() => { if (isMobile) setMobileOpen(false); }}
              sx={{
                mb: 0.5,
                borderRadius: '10px',
                py: 1.1,
                bgcolor: active ? '#B91C1C' : 'transparent',
                color: active ? '#FFFFFF' : '#4B5563',
                '&:hover': {
                  bgcolor: active ? '#991B1B' : '#F3F4F6',
                  color: active ? '#FFFFFF' : '#111827',
                },
                transition: 'all 150ms ease',
              }}
            >
              <ListItemIcon sx={{ color: active ? '#FFFFFF' : '#6B7280', minWidth: 38 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: active ? 700 : 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Public App link */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          component={RouterLink}
          to="/"
          sx={{
            borderRadius: '10px',
            bgcolor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            mb: 1.5,
            color: '#374151',
            '&:hover': { bgcolor: '#F3F4F6' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 34, color: '#4B5563' }}>
            <ArrowBackIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Trang Bieu Tang Ca"
            primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 600 }}
          />
        </ListItemButton>

        <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', textAlign: 'center', fontSize: '0.7rem' }}>
          Overtimes Management v1.2
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F5F7' }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: 'calc(100% - ' + DRAWER_WIDTH + 'px)' },
          ml: { md: DRAWER_WIDTH + 'px' },
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          color: '#111827',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="Mo menu dieu huong"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.15rem' } }}>
              He Thong Quan Tri Tang Ca
            </Typography>
          </Box>

          {/* User profile & Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 220 }}>
                {userProfile?.displayName || user?.displayName || user?.email}
              </Typography>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
                Dang hoat dong
              </Typography>
            </Box>

            <Tooltip title="Dang xuat">
              <IconButton
                onClick={handleLogout}
                size="small"
                sx={{
                  bgcolor: '#FEE2E2',
                  color: '#B91C1C',
                  '&:hover': { bgcolor: '#FCA5A5' },
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="Menu quan tri"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop permanent drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: '1px solid #E5E7EB',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: 'calc(100% - ' + DRAWER_WIDTH + 'px)' },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
