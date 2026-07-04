// src/theme.js
import { createTheme, alpha } from '@mui/material/styles';

// ─── Design Tokens ───────────────────────────────────────────────────────────
const COLORS = {
  // Primary – Kingdom Red (softer, 20% less aggressive)
  primary:   '#B91C1C',
  primaryHov:'#991B1B',
  primaryBg: 'rgba(185,28,28,0.05)',
  primaryBd: 'rgba(185,28,28,0.25)',

  // Neutrals
  bg:        '#F4F5F7',   // canvas
  surface:   '#FFFFFF',   // card/paper
  border:    '#E4E7EB',   // default border
  borderHov: '#C9CDD3',   // hover border
  muted:     '#F8F9FB',   // subtle bg for inputs

  // Text
  text1:     '#111827',   // headings
  text2:     '#374151',   // body
  text3:     '#6B7280',   // secondary / captions

  // Status
  success:   '#16A34A',
  warning:   '#D97706',
  error:     '#DC2626',

  // Divider
  divider:   '#E4E7EB',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main:         COLORS.primary,
      light:        '#EF4444',
      dark:         COLORS.primaryHov,
      contrastText: '#FFFFFF',
    },
    secondary: { main: '#6B7280' },
    background: {
      default: COLORS.bg,
      paper:   COLORS.surface,
    },
    text: {
      primary:   COLORS.text2,
      secondary: COLORS.text3,
    },
    success: { main: COLORS.success },
    warning: { main: COLORS.warning },
    error:   { main: COLORS.error },
    divider: COLORS.divider,
  },

  // ─── Typography ─────────────────────────────────────────────────────────────
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    htmlFontSize: 16,
    h1: { fontWeight: 700, lineHeight: 1.2 },
    h2: { fontWeight: 700, lineHeight: 1.3 },
    h3: { fontWeight: 600, lineHeight: 1.3 },
    h4: { fontWeight: 600, lineHeight: 1.4 },
    h5: { fontWeight: 600, lineHeight: 1.5 },
    h6: { fontWeight: 600, lineHeight: 1.5 },
    subtitle1: { fontWeight: 600, lineHeight: 1.5, fontSize: '0.9375rem' },
    subtitle2: { fontWeight: 600, lineHeight: 1.5, fontSize: '0.875rem' },
    body1: { fontWeight: 400, lineHeight: 1.6, fontSize: '0.875rem' },
    body2: { fontWeight: 400, lineHeight: 1.5, fontSize: '0.8125rem' },
    caption: { fontWeight: 400, lineHeight: 1.4, fontSize: '0.75rem', color: COLORS.text3 },
    overline: { fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.08em', lineHeight: 1.5 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0, fontSize: '0.875rem' },
  },

  // ─── Shape ──────────────────────────────────────────────────────────────────
  shape: { borderRadius: 10 },

  // ─── Shadows ─────────────────────────────────────────────────────────────────
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.05)',
    '0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    '0 2px 8px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
    '0 4px 16px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.04)',
    '0 6px 20px rgba(0,0,0,0.08)',
    '0 8px 24px rgba(0,0,0,0.09)',
    '0 10px 28px rgba(0,0,0,0.09)',
    '0 12px 32px rgba(0,0,0,0.10)',
    '0 14px 36px rgba(0,0,0,0.10)',
    '0 16px 40px rgba(0,0,0,0.11)',
    '0 18px 44px rgba(0,0,0,0.11)',
    '0 20px 48px rgba(0,0,0,0.12)',
    '0 22px 52px rgba(0,0,0,0.12)',
    '0 24px 56px rgba(0,0,0,0.12)',
    '0 26px 60px rgba(0,0,0,0.13)',
    '0 28px 64px rgba(0,0,0,0.13)',
    '0 30px 68px rgba(0,0,0,0.14)',
    '0 32px 72px rgba(0,0,0,0.14)',
    '0 34px 76px rgba(0,0,0,0.14)',
    '0 36px 80px rgba(0,0,0,0.15)',
    '0 38px 84px rgba(0,0,0,0.15)',
    '0 40px 88px rgba(0,0,0,0.16)',
    '0 42px 92px rgba(0,0,0,0.16)',
    '0 44px 96px rgba(0,0,0,0.16)',
  ],

  // ─── Component Overrides ─────────────────────────────────────────────────────
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: COLORS.bg,
          color: COLORS.text2,
          fontSize: '0.875rem',
          lineHeight: 1.6,
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#C9CDD3 transparent',
        },
        '*::-webkit-scrollbar': { width: 6, height: 6 },
        '*::-webkit-scrollbar-track': { background: 'transparent' },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: '#C9CDD3',
          borderRadius: 10,
          border: '1px solid transparent',
          backgroundClip: 'content-box',
        },
        '*::-webkit-scrollbar-thumb:hover': { backgroundColor: '#9CA3AF' },
        '::selection': {
          backgroundColor: alpha(COLORS.primary, 0.15),
          color: COLORS.primary,
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 38,
          paddingLeft: 16,
          paddingRight: 16,
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none', transform: 'translateY(-1px)' },
          '&:active': { transform: 'scale(0.98)', boxShadow: 'none' },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHov} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${COLORS.primaryHov} 0%, #7F1D1D 100%)`,
          },
        },
        outlinedPrimary: {
          borderColor: COLORS.primaryBd,
          color: COLORS.primary,
          '&:hover': {
            borderColor: COLORS.primary,
            backgroundColor: COLORS.primaryBg,
          },
        },
        outlinedInherit: {
          borderColor: COLORS.border,
          color: COLORS.text3,
          '&:hover': { borderColor: COLORS.borderHov, backgroundColor: COLORS.muted },
        },
        sizeSmall: { height: 32, paddingLeft: 12, paddingRight: 12, fontSize: '0.8125rem', borderRadius: 7 },
        sizeLarge: { height: 44, paddingLeft: 24, paddingRight: 24, fontSize: '0.9375rem', borderRadius: 10 },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 150ms ease',
          '&:hover': { backgroundColor: COLORS.muted, transform: 'translateY(-1px)' },
          '&:active': { transform: 'scale(0.95)' },
        },
        sizeSmall: { borderRadius: 6 },
      },
    },

    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small', fullWidth: true },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: COLORS.surface,
            fontSize: '0.875rem',
            transition: 'all 150ms ease',
            '& fieldset': { borderColor: COLORS.border },
            '&:hover fieldset': { borderColor: COLORS.borderHov },
            '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1.5 },
            '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(COLORS.primary, 0.08)}` },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: COLORS.primary },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.875rem',
          backgroundColor: COLORS.surface,
          '& fieldset': { borderColor: COLORS.border },
          '&:hover fieldset': { borderColor: COLORS.borderHov },
          '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1.5 },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& fieldset': { borderColor: COLORS.border },
          '&:hover fieldset': { borderColor: COLORS.borderHov },
          '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1.5 },
          '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(COLORS.primary, 0.08)}` },
        },
        input: { fontSize: '0.875rem', lineHeight: 1.5 },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          border: `1px solid ${COLORS.border}`,
          transition: 'box-shadow 200ms ease',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: 12 },
        elevation1: { boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' },
        elevation2: { boxShadow: '0 2px 8px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)' },
        elevation3: { boxShadow: '0 4px 16px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.04)' },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.6875rem',
          height: 22,
          letterSpacing: '0.01em',
        },
        label: { paddingLeft: 8, paddingRight: 8 },
        sizeSmall: { height: 18, fontSize: '0.625rem' },
      },
    },

    MuiTooltip: {
      defaultProps: { arrow: true, enterDelay: 600 },
      styleOverrides: {
        tooltip: {
          borderRadius: 7,
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor: '#1F2937',
          padding: '5px 10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        },
        arrow: { color: '#1F2937' },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.8125rem',
          textTransform: 'none',
          minHeight: 38,
          letterSpacing: 0,
          color: COLORS.text3,
          '&.Mui-selected': { color: COLORS.primary },
          '&:hover': { color: COLORS.text2 },
          transition: 'color 150ms ease',
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 38 },
        indicator: { backgroundColor: COLORS.primary, height: 2, borderRadius: 2 },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
          border: `1px solid ${COLORS.border}`,
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          fontWeight: 700,
          padding: '20px 24px 12px',
          color: COLORS.text1,
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: { padding: '8px 24px 16px' },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: { padding: '12px 24px 20px', gap: 8 },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: { fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.02em' },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: alpha(COLORS.primary, 0.06),
            '&:hover': { backgroundColor: alpha(COLORS.primary, 0.10) },
          },
          '&:hover': { backgroundColor: COLORS.muted },
        },
      },
    },

    MuiInputBase: {
      styleOverrides: {
        input: { fontSize: '0.875rem', lineHeight: 1.5 },
        inputSizeSmall: { paddingTop: '6px', paddingBottom: '6px' },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: '0.875rem', fontWeight: 500 },
        shrink: { backgroundColor: '#FFFFFF', paddingLeft: '4px', paddingRight: '4px', marginLeft: '-4px' },
        sizeSmall: { fontSize: '0.8125rem' },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: COLORS.divider },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          transition: 'transform 100ms ease',
          '&.Mui-checked': { transform: 'scale(1.05)' },
          '&:hover': { transform: 'scale(1.1)' },
        },
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge: { fontWeight: 700, fontSize: '0.6875rem' },
      },
    },

    MuiSnackbar: {
      defaultProps: { anchorOrigin: { vertical: 'bottom', horizontal: 'center' } },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10, fontWeight: 500, fontSize: '0.875rem' },
        filled: { boxShadow: '0 4px 16px rgba(0,0,0,0.18)' },
      },
    },

    MuiSkeleton: {
      styleOverrides: {
        root: { borderRadius: 6 },
        wave: {
          '&::after': {
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
          },
        },
      },
    },
  },

  transitions: {
    duration: { shortest: 100, shorter: 150, short: 200, standard: 300, complex: 375 },
    easing: { easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)' },
  },
});

export default theme;
