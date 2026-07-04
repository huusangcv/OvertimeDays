// src/components/layout/TopBar.jsx
import React, { memo } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { LOGO_B64 } from '../../constants';

/**
 * TopBar – 64px premium application header
 * Single Source of Truth: Only generic app info and the main Action (In biểu)
 * Props:
 *   onPrint: () => void
 */
const TopBar = memo(function TopBar({ onPrint }) {
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
          gap: 1,
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
            color: 'inherit',
          }}
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
          <Box sx={{ minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
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
              Kingdom Vietnam · Trước Xử Lý
            </Typography>
          </Box>
        </Box>

        {/* ── Spacer ──────────────────────────────────────────── */}
        <Box sx={{ flex: 1 }} />

        {/* ── Actions ─────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          
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
            KV
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
});

export default TopBar;
