import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearAccount } from '../features/user/userSlice';
import { accountApi } from '../services/api';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { account, isAuthenticated } = useAppSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      await accountApi.logout();
      dispatch(clearAccount());
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(clearAccount());
      navigate('/');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            My App
          </Link>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isAuthenticated ? (
            <>
              <Typography variant="body1" sx={{ alignSelf: 'center' }}>
                {account?.username}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

