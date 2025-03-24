import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div">
            Order Management System
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 