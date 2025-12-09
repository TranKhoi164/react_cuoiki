import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent,
  Button,
  Divider,
  Grid,
} from '@mui/material';
import { accountApi, Account } from '../services/api';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HistoryIcon from '@mui/icons-material/History';

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch tất cả thông tin người dùng
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await accountApi.getAllAccounts();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách người dùng.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // 2. Xử lý click để xem lịch sử đơn hàng
  const handleViewOrderHistory = (userId: string) => {
    // Chuyển hướng đến trang lịch sử đơn hàng, giả sử route là: /orders/history/:userId
    navigate(`/orders/history/${userId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Quản lý Người dùng ({users.length})
      </Typography>

      <Stack spacing={3}>
        {users.map((user) => (
          <Card
            key={user._id}
            elevation={4}
            sx={{
              cursor: 'pointer',
              transition: '0.3s',
              '&:hover': {
                boxShadow: 8,
                bgcolor: 'grey.50'
              }
            }}
            onClick={() => handleViewOrderHistory(user._id)}
          >
            <CardContent>
              <Grid container spacing={2} alignItems="center">

                {/* 1. Biểu tượng và Username */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {user.role === 1 ? (
                      <AdminPanelSettingsIcon color="error" sx={{ fontSize: 32 }} />
                    ) : (
                      <AccountCircleIcon color="primary" sx={{ fontSize: 32 }} />
                    )}
                    <Stack>
                      <Typography variant="h6" fontWeight={600}>
                        {user.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Vai trò: {user.role === 1 ? 'Admin' : 'User thường'}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>

                {/* 2. Địa chỉ và Ngày sinh */}
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Địa chỉ: {user.address || 'Chưa cập nhật'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ngày sinh: {user?.dateOfBirth ? user?.dateOfBirth : 'Chưa cập nhật'}
                  </Typography>
                </Grid>

                {/* 3. Nút hành động */}
                <Grid size={{ xs: 12, sm: 3 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<HistoryIcon />}
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền lên Card
                      handleViewOrderHistory(user._id);
                    }}
                  >
                    Xem Đơn hàng
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
};

export default UserManagement;