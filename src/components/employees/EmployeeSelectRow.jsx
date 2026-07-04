// src/components/employees/EmployeeSelectRow.jsx
import React, { memo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import { alpha } from '@mui/material/styles';
import RoleChip from './RoleChip';

/** Generate initials avatar color based on employee id */
const AVATAR_COLORS = [
  '#5B6ABF', '#2E86AB', '#3D7A8A', '#5A7D7C',
  '#7D5BA6', '#B56576', '#6B4226', '#3B7A57',
];
const getAvatarColor = (id) =>
  AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0];

const getInitials = (name) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * EmployeeSelectRow – single row in the select-employee tab
 * Props:
 *   employee   : { id, name, role }
 *   selected   : boolean
 *   onToggle   : (id) => void
 */
const EmployeeSelectRow = memo(function EmployeeSelectRow({ employee, selected, onToggle }) {
  const { id, name, role } = employee;
  const avatarColor = getAvatarColor(id);
  const initials = getInitials(name);

  const handleClick = useCallback(() => onToggle(id), [id, onToggle]);

  return (
    <Box
      component="li"
      onClick={handleClick}
      role="option"
      aria-selected={selected}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1,
        cursor: 'pointer',
        borderRadius: 2,
        mx: 1,
        my: 0.25,
        transition: 'all 150ms ease',
        border: '1px solid',
        borderColor: selected ? 'primary.main' : 'transparent',
        backgroundColor: selected ? alpha('#C62828', 0.04) : 'transparent',
        '&:hover': {
          backgroundColor: selected ? alpha('#C62828', 0.07) : '#F9FAFB',
          borderColor: selected ? 'primary.main' : '#E5E7EB',
        },
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 34,
          height: 34,
          fontSize: '0.75rem',
          fontWeight: 700,
          bgcolor: selected ? 'primary.main' : avatarColor,
          flexShrink: 0,
          transition: 'background-color 150ms ease',
        }}
      >
        {initials}
      </Avatar>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          fontWeight={selected ? 600 : 500}
          noWrap
          sx={{ color: 'text.primary', lineHeight: 1.3 }}
        >
          {name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
          <Typography
            variant="caption"
            sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main', fontSize: '0.7rem' }}
          >
            {id}
          </Typography>
          <RoleChip role={role} />
        </Box>
      </Box>

      {/* Checkbox */}
      <Checkbox
        checked={selected}
        onChange={handleClick}
        onClick={e => e.stopPropagation()}
        size="small"
        color="primary"
        sx={{ p: 0.5, flexShrink: 0 }}
      />
    </Box>
  );
});

export default EmployeeSelectRow;
