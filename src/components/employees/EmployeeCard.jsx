// src/components/employees/EmployeeCard.jsx
import React, { memo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RoleChip from './RoleChip';

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
 * EmployeeCard – card item in the manage-employees tab
 * Props:
 *   employee    : { id, name, role }
 *   index       : number
 *   onEdit      : (id) => void
 *   onDelete    : (id) => void
 */
const EmployeeCard = memo(function EmployeeCard({ employee, index, onEdit, onDelete }) {
  const { id, name, role } = employee;
  const avatarColor = getAvatarColor(id);
  const initials = getInitials(name);

  const handleEdit = useCallback(() => onEdit(id), [id, onEdit]);
  const handleDelete = useCallback(() => onDelete(id), [id, onDelete]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        border: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        transition: 'all 150ms ease',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderColor: '#D1D5DB',
        },
      }}
    >
      {/* Index */}
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          bgcolor: '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary' }}>
          {index + 1}
        </Typography>
      </Box>

      {/* Avatar */}
      <Avatar
        sx={{
          width: 32,
          height: 32,
          fontSize: '0.7rem',
          fontWeight: 700,
          bgcolor: avatarColor,
          flexShrink: 0,
        }}
      >
        {initials}
      </Avatar>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap sx={{ color: 'text.primary', lineHeight: 1.3 }}>
          {name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
          <Typography
            variant="caption"
            sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main', fontSize: '0.68rem' }}
          >
            {id}
          </Typography>
          <RoleChip role={role} />
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
        <Tooltip title="Chỉnh sửa" placement="top">
          <IconButton
            size="small"
            onClick={handleEdit}
            aria-label={`Chỉnh sửa ${name}`}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'primary.main', bgcolor: 'rgba(198,40,40,0.06)' },
            }}
          >
            <EditRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Xóa" placement="top">
          <IconButton
            size="small"
            onClick={handleDelete}
            aria-label={`Xóa ${name}`}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'error.main', bgcolor: 'rgba(239,68,68,0.06)' },
            }}
          >
            <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
});

export default EmployeeCard;
