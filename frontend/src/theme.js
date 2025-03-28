import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff9800', 
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#fff'
    },
    orange: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      100: '#ffe0b2',
      200: '#ffcc80'
    }
  }
});

export default theme;