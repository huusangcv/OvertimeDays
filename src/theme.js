// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#C62828',
      light: '#EF5350',
      dark: '#8E0000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6B7280',
    },
    background: {
      default: '#F5F6F8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
    success: { main: '#22C55E' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    divider: '#ECECEC',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
    caption: { fontWeight: 400, color: '#6B7280' },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0,0,0,0.06), 0px 1px 2px rgba(0,0,0,0.04)',
    '0px 2px 6px rgba(0,0,0,0.07), 0px 1px 3px rgba(0,0,0,0.04)',
    '0px 4px 12px rgba(0,0,0,0.08), 0px 2px 4px rgba(0,0,0,0.04)',
    '0px 6px 16px rgba(0,0,0,0.09)',
    '0px 8px 24px rgba(0,0,0,0.10)',
    '0px 10px 28px rgba(0,0,0,0.10)',
    '0px 12px 32px rgba(0,0,0,0.11)',
    '0px 14px 36px rgba(0,0,0,0.11)',
    '0px 16px 40px rgba(0,0,0,0.12)',
    '0px 18px 44px rgba(0,0,0,0.12)',
    '0px 20px 48px rgba(0,0,0,0.13)',
    '0px 22px 52px rgba(0,0,0,0.13)',
    '0px 24px 56px rgba(0,0,0,0.14)',
    '0px 26px 60px rgba(0,0,0,0.14)',
    '0px 28px 64px rgba(0,0,0,0.14)',
    '0px 30px 68px rgba(0,0,0,0.15)',
    '0px 32px 72px rgba(0,0,0,0.15)',
    '0px 34px 76px rgba(0,0,0,0.16)',
    '0px 36px 80px rgba(0,0,0,0.16)',
    '0px 38px 84px rgba(0,0,0,0.16)',
    '0px 40px 88px rgba(0,0,0,0.17)',
    '0px 42px 92px rgba(0,0,0,0.17)',
    '0px 44px 96px rgba(0,0,0,0.18)',
    '0px 46px 100px rgba(0,0,0,0.18)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F5F6F8',
          scrollbarWidth: 'thin',
          scrollbarColor: '#D1D5DB transparent',
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#D1D5DB',
            borderRadius: 8,
            '&:hover': { backgroundColor: '#9CA3AF' },
          },
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#D1D5DB transparent',
          '&::-webkit-scrollbar': { width: 6, height: 6 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#D1D5DB',
            borderRadius: 6,
            '&:hover': { backgroundColor: '#9CA3AF' },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 40,
          paddingLeft: 16,
          paddingRight: 16,
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'all 150ms ease',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          '&:hover': { backgroundColor: '#AD1F1F' },
        },
        outlinedPrimary: {
          borderColor: '#C62828',
          '&:hover': { borderColor: '#AD1F1F', backgroundColor: 'rgba(198,40,40,0.04)' },
        },
        sizeSmall: { height: 32, paddingLeft: 12, paddingRight: 12, fontSize: '0.8125rem' },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small', fullWidth: true },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#fff',
            fontSize: '0.875rem',
            '& fieldset': { borderColor: '#E5E7EB' },
            '&:hover fieldset': { borderColor: '#9CA3AF' },
            '&.Mui-focused fieldset': { borderColor: '#C62828', borderWidth: 1.5 },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#C62828' },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 8, fontSize: '0.875rem', backgroundColor: '#fff' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& fieldset': { borderColor: '#E5E7EB' },
          '&:hover fieldset': { borderColor: '#9CA3AF' },
          '&.Mui-focused fieldset': { borderColor: '#C62828', borderWidth: 1.5 },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 1px 3px rgba(0,0,0,0.06), 0px 1px 2px rgba(0,0,0,0.04)',
          border: '1px solid #E5E7EB',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.7rem',
          height: 20,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: '0.75rem',
          backgroundColor: '#1F2937',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.8125rem',
          textTransform: 'none',
          minHeight: 40,
          '&.Mui-selected': { color: '#C62828' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#C62828' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 20 },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontSize: '0.875rem', fontWeight: 700 },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: 'rgba(198,40,40,0.06)',
            '&:hover': { backgroundColor: 'rgba(198,40,40,0.10)' },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: { fontSize: '0.875rem' },
      },
    },
  },
  transitions: {
    duration: { shortest: 150, shorter: 200, short: 250 },
  },
});

export default theme;
