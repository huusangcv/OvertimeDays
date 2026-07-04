// src/components/sidebar/FormInfoSection.jsx
import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { OT_TYPES, MAX_ROWS } from '../../constants';

/**
 * FormInfoSection – Phiếu info area in sidebar
 * Props:
 *   otDate        : string (ISO date)
 *   setOtDate     : (v) => void
 *   otType        : string
 *   setOtType     : (v) => void
 *   selectedCount : number
 */
const FormInfoSection = memo(function FormInfoSection({
  otDate,
  setOtDate,
  otType,
  setOtType,
  selectedCount,
}) {
  return (
    <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
      {/* Section header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography
          variant="overline"
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'text.secondary',
            letterSpacing: '0.08em',
          }}
        >
          Thông tin phiếu
        </Typography>
        <Chip
          label={`${selectedCount} / ${MAX_ROWS}`}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.6875rem',
            fontWeight: 700,
            bgcolor: selectedCount > 0 ? 'rgba(198,40,40,0.08)' : '#F3F4F6',
            color: selectedCount > 0 ? 'primary.main' : 'text.secondary',
            borderRadius: '5px',
            '& .MuiChip-label': { px: '8px' },
          }}
        />
      </Box>

      {/* Date */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
          <CalendarMonthRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ letterSpacing: '0.03em' }}>
            Ngày tăng ca
          </Typography>
        </Box>
        <TextField
          type="date"
          value={otDate}
          onChange={e => setOtDate(e.target.value)}
          size="small"
          fullWidth
          slotProps={{ input: { 'aria-label': 'Ngày tăng ca' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: '#F9FAFB',
              fontSize: '0.875rem',
            },
          }}
        />
      </Box>

      {/* OT Type */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
          <AccessTimeRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ letterSpacing: '0.03em' }}>
            Loại tăng ca
          </Typography>
        </Box>
        <FormControl fullWidth size="small">
          <Select
            value={otType}
            onChange={e => setOtType(e.target.value)}
            displayEmpty
            aria-label="Loại tăng ca"
            sx={{
              borderRadius: 2,
              backgroundColor: '#F9FAFB',
              fontSize: '0.875rem',
            }}
          >
            {OT_TYPES.map(t => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ mt: 2.5, mx: -2.5 }} />
    </Box>
  );
});

export default FormInfoSection;
