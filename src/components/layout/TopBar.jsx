// src/components/layout/TopBar.jsx
import React, { memo } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { LOGO_B64 } from '../../constants';

/**
 * TopBar – 64px application header bar
 * Props:
 *   onPrint    : () => void
 *   onReset    : () => void
 *   selectedCount: number
 */
const TopBar = memo(function TopBar({ onPrint, onReset, selectedCount }) {
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
        zIndex: 10,
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
        {/* Logo */}
        <Avatar
          src={`data:image/png;base64,${LOGO_B64}`}
          alt="Kingdom Logo"
          variant="rounded"
          sx={{ width: 36, height: 36, borderRadius: 1.5, flexShrink: 0 }}
        />

        {/* Title group */}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ lineHeight: 1.2, color: 'text.primary', whiteSpace: 'nowrap' }}
          >
            Đăng Ký Tăng Ca
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.3 }}
            noWrap
          >
            Bộ phận Trước Xử Lý – Kingdom Vietnam
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1.5 }} />

        {/* Status */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: selectedCount > 0 ? 'success.main' : '#D1D5DB',
            }}
          />
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {selectedCount > 0 ? `${selectedCount} nhân viên đã chọn` : 'Chưa chọn nhân viên'}
          </Typography>
        </Box>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Làm mới – xóa toàn bộ lựa chọn">
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={onReset}
              sx={{
                borderRadius: 2,
                height: 36,
                fontSize: '0.8125rem',
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              Làm mới
            </Button>
          </Tooltip>

          <Tooltip title="Xuất PDF (Dùng tính năng In → Lưu PDF)">
            <Button
              variant="outlined"
              size="small"
              startIcon={<PictureAsPdfRoundedIcon />}
              onClick={onPrint}
              sx={{
                borderRadius: 2,
                height: 36,
                fontSize: '0.8125rem',
                display: { xs: 'none', md: 'flex' },
              }}
            >
              Xuất PDF
            </Button>
          </Tooltip>

          <Button
            variant="contained"
            size="small"
            startIcon={<PrintRoundedIcon />}
            onClick={onPrint}
            sx={{ borderRadius: 2, height: 36, fontSize: '0.8125rem' }}
          >
            In biểu
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
});

export default TopBar;
