import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import { accountApi, Account, UpdateAccountPayload } from '../services/api';
// Giả định bạn có app/hooks.ts để sử dụng Redux store
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setAccount } from '../features/user/userSlice';

// XÓA: const CURRENT_USER_ID = '60c72b2f90b8c60015b6c33c'; 

const UserProfile: React.FC = () => {
  const { account } = useAppSelector((state) => state.user); // Lấy account từ Redux state
  console.log('acount', account);
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State để lưu trữ dữ liệu người dùng đang chỉnh sửa
  const [formData, setFormData] = useState<UpdateAccountPayload>({});

  // Lấy ID người dùng từ Redux state
  const userId = account?._id;

  // 1. Tải dữ liệu hồ sơ khi component được mount
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError('Người dùng chưa đăng nhập.');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await accountApi.getAccountById(userId);
        setProfile(data);
        // Khởi tạo form data với dữ liệu tải về
        setFormData({
          username: data.username,
          address: data.address || '',
          // Chuyển đổi DateOfBirth (ISO string) sang định dạng YYYY-MM-DD cho input type="date"
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải hồ sơ người dùng.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]); // Chạy lại khi userId thay đổi

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. Xử lý lưu dữ liệu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !userId) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    // Tạo payload chỉ với các trường có giá trị (tránh gửi undefined)
    const payload: UpdateAccountPayload = {
      username: formData.username,
      address: formData.address,
      dateOfBirth: formData.dateOfBirth || undefined, // Gửi undefined nếu trống
    };

    try {
      const updatedProfile = await accountApi.updateAccount(userId, payload);
      setProfile(updatedProfile); // Cập nhật state profile chính
      dispatch(setAccount(updatedProfile));
      setSuccess('Cập nhật hồ sơ thành công!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định khi cập nhật.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!userId) {
    return <Container sx={{ mt: 4 }}><Alert severity="warning">Vui lòng đăng nhập để xem hồ sơ.</Alert></Container>;
  }

  if (error && !profile) {
    return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  if (!profile) return null;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Cập nhật Hồ sơ Người dùng
      </Typography>

      <Card elevation={3}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Stack spacing={3}>

              {/* Thông báo */}
              {success && <Alert severity="success">{success}</Alert>}
              {error && <Alert severity="error">{error}</Alert>}

              {/* Username */}
              <TextField
                fullWidth
                label="Tên đăng nhập (Username)"
                name="username"
                value={formData.username || ''}
                onChange={handleChange}
                required
                disabled={isSaving}
              />

              {/* Địa chỉ */}
              <TextField
                fullWidth
                label="Địa chỉ (Address)"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                disabled={isSaving}
                multiline
                rows={2}
              />

              {/* Ngày sinh */}
              <TextField
                fullWidth
                label="Ngày sinh (Date of Birth)"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={handleChange}
                disabled={isSaving}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              {/* Thông tin không thể chỉnh sửa */}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ID Tài khoản: {profile._id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vai trò: {profile.role === 1 ? 'Quản trị viên' : 'Người dùng'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ngày tạo: {new Date(profile.createdAt).toLocaleDateString()}
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isSaving}
                sx={{ py: 1.5 }}
              >
                {isSaving ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Lưu Thay Đổi'
                )}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default UserProfile;