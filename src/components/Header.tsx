
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
            Cửa hàng trực tuyến
          </Link>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isAuthenticated ? (
            <>
              <Typography variant="body1" sx={{ alignSelf: 'center' }}>
                Xin chào, {account?.username}
              </Typography>
              {account?.role === 1 && (
                <>
                  <Button color="inherit" component={Link} to="/create_product">
                    Tạo sản phẩm
                  </Button>

                  <Button color="inherit" component={Link} to="/warehouse">
                    Kho hàng
                  </Button>

                  <Button color="inherit" component={Link} to="/import-orders">
                    Phiếu nhập
                  </Button>
                </>
                
              )}
              <Button color="inherit" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Đăng nhập
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Đăng ký
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
