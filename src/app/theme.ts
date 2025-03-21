// src/app/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff', // your accent color
    },
    secondary: {
      main: '#6c757d', // example secondary color
    },
  },
});

export default theme;