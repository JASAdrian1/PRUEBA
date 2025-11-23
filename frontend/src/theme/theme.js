import { createTheme, alpha } from '@mui/material/styles';

// Paleta de colores inspirada en el sistema de justicia guatemalteco
// con un toque moderno y profesional
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1B4F72', // Azul profundo institucional
      light: '#2874A6',
      dark: '#154360',
      contrastText: '#fff',
    },
    secondary: {
      main: '#D35400', // Naranja distintivo para acciones importantes
      light: '#E67E22',
      dark: '#BA4A00',
      contrastText: '#fff',
    },
    success: {
      main: '#239B56',
      light: '#27AE60',
      dark: '#1E8449',
    },
    error: {
      main: '#C0392B',
      light: '#E74C3C',
      dark: '#A93226',
    },
    warning: {
      main: '#F39C12',
      light: '#F7DC6F',
      dark: '#D68910',
    },
    info: {
      main: '#2980B9',
      light: '#5DADE2',
      dark: '#21618C',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
      dark: '#1B4F72',
    },
    text: {
      primary: '#212F3D',
      secondary: '#5D6D7E',
      disabled: '#95A5A6',
    },
    divider: alpha('#212F3D', 0.12),
    action: {
      active: '#1B4F72',
      hover: alpha('#1B4F72', 0.08),
      selected: alpha('#1B4F72', 0.12),
      disabled: alpha('#212F3D', 0.26),
      disabledBackground: alpha('#212F3D', 0.12),
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.75,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.08em',
      lineHeight: 2.66,
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(27,79,114,0.04),0px 1px 1px 0px rgba(27,79,114,0.04),0px 1px 3px 0px rgba(27,79,114,0.08)',
    '0px 3px 1px -2px rgba(27,79,114,0.04),0px 2px 2px 0px rgba(27,79,114,0.04),0px 1px 5px 0px rgba(27,79,114,0.08)',
    '0px 3px 3px -2px rgba(27,79,114,0.04),0px 3px 4px 0px rgba(27,79,114,0.04),0px 1px 8px 0px rgba(27,79,114,0.08)',
    '0px 2px 4px -1px rgba(27,79,114,0.04),0px 4px 5px 0px rgba(27,79,114,0.04),0px 1px 10px 0px rgba(27,79,114,0.08)',
    '0px 3px 5px -1px rgba(27,79,114,0.04),0px 5px 8px 0px rgba(27,79,114,0.04),0px 1px 14px 0px rgba(27,79,114,0.08)',
    '0px 3px 5px -1px rgba(27,79,114,0.04),0px 6px 10px 0px rgba(27,79,114,0.04),0px 1px 18px 0px rgba(27,79,114,0.08)',
    '0px 4px 5px -2px rgba(27,79,114,0.04),0px 7px 10px 1px rgba(27,79,114,0.04),0px 2px 16px 1px rgba(27,79,114,0.08)',
    '0px 5px 5px -3px rgba(27,79,114,0.04),0px 8px 10px 1px rgba(27,79,114,0.04),0px 3px 14px 2px rgba(27,79,114,0.08)',
    '0px 5px 6px -3px rgba(27,79,114,0.04),0px 9px 12px 1px rgba(27,79,114,0.04),0px 3px 16px 2px rgba(27,79,114,0.08)',
    '0px 6px 6px -3px rgba(27,79,114,0.04),0px 10px 14px 1px rgba(27,79,114,0.04),0px 4px 18px 3px rgba(27,79,114,0.08)',
    '0px 6px 7px -4px rgba(27,79,114,0.04),0px 11px 15px 1px rgba(27,79,114,0.04),0px 4px 20px 3px rgba(27,79,114,0.08)',
    '0px 7px 8px -4px rgba(27,79,114,0.04),0px 12px 17px 2px rgba(27,79,114,0.04),0px 5px 22px 4px rgba(27,79,114,0.08)',
    '0px 7px 8px -4px rgba(27,79,114,0.04),0px 13px 19px 2px rgba(27,79,114,0.04),0px 5px 24px 4px rgba(27,79,114,0.08)',
    '0px 7px 9px -4px rgba(27,79,114,0.04),0px 14px 21px 2px rgba(27,79,114,0.04),0px 5px 26px 4px rgba(27,79,114,0.08)',
    '0px 8px 9px -5px rgba(27,79,114,0.04),0px 15px 22px 2px rgba(27,79,114,0.04),0px 6px 28px 5px rgba(27,79,114,0.08)',
    '0px 8px 10px -5px rgba(27,79,114,0.04),0px 16px 24px 2px rgba(27,79,114,0.04),0px 6px 30px 5px rgba(27,79,114,0.08)',
    '0px 8px 11px -5px rgba(27,79,114,0.04),0px 17px 26px 2px rgba(27,79,114,0.04),0px 6px 32px 5px rgba(27,79,114,0.08)',
    '0px 9px 11px -5px rgba(27,79,114,0.04),0px 18px 28px 2px rgba(27,79,114,0.04),0px 7px 34px 6px rgba(27,79,114,0.08)',
    '0px 9px 12px -6px rgba(27,79,114,0.04),0px 19px 29px 2px rgba(27,79,114,0.04),0px 7px 36px 6px rgba(27,79,114,0.08)',
    '0px 10px 13px -6px rgba(27,79,114,0.04),0px 20px 31px 3px rgba(27,79,114,0.04),0px 8px 38px 7px rgba(27,79,114,0.08)',
    '0px 10px 13px -6px rgba(27,79,114,0.04),0px 21px 33px 3px rgba(27,79,114,0.04),0px 8px 40px 7px rgba(27,79,114,0.08)',
    '0px 10px 14px -6px rgba(27,79,114,0.04),0px 22px 35px 3px rgba(27,79,114,0.04),0px 8px 42px 7px rgba(27,79,114,0.08)',
    '0px 11px 14px -7px rgba(27,79,114,0.04),0px 23px 36px 3px rgba(27,79,114,0.04),0px 9px 44px 8px rgba(27,79,114,0.08)',
    '0px 11px 15px -7px rgba(27,79,114,0.04),0px 24px 38px 3px rgba(27,79,114,0.04),0px 9px 46px 8px rgba(27,79,114,0.08)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '8px 20px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(27,79,114,0.15)',
          },
        },
        contained: {
          boxShadow: '0 4px 14px rgba(27,79,114,0.1)',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1B4F72 0%, #2874A6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #154360 0%, #1B4F72 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #D35400 0%, #E67E22 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #BA4A00 0%, #D35400 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(27,79,114,0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(27,79,114,0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'all 0.3s',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1B4F72',
              },
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(27,79,114,0.1)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        colorPrimary: {
          background: 'linear-gradient(135deg, #1B4F72 0%, #2874A6 100%)',
        },
        colorSecondary: {
          background: 'linear-gradient(135deg, #D35400 0%, #E67E22 100%)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1B4F72 0%, #154360 100%)',
          boxShadow: '0 4px 20px rgba(27,79,114,0.15)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #1B4F72 0%, #154360 100%)',
          color: '#fff',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '4px 8px',
          transition: 'all 0.3s',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(255,255,255,0.15)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)',
            },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F8F9FA',
            fontWeight: 600,
            color: '#1B4F72',
            borderBottom: '2px solid #1B4F72',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha('#1B4F72', 0.04),
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 6px 20px rgba(27,79,114,0.15)',
          '&:hover': {
            boxShadow: '0 8px 28px rgba(27,79,114,0.25)',
          },
        },
        primary: {
          background: 'linear-gradient(135deg, #1B4F72 0%, #2874A6 100%)',
        },
        secondary: {
          background: 'linear-gradient(135deg, #D35400 0%, #E67E22 100%)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          backgroundColor: '#1B4F72',
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export default theme;
