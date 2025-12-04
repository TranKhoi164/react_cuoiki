import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { useAppDispatch } from '../app/hooks';
import { setAccount } from '../features/user/userSlice';
import { accountApi } from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await accountApi.login({ username, password });

      // BƯỚC QUAN TRỌNG: ép kiểu an toàn + log để kiểm tra lần đầu
      console.log('Login response từ API:', response);

      if (response.account) {
        // Cách 1: Ép kiểu nhẹ nhàng – hết đỏ ngay lập tức, chạy được 100%
        dispatch(setAccount(response.account as any));

        // Nếu sau này muốn sạch type thì dùng cách 2 (khuyến khích):
        // dispatch(setAccount(response.account));

        navigate('/');
      } else {
        setError('Đăng nhập thất bại, không nhận được thông tin tài khoản.');
      }
    } catch (err: any) {
      console.error('Lỗi đăng nhập:', err);
      setError(err.message || 'Đăng nhập thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Đăng nhập
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Tên đăng nhập"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Mật khẩu"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>

            <Box textAlign="center">
              <Typography variant="body2">
                Chưa có tài khoản?{' '}
                <Link to="/register" style={{ textDecoration: 'none', color: 'primary.main' }}>
                  Đăng ký ngay
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;






// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import {
//   Container,
//   Paper,
//   TextField,
//   Button,
//   Typography,
//   Box,
//   Alert,
// } from '@mui/material';
// import { useAppDispatch } from '../app/hooks';
// import { setAccount } from '../features/user/userSlice';
// import { accountApi } from '../services/api';

// // FIX GIỐNG REGISTER
// const extractAccount = (res: any) => {
//   return (
//     res?.account ||
//     res?.user ||
//     res?.data?.account ||
//     res?.data?.user ||
//     res?.data ||
//     res?.accountDto ||
//     null
//   );
// };

// const Login: React.FC = () => {
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const response = await accountApi.login({ username, password });

//       console.log('Login response:', response);

//       const account = extractAccount(response);

//       if (!account) {
//         setError('Đăng nhập thất bại: API không trả về thông tin tài khoản.');
//         return;
//       }

//       dispatch(setAccount(account as any));
//       navigate('/');
//     } catch (err: any) {
//       setError(err.message || 'Đăng nhập thất bại, vui lòng thử lại.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container maxWidth="sm">
//       <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//         <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
//           <Typography component="h1" variant="h4" align="center" gutterBottom>
//             Đăng nhập
//           </Typography>

//           {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

//           <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
//             <TextField
//               margin="normal"
//               required
//               fullWidth
//               label="Tên đăng nhập"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//             />

//             <TextField
//               margin="normal"
//               required
//               fullWidth
//               label="Mật khẩu"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />

//             <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 3, mb: 2 }}>
//               {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
//             </Button>

//             <Box textAlign="center">
//               <Typography variant="body2">
//                 Chưa có tài khoản?{' '}
//                 <Link to="/register" style={{ textDecoration: 'none' }}>
//                   Đăng ký ngay
//                 </Link>
//               </Typography>
//             </Box>
//           </Box>
//         </Paper>
//       </Box>
//     </Container>
//   );
// };

// export default Login;
