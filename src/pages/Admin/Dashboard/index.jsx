// src/pages/Admin/Dashboard/index.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';

import BusinessIcon from '@mui/icons-material/Business';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';

import { getDepartments } from '../../../services/departmentService';
import { getAllEmployees } from '../../../services/adminEmployeeService';
import { getAllOvertimeRecords } from '../../../services/overtimeAdminService';
import { getAccounts } from '../../../services/accountService';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeDepts: 0,
    totalDepts: 0,
    activeEmployees: 0,
    totalEmployees: 0,
    totalOvertimes: 0,
    totalAccounts: 0,
  });
  const [recentRecords, setRecentRecords] = useState([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [depts, emps, overtimes, accounts] = await Promise.all([
        getDepartments(),
        getAllEmployees('all'),
        getAllOvertimeRecords(),
        getAccounts(),
      ]);

      const activeDepts = depts.filter((d) => d.active).length;
      const activeEmps = emps.filter((e) => e.active).length;

      setStats({
        activeDepts,
        totalDepts: depts.length,
        activeEmployees: activeEmps,
        totalEmployees: emps.length,
        totalOvertimes: overtimes.length,
        totalAccounts: accounts.length,
      });

      setRecentRecords(overtimes.slice(0, 5));
    } catch (err) {
      console.error('Loi tai so lieu Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Tong Quan Quan Tri - Kingdom Vietnam';
    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Bo phan hoat dong',
      value: stats.activeDepts + ' / ' + stats.totalDepts,
      subtitle: 'Bo phan trong cong ty',
      icon: <BusinessIcon sx={{ fontSize: 32, color: '#B91C1C' }} />,
      bgColor: '#FEF2F2',
      link: '/admin/departments',
    },
    {
      title: 'Nhan vien dang lam',
      value: String(stats.activeEmployees),
      subtitle: 'Tong cong ' + stats.totalEmployees + ' ho so',
      icon: <PeopleAltIcon sx={{ fontSize: 32, color: '#2563EB' }} />,
      bgColor: '#EFF6FF',
      link: '/admin/employees',
    },
    {
      title: 'Luot in bieu tang ca',
      value: String(stats.totalOvertimes),
      subtitle: 'Ban ghi lich su da luu',
      icon: <AccessTimeFilledIcon sx={{ fontSize: 32, color: '#059669' }} />,
      bgColor: '#ECFDF5',
      link: '/admin/overtimes',
    },
    {
      title: 'Tai khoan he thong',
      value: String(stats.totalAccounts),
      subtitle: 'Nguoi dung phan quyen',
      icon: <ManageAccountsIcon sx={{ fontSize: 32, color: '#7C3AED' }} />,
      bgColor: '#F5F3FF',
      link: '/admin/accounts',
    },
  ];

  return (
    <Box>
      {/* Title & Refresh */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#111827' }}>
            Bang Dieu Khien Quan Tri
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            Thong ke du lieu thuc te tren toan bo he thong
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={loadDashboardData}
          disabled={loading}
          sx={{ borderRadius: '8px', textTransform: 'none', color: '#374151', borderColor: '#D1D5DB' }}
        >
          Lam moi
        </Button>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map((card, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                bgcolor: '#FFFFFF',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48, height: 48, borderRadius: '12px', bgcolor: card.bgColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Button
                    component={RouterLink}
                    to={card.link}
                    size="small"
                    endIcon={<ArrowForwardIcon fontSize="inherit" />}
                    sx={{ textTransform: 'none', fontSize: '0.75rem', p: 0.5, color: '#6B7280' }}
                  >
                    Quan ly
                  </Button>
                </Box>
                {loading ? (
                  <>
                    <Skeleton variant="text" width="60%" height={38} />
                    <Skeleton variant="text" width="80%" height={20} />
                  </>
                ) : (
                  <>
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#111827', mb: 0.5 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#374151', mb: 0.25 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      {card.subtitle}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Overtime Records */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#111827' }}>
              Bieu Tang Ca Gan Day
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              Danh sach cac bieu in gan nhat duoc luu tren he thong
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/admin/overtimes"
            size="small"
            endIcon={<ArrowForwardIcon fontSize="inherit" />}
            sx={{ textTransform: 'none', fontWeight: 600, color: '#B91C1C' }}
          >
            Xem tat ca
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Thoi gian luu</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Bo phan</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Ngay tang ca</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Loai</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#374151' }}>So nhan vien</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                  </TableRow>
                ))
              ) : recentRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#9CA3AF' }}>
                    Chua co bieu tang ca nao duoc luu trong he thong.
                  </TableCell>
                </TableRow>
              ) : (
                recentRecords.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : '—'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#111827' }}>
                      {r.departmentName}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {r.date || '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.shift || 'TCA THUONG'}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          bgcolor: r.shift === 'CHU NHAT' ? '#FEE2E2' : '#EFF6FF',
                          color: r.shift === 'CHU NHAT' ? '#B91C1C' : '#1D4ED8',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      {r.employeeCount || (r.employees ? r.employees.length : 0)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
