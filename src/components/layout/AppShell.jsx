// src/components/layout/AppShell.jsx
import React, { memo } from 'react';
import Box from '@mui/material/Box';
import TopBar from './TopBar';

/**
 * AppShell – root layout: TopBar (64px) + [Sidebar | Content]
 * Props:
 *   topBarProps : props forwarded to TopBar
 *   sidebar     : React.ReactNode
 *   children    : React.ReactNode (main content)
 */
const AppShell = memo(function AppShell({ topBarProps, sidebar, children }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'background.default',
      }}
    >
      <TopBar {...topBarProps} />

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {sidebar}
        {children}
      </Box>
    </Box>
  );
});

export default AppShell;
