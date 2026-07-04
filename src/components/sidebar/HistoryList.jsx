// src/components/sidebar/HistoryList.jsx
import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import Paper from '@mui/material/Paper';

/**
 * HistoryList – Display saved overtime histories
 */
const HistoryList = memo(function HistoryList({
  otHistory,
  loadHistory,
  deleteHistory
}) {
  if (!otHistory || otHistory.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Chưa có biểu tăng ca nào được lưu.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {otHistory.map(record => (
          <Paper
            key={record.id}
            variant="outlined"
            sx={{
              p: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              borderRadius: 2,
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {record.date}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {record.type}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {record.selectedIds ? record.selectedIds.length : 0} nhân viên
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mt: 0.5 }}>
              <IconButton 
                size="small" 
                color="primary"
                onClick={() => loadHistory(record)}
                title="Khôi phục biểu này"
              >
                <RestoreRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                color="error"
                onClick={() => deleteHistory(record.id)}
                title="Xóa biểu này"
              >
                <DeleteRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
});

export default HistoryList;
