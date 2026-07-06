// src/pages/Landing/index.jsx
// Trang giới thiệu — người dùng chọn bộ phận để vào hệ thống.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { LOGO_B64 } from '../../constants';

// Cấu hình các bộ phận — để thêm bộ phận mới chỉ cần thêm object vào mảng này
const DEPARTMENTS = [
  {
    id: 'furnace',
    path: '/furnace',
    name: 'Lò',
    description: 'Vận hành lò nung và thực hiện xử lý nhiệt sản phẩm.',
    icon: '1',
    accentColor: '#B91C1C',
    accentBg: 'rgba(185,28,28,0.06)',
    accentBorder: 'rgba(185,28,28,0.2)',
  },
  {
    id: 'pre-processing',
    path: '/pre-processing',
    name: 'Trước Xử Lý',
    description: 'Bộ phận cắt, mài và xử lý bề mặt sản phẩm trước khi chuyển sang công đoạn lò.',
    icon: '2',
    accentColor: '#B91C1C',
    accentBg: 'rgba(185,28,28,0.06)',
    accentBorder: 'rgba(185,28,28,0.2)',
  },
  {
    id: 'post-processing',
    path: '/post-processing',
    name: 'Sau Xử Lý',
    description: 'Bộ phận kiểm tra chất lượng và đóng gói sản phẩm sau khi hoàn thành xử lý nhiệt, chuẩn bị xuất hàng.',
    icon: '3',
    accentColor: '#B91C1C',
    accentBg: 'rgba(185,28,28,0.06)',
    accentBorder: 'rgba(185,28,28,0.2)',
  },
];

/**
 * DepartmentCard – Card bộ phận với hover effect và animation.
 */
function DepartmentCard({ dept, onNavigate }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`Vào hệ thống bộ phận ${dept.name}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate(dept.path); }}
      onClick={() => onNavigate(dept.path)}
      sx={{
        // Layout
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        p: 3.5,
        // Styling
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1.5px solid',
        borderColor: hovered ? dept.accentBorder : '#E4E7EB',
        boxShadow: hovered
          ? `0 16px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)`
          : '0 2px 8px rgba(0,0,0,0.05)',
        // Animation
        transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
        transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        outline: 'none',
        '&:focus-visible': {
          outline: `2px solid ${dept.accentColor}`,
          outlineOffset: 3,
        },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '16px',
          backgroundColor: hovered ? dept.accentBg : '#F8F9FB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          border: '1.5px solid',
          borderColor: hovered ? dept.accentBorder : '#E4E7EB',
          transition: 'all 250ms ease',
          flexShrink: 0,
        }}
      >
        {dept.icon}
      </Box>

      {/* Text content */}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            color: hovered ? dept.accentColor : '#111827',
            mb: 1,
            fontSize: '1.125rem',
            letterSpacing: '-0.01em',
            transition: 'color 200ms ease',
          }}
        >
          {dept.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#6B7280',
            lineHeight: 1.6,
            fontSize: '0.875rem',
          }}
        >
          {dept.description}
        </Typography>
      </Box>

      {/* CTA Button */}
      <Button
        variant={hovered ? 'contained' : 'outlined'}
        fullWidth
        onClick={(e) => { e.stopPropagation(); onNavigate(dept.path); }}
        tabIndex={-1} // Card đã có focus, tránh double-tab
        sx={{
          height: 42,
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '0.875rem',
          letterSpacing: 0,
          transition: 'all 200ms ease',
          ...(hovered
            ? {
              background: `linear-gradient(135deg, ${dept.accentColor} 0%, ${dept.accentColor}CC 100%)`,
              borderColor: 'transparent',
              color: '#fff',
              boxShadow: `0 4px 16px ${dept.accentColor}40`,
            }
            : {
              borderColor: '#E4E7EB',
              color: '#374151',
              bgcolor: 'transparent',
            }),
        }}
      >
        Vào hệ thống
      </Button>
    </Box>
  );
}

/**
 * LandingPage – Trang chủ hiển thị 3 card bộ phận.
 */
function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F4F5F7',
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 50% -20%, rgba(185,28,28,0.08) 0%, transparent 60%),
          radial-gradient(circle, #C9CDD3 0.5px, transparent 0.5px)
        `,
        backgroundSize: '100% 100%, 24px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 },
      }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: { xs: 5, sm: 6 },
          textAlign: 'center',
          maxWidth: 560,
        }}
      >
        {/* Logo + Company */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3.5 }}>
          <Avatar
            src={`data:image/png;base64,${LOGO_B64}`}
            alt="Kingdom Logo"
            variant="rounded"
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              border: '1.5px solid #E4E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            }}
          />
          <Box sx={{ textAlign: 'left' }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ color: '#111827', fontSize: '0.9375rem', lineHeight: 1.3, letterSpacing: '-0.01em' }}
            >
              Kingdom Vietnam
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block' }}
            >
              越南鐵王流體控制設備責任有限公司
            </Typography>
          </Box>
        </Box>

        {/* Main title */}
        <Typography
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.75rem', sm: '2.25rem' },
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            color: '#111827',
            mb: 1.5,
            fontFamily: '"Inter", sans-serif',
          }}
        >
          HỆ THỐNG{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(135deg, #B91C1C 0%, #991B1B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ĐĂNG KÝ TĂNG CA
          </Box>
        </Typography>

        <Typography
          variant="body1"
          sx={{ color: '#6B7280', fontSize: '1rem', lineHeight: 1.6, maxWidth: 400 }}
        >
          Vui lòng chọn bộ phận để tiếp tục.
        </Typography>
      </Box>

      {/* ── Department Cards ────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          // Responsive grid: 1 col (mobile) → 2 col (tablet) → 3 col (desktop)
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: { xs: 2, sm: 2.5, md: 3 },
          width: '100%',
          maxWidth: 1000,
        }}
      >
        {DEPARTMENTS.map((dept) => (
          <DepartmentCard
            key={dept.id}
            dept={dept}
            onNavigate={navigate}
          />
        ))}
      </Box>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <Typography
        variant="caption"
        sx={{ color: '#9CA3AF', mt: 5, fontSize: '0.75rem' }}
      >
        Kingdom Vietnam · Hệ thống quản lý tăng ca nội bộ
      </Typography>
    </Box>
  );
}

export default LandingPage;
