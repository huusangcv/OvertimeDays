// src/components/preview/PreviewToolbar.jsx
import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import FitScreenRoundedIcon from '@mui/icons-material/FitScreenRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';

/**
 * PreviewToolbar – zoom + print/download controls above the document
 * Props:
 *   zoom        : number (50–200)
 *   onZoomIn    : () => void
 *   onZoomOut   : () => void
 *   onZoomReset : () => void
 *   onZoomFit   : () => void
 *   onPrint     : () => void
 *   selectedCount: number
 */
const PreviewToolbar = memo(function PreviewToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomFit,
  onPrint,
  onSave,
  selectedCount,
}) {
  return (
    <Paper
      className="no-print"
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1,
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      {/* Doc title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ArticleRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
            Biểu Tăng Ca
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {selectedCount > 0 ? `${selectedCount} nhân viên` : 'Chưa chọn nhân viên'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1 }} />

      {/* Zoom controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Thu nhỏ">
          <IconButton size="small" onClick={onZoomOut} disabled={zoom <= 50} aria-label="Thu nhỏ">
            <RemoveRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        <Button
          size="small"
          variant="outlined"
          onClick={onZoomReset}
          aria-label="Reset zoom về 100%"
          sx={{
            minWidth: 56,
            height: 30,
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: 1.5,
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': { borderColor: '#9CA3AF' },
          }}
        >
          {zoom}%
        </Button>

        <Tooltip title="Phóng to">
          <IconButton size="small" onClick={onZoomIn} disabled={zoom >= 200} aria-label="Phóng to">
            <AddRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Vừa khung">
          <IconButton size="small" onClick={onZoomFit} aria-label="Vừa khung">
            <FitScreenRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Print / PDF */}
      <Tooltip title="Xuất PDF (dùng tính năng In → Lưu thành PDF)">
        <IconButton
          size="small"
          onClick={onPrint}
          aria-label="Xuất PDF"
          sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
        >
          <PictureAsPdfRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      <Button
        variant="outlined"
        size="small"
        onClick={onSave}
        sx={{ borderRadius: 2, height: 34, fontSize: '0.8125rem', borderColor: 'divider', color: 'text.primary' }}
      >
        Lưu biểu
      </Button>

      <Button
        variant="contained"
        size="small"
        startIcon={<PrintRoundedIcon />}
        onClick={onPrint}
        sx={{ borderRadius: 2, height: 34, fontSize: '0.8125rem' }}
      >
        In biểu
      </Button>
    </Paper>
  );
});

export default PreviewToolbar;
