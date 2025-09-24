import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5', // A shade of blue
    },
    secondary: {
      main: '#f50057', // A shade of pink
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default theme;