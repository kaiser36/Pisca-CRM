import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5', // A shade of blue
      light: '#e8eaf6', // Lighter shade for selected/hover states
      dark: '#303f9f',
      contrastText: '#fff',
    },
    secondary: {
      main: '#f50057', // A shade of pink
    },
    info: {
      main: '#2196f3', // Blue for info
      light: '#e3f2fd', // Light blue background
      dark: '#1976d2',
      // lightest: '#f0f8ff', // Removed
    },
    success: {
      main: '#4caf50', // Green for success
      light: '#e8f5e9', // Light green background
      dark: '#388e3c',
      // lightest: '#f8fff8', // Removed
    },
    warning: {
      main: '#ff9800', // Orange for warning
      light: '#fff3e0', // Light orange background
      dark: '#f57c00',
      // lightest: '#fffaf0', // Removed
    },
    error: {
      main: '#f44336', // Red for error
      light: '#ffebee', // Light red background
      dark: '#d32f2f',
      // lightest: '#fffafa', // Removed
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
    background: {
      default: '#f4f6f8', // Light grey background for the app
      paper: '#ffffff', // White for cards and surfaces
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent uppercase by default
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Slightly rounded corners for cards
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&.Mui-expanded': {
            minHeight: 48,
          },
        },
        content: {
          margin: '12px 0',
          '&.Mui-expanded': {
            margin: '12px 0',
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '16px',
        },
      },
    },
  },
});

export default theme;