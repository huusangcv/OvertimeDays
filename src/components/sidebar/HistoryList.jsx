// src/components/sidebar/HistoryList.jsx
import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';

/**
 * HistoryList – Premium card list for saved records
 */
const HistoryList = memo(function HistoryList({
  otHistory,
  loadHistory,
  deleteHistory
}) {
  if (!otHistory || otHistory.length === 0) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 4 }}>
        <Box sx={{ p: 2, borderRadius: '50%', bgcolor: '#F3F4F6', color: '#9CA3AF' }}>
          <HistoryRoundedIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 200, lineHeight: 1.5 }}>
          Chưa có biểu tăng ca nào được lưu trong bộ nhớ.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 2, pt: 1.5 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {otHistory.map(record => (
          <Paper
            key={record.id}
            variant="outlined"
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              borderRadius: '12px',
              borderColor: 'transparent',
              backgroundColor: '#FAFAFA',
              transition: 'all 150ms ease',
              '&:hover': {
                backgroundColor: '#F4F5F7',
                borderColor: '#D4D7DC',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                '& .history-actions': { opacity: 1 },
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'text.primary', mb: 0.25 }}>
                  {record.date}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {record.type}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(185,28,28,0.08)', px: 1, py: 0.25, borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, fontSize: '0.6875rem' }}>
                  {record.selectedIds ? record.selectedIds.length : 0} NV
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.6875rem' }}>
                Lưu lúc: {new Date(record.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </Typography>

              <Box className="history-actions" sx={{ display: 'flex', gap: 0.5, opacity: { xs: 1, sm: 0 }, transition: 'opacity 150ms ease' }}>
                <Tooltip title="Khôi phục biểu này">
                  <IconButton 
                    size="small" 
                    onClick={() => loadHistory(record)}
                    sx={{ width: 28, height: 28, color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(185,28,28,0.08)' } }}
                  >
                    <RestoreRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xóa">
                  <IconButton 
                    size="small" 
                    onClick={() => deleteHistory(record.id)}
                    sx={{ width: 28, height: 28, color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'rgba(220,38,38,0.08)' } }}
                  >
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
});

export default HistoryList;
