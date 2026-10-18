// src/components/layout/TopBar.jsx
import React, { memo, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

import { LOGO_B64 } from '../../constants';
import { getDepartments } from '../../services/departmentService';

// Cấu hình 6 nhóm bộ phận theo quy trình nhà máy
export const DEPARTMENT_GROUPS = [
  {
    id: 'casting',
    code: 'NHÓM 01',
    shortTitle: 'Đúc',
    title: 'Bộ phận Đúc',
    description: 'Tạo mẫu sáp, nhúng vỏ khuôn và đúc rót kim loại',
    deptIds: ['sap', 'nhung-ho', 'furnace', 'pre-processing', 'post-processing'],
  },
  {
    id: 'machining',
    code: 'NHÓM 02',
    shortTitle: 'Gia công',
    title: 'Bộ phận Gia công',
    description: 'Gia công cơ khí, tiện, phay CNC và hoàn thiện',
    deptIds: ['van-cau', 'taro', 'cnc'],
  },
  {
    id: 'quality',
    code: 'NHÓM 03',
    shortTitle: 'Chất lượng',
    title: 'Chất lượng',
    description: 'Kiểm tra và kiểm soát chất lượng (QC/KCS)',
    deptIds: ['chat-luong'],
  },
  {
    id: 'engineering',
    code: 'NHÓM 04',
    shortTitle: 'Kỹ thuật',
    title: 'Kỹ thuật & Hỗ trợ SX',
    description: 'Khuôn mẫu, cơ điện bảo trì và an toàn',
    deptIds: ['cong-nghe', 'to-ky-thuat', 'khuon', 'ho-tro-san-xuat', 'cong-trinh', 'an-toan'],
  },
  {
    id: 'logistics',
    code: 'NHÓM 05',
    shortTitle: 'Kho vận',
    title: 'Kho vận & Cung ứng',
    description: 'Kho nguyên vật liệu, thu mua và đóng gói',
    deptIds: ['kho', 'thu-mua', 'dong-goi'],
  },
  {
    id: 'management',
    code: 'NHÓM 06',
    shortTitle: 'Quản lý',
    title: 'Văn phòng & Quản lý',
    description: 'Kế hoạch sản xuất, tài chính, nhân sự và hành chính',
    deptIds: ['sinh-quan', 'thong-ke', 'ke-toan', 'tong-vu', 'nhan-su', 'lop-hoc'],
  },
];

/**
 * TopBar – 64px application header with group-aware department switcher
 * Props:
 *   onPrint         : () => void
 *   departmentName  : string  — Tên bộ phận hiển thị trên top bar
 *   departmentId    : string  — ID bộ phận hiện tại
 */
const TopBar = memo(function TopBar({ onPrint, departmentName = '', departmentId = '' }) {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');

  useEffect(() => {
    let active = true;
    getDepartments({ activeOnly: true })
      .then((data) => {
        if (active && data) {
          setDepartments(data);
        }
      })
      .catch((err) => console.warn('TopBar departments load error:', err));
    return () => {
      active = false;
    };
  }, []);

  const handleOpenDeptMenu = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseDeptMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectDept = (dept) => {
    handleCloseDeptMenu();
    if (dept.id === 'furnace') navigate('/furnace');
    else if (dept.id === 'pre-processing') navigate('/pre-processing');
    else if (dept.id === 'post-processing') navigate('/post-processing');
    else navigate(`/dept/${dept.id}`);
  };

  // Xác định nhóm hiện tại của bộ phận đang mở
  const currentGroup = useMemo(() => {
    if (!departmentId) return null;
    return DEPARTMENT_GROUPS.find((g) => g.deptIds.includes(departmentId)) || null;
  }, [departmentId]);

  // Gom các bộ phận theo từng nhóm
  const groupedList = useMemo(() => {
    const deptMap = new Map(departments.map((d) => [d.id, d]));
    const usedIds = new Set();

    const sections = DEPARTMENT_GROUPS.map((group, gIdx) => {
      const items = [];
      group.deptIds.forEach((id, iIdx) => {
        if (deptMap.has(id)) {
          items.push({
            ...deptMap.get(id),
            code: `${gIdx + 1}.${iIdx + 1}`,
          });
          usedIds.add(id);
        }
      });

      return {
        ...group,
        items,
      };
    }).filter((g) => g.items.length > 0);

    // Bất kỳ bộ phận nào chưa phân nhóm
    const remaining = departments
      .filter((d) => !usedIds.has(d.id))
      .map((d, idx) => ({ ...d, code: `+.${idx + 1}` }));

    if (remaining.length > 0) {
      sections.push({
        id: 'other',
        code: 'KHÁC',
        shortTitle: 'Khác',
        title: 'Bộ phận khác',
        description: 'Các bộ phận bổ sung',
        items: remaining,
      });
    }

    return sections;
  }, [departments]);

  // Lọc theo nhóm nếu người dùng chọn filter
  const displayedGroups = useMemo(() => {
    if (selectedGroupFilter === 'all') return groupedList;
    return groupedList.filter((g) => g.id === selectedGroupFilter);
  }, [groupedList, selectedGroupFilter]);

  return (
    <AppBar
      component="header"
      className="no-print"
      position="static"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        height: 64,
        zIndex: 100,
        backgroundImage: 'none',
      }}
    >
      <Toolbar
        sx={{
          height: 64,
          minHeight: '64px !important',
          px: { xs: 2, sm: 3 },
          gap: 1.5,
        }}
      >
        {/* ── Logo ─────────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexShrink: 0,
            textDecoration: 'none',
            color: 'inherit', cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        >
          <Avatar
            src={`data:image/png;base64,${LOGO_B64}`}
            alt="Kingdom Logo"
            variant="rounded"
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              border: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          />

          {/* App title */}
          <Box sx={{ minWidth: 0, display: { xs: 'none', sm: 'block' } }} >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ lineHeight: 1.25, color: 'text.primary', letterSpacing: '-0.01em' }}
            >
              Đăng Ký Tăng Ca
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.3, fontSize: '0.7rem' }}
              noWrap
            >
              Kingdom Vietnam
            </Typography>
          </Box>
        </Box>

        {/* ── Department Switcher Dropdown (Kèm tên nhóm) ──────── */}
        {departmentName && (
          <Box sx={{ ml: { xs: 0, sm: 1 } }}>
            <Button
              size="small"
              variant="outlined"
              // onClick={handleOpenDeptMenu}
              endIcon={<ArrowDropDownRoundedIcon />}
              startIcon={<BusinessRoundedIcon sx={{ fontSize: 16, color: '#B4400E' }} />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: '#1e293b',
                borderColor: '#cbd5e1',
                borderRadius: '8px',
                height: 34,
                px: 1.5,
                bgcolor: '#f8fafc',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                '&:hover': {
                  bgcolor: '#f1f5f9',
                  borderColor: '#94a3b8',
                },
              }}
            >
              {/* Nhãn nhóm nổi bật */}
              {currentGroup && (
                <Box
                  component="span"
                  sx={{
                    bgcolor: 'rgba(180, 64, 14, 0.08)',
                    color: '#B4400E',
                    px: 0.75,
                    py: 0.15,
                    borderRadius: '4px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    display: { xs: 'none', md: 'inline-block' },
                  }}
                >
                  {currentGroup.title}
                </Box>
              )}
              <Typography
                component="span"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: '#111827',
                }}
              >
                {departmentName}
              </Typography>
            </Button>

            {/* Menu chọn bộ phận phân theo nhóm */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseDeptMenu}
              PaperProps={{
                sx: {
                  mt: 0.75,
                  borderRadius: 2,
                  boxShadow: '0 8px 28px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                  width: { xs: 300, sm: 380 },
                  maxHeight: 520,
                  p: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                },
              }}
            >
              {/* Header Menu */}
              <Box sx={{ p: '12px 16px 8px', bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Chọn bộ phận làm việc
                  </Typography>
                  {currentGroup && (
                    <Typography variant="caption" sx={{ color: '#B4400E', fontWeight: 600, fontSize: '0.7188rem' }}>
                      Hiện tại: {currentGroup.shortTitle}
                    </Typography>
                  )}
                </Box>

                {/* Filter nhanh theo nhóm */}
                <Box sx={{ display: 'flex', gap: 0.5, overflowX: 'auto', pb: 0.5 }}>
                  <Chip
                    label="Tất cả"
                    size="small"
                    clickable
                    onClick={() => setSelectedGroupFilter('all')}
                    sx={{
                      height: 22,
                      fontSize: '0.6875rem',
                      fontWeight: selectedGroupFilter === 'all' ? 700 : 500,
                      bgcolor: selectedGroupFilter === 'all' ? '#16181B' : '#FFFFFF',
                      color: selectedGroupFilter === 'all' ? '#FFFFFF' : '#475569',
                      border: '1px solid #CBD5E1',
                    }}
                  />
                  {groupedList.map((g) => (
                    <Chip
                      key={g.id}
                      label={g.shortTitle}
                      size="small"
                      clickable
                      onClick={() => setSelectedGroupFilter(g.id)}
                      sx={{
                        height: 22,
                        fontSize: '0.6875rem',
                        fontWeight: selectedGroupFilter === g.id ? 700 : 500,
                        bgcolor: selectedGroupFilter === g.id ? '#B4400E' : '#FFFFFF',
                        color: selectedGroupFilter === g.id ? '#FFFFFF' : '#475569',
                        border: '1px solid #CBD5E1',
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Danh sách các nhóm & bộ phận */}
              <Box sx={{ overflowY: 'auto', flex: 1, py: 0.5 }}>
                {displayedGroups.map((group) => (
                  <Box key={group.id} sx={{ mb: 0.5 }}>
                    <ListSubheader
                      disableSticky={false}
                      sx={{
                        lineHeight: '28px',
                        fontSize: '0.7188rem',
                        fontWeight: 700,
                        color: '#475569',
                        bgcolor: '#F1F5F9',
                        borderTop: '1px solid #E2E8F0',
                        borderBottom: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontFamily: 'monospace', color: '#B4400E' }}>{group.code}</span>
                        <span>{group.title}</span>
                      </Box>
                      <span style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>{group.items.length} bộ phận</span>
                    </ListSubheader>

                    {group.items.map((dept) => {
                      const isCurrent = dept.id === departmentId;
                      return (
                        <MenuItem
                          key={dept.id}
                          selected={isCurrent}
                          onClick={() => handleSelectDept(dept)}
                          sx={{
                            py: 1,
                            px: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            '&.Mui-selected': {
                              bgcolor: 'rgba(180, 64, 14, 0.08)',
                              color: '#B4400E',
                              '&:hover': {
                                bgcolor: 'rgba(180, 64, 14, 0.12)',
                              },
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: '0.75rem',
                                color: isCurrent ? '#B4400E' : '#64748B',
                                fontWeight: 600,
                                width: 28,
                              }}
                            >
                              {dept.code}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: isCurrent ? 700 : 500,
                                fontSize: '0.8438rem',
                                color: isCurrent ? '#B4400E' : '#1E293B',
                              }}
                            >
                              {dept.name}
                            </Typography>
                          </Box>

                          {isCurrent && (
                            <Chip
                              icon={<CheckRoundedIcon style={{ fontSize: 13, color: '#B4400E' }} />}
                              label="Đang mở"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.6563rem',
                                fontWeight: 700,
                                bgcolor: 'rgba(180, 64, 14, 0.12)',
                                color: '#B4400E',
                                border: '1px solid rgba(180, 64, 14, 0.25)',
                              }}
                            />
                          )}
                        </MenuItem>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Menu>
          </Box>
        )}

        {/* ── Spacer ──────────────────────────────────────────── */}
        <Box sx={{ flex: 1 }} />

        {/* ── Actions ──────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Nút quay về trang chọn bộ phận */}
          <Tooltip title="Về trang chọn bộ phận">
            <IconButton
              size="small"
              onClick={() => navigate('/')}
              aria-label="Về trang chọn bộ phận"
              sx={{
                width: 34,
                height: 34,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                color: 'text.secondary',
                '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'rgba(185,28,28,0.05)' },
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          {/* Print – The single primary action */}
          <Button
            variant="contained"
            size="small"
            startIcon={<PrintRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={onPrint}
            sx={{ height: 34, fontSize: '0.8125rem', borderRadius: '8px', minWidth: 90 }}
          >
            In biểu
          </Button>

          {/* Avatar */}
          <Tooltip title="Hữu Sang">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.75rem',
                fontWeight: 700,
                bgcolor: '#4F63D2',
                cursor: 'pointer',
                border: '2px solid',
                borderColor: 'divider',
                transition: 'all 150ms ease',
                '&:hover': { borderColor: 'primary.main', transform: 'scale(1.05)' },
              }}
            >
              HS
            </Avatar>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
});

export default TopBar;
