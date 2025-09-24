import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // Um tom de índigo, semelhante ao Minimal Dashboard
    },
    secondary: {
      main: '#f50057', // Um tom de rosa
    },
    background: {
      default: '#f4f6f8', // Fundo cinzento claro
      paper: '#ffffff', // Branco para cartões e superfícies
    },
    text: {
      primary: '#212B36', // Cinzento escuro para texto primário
      secondary: '#637381', // Cinzento mais claro para texto secundário
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif', // Fonte padrão do Material UI
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Manter o texto do botão como está
          borderRadius: '8px', // Cantos ligeiramente arredondados
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // Cartões mais arredondados
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)', // Sombra subtil
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none', // Sem sombra para a barra de aplicação
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)', // Borda inferior subtil
        },
      },
    },
  },
});

export default theme;