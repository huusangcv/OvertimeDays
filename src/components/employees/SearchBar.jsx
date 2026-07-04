// src/components/employees/SearchBar.jsx
import React, { memo } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import IconButton from '@mui/material/IconButton';

/**
 * SearchBar – styled real-time search input
 * Props:
 *   value       : string
 *   onChange    : (value: string) => void
 *   placeholder?: string
 */
const SearchBar = memo(function SearchBar({ value, onChange, placeholder = 'Tìm tên hoặc mã nhân viên…' }) {
  return (
    <TextField
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      size="small"
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onChange('')} edge="end" aria-label="Xóa tìm kiếm">
                <ClearRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          backgroundColor: '#F9FAFB',
          '& fieldset': { borderColor: '#E5E7EB' },
          '&:hover fieldset': { borderColor: '#9CA3AF' },
          '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 1.5 },
        },
      }}
    />
  );
});

export default SearchBar;
