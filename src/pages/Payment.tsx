import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Paper,
  Stack, // Thêm Stack để quản lý bố cục dọc
} from '@mui/material';
import { orderApi, Order } from '../services/orderApi';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useTheme } from '@mui/material/styles'; // Thêm useTheme để lấy màu sắc

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const Payment: React.FC = () => {
  // Thay thế useParams bằng useLocation để lấy query string
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  // Thay đổi state từ Order | null sang Order[]
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Lấy IDs từ query string
    const params = new URLSearchParams(location.search);
    const orderIdsParam = params.get('orderIds'); // Lấy chuỗi IDs (ví dụ: "id1,id2,id3")

    console.log(orderIdsParam);

    if (!orderIdsParam) {
      setError('Không tìm thấy mã đơn hàng nào trong URL. Vui lòng thêm ?orderIds=id1,id2,...');
      setLoading(false);
      return;
    }

    // Tách chuỗi IDs thành mảng và loại bỏ khoảng trắng thừa
    const ids = orderIdsParam.split(',').map(id => id.trim()).filter(id => id);

    if (ids.length === 0) {
      setError('Không tìm thấy mã đơn hàng nào hợp lệ.');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tất cả đơn hàng đồng thời
        const orderPromises = ids.map(id => orderApi.getOrderById(id));
        const ordersData = await Promise.all(orderPromises);

        setOrders(ordersData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể tải thông tin đơn hàng';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [location.search]);

  const handleConfirmPayment = async () => {
    if (orders.length === 0) return;

    try {
      setConfirming(true);
      setError(null);
      setStatusMessage(null);

      // Cập nhật trạng thái cho TẤT CẢ các đơn hàng
      const updatePromises = orders.map(order => {
        if (order.status !== 'pending') {
          return orderApi.updateOrderStatus(order._id, 'pending');
        }
        return Promise.resolve(order);
      });

      const updatedResults = await Promise.all(updatePromises);

      // Cập nhật lại state với trạng thái mới (pending)
      setOrders(updatedResults.map(o => ({ ...o, status: 'pending' } as Order)));

      setStatusMessage(`Đã xác nhận ${orders.length} đơn hàng và chuyển sang trạng thái chờ xử lý.`);

      // Đợi một chút để người dùng thấy thông báo, sau đó chuyển hướng
      setTimeout(() => {
        navigate('/purchase'); // Giả định '/purchase' là trang thành công
      }, 1500);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xác nhận thanh toán';
      setError(message);
    } finally {
      if (!statusMessage) {
        setConfirming(false);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Tính tổng giá trị cuối cùng của TẤT CẢ đơn hàng
  const totalFinalPrice = orders.reduce((sum, order) => sum + (order.priceAtOrder * order.quantity), 0);

  if (error || orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Không tìm thấy đơn hàng nào để xác nhận'}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Quay lại trang chủ
        </Button>
      </Container>
    );
  }


  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={8} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>

          {/* Header & Thông báo */}
          <Box sx={{ textAlign: 'center', mb: 4, pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 72, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              XÁC NHẬN ĐƠN HÀNG
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Tổng số: {orders.length} đơn hàng.
            </Typography>
          </Box>

          {/* Alert cho lỗi/thành công */}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {statusMessage && <Alert severity="success" sx={{ mb: 2 }}>{statusMessage}</Alert>}

          {/* KHỐI LẶP QUA TỪNG ĐƠN HÀNG */}
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', color: theme.palette.primary.main }}>
            <LocalShippingIcon sx={{ mr: 1 }} /> Chi tiết các đơn hàng
          </Typography>

          <Stack spacing={2} sx={{ mb: 4 }}>
            {orders.map((order, index) => (
              <Paper key={order._id} elevation={1} sx={{ p: 3, border: `1px solid ${theme.palette.grey[200]}` }}>
                {/* Header Đơn hàng */}
                <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ mb: 2 }}>
                  Đơn hàng #{index + 1} (ID: {order._id.slice(-8).toUpperCase()})
                </Typography>

                {/* Thông tin Sản phẩm */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 1, borderBottom: `1px dashed ${theme.palette.grey[300]}` }}>
                  {order.product.image && (
                    <Box
                      component="img"
                      src={order.product.image}
                      alt={order.product.name}
                      sx={{
                        width: 48,
                        height: 48,
                        objectFit: 'cover',
                        borderRadius: 1,
                        mr: 2,
                      }}
                    />
                  )}
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {order.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      SL: {order.quantity} x {formatCurrency(order.priceAtOrder)}
                    </Typography>
                  </Box>
                </Box>

                {/* Địa chỉ & Thanh toán */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 1 }} /> Địa chỉ: {order.shippingAddress}
                    </Typography>
                    {/* <Typography variant="body2" fontWeight={500} ml={3}>
                      {order.shippingAddress}
                    </Typography> */}
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} /> Thanh toán: {order.paymentOffline ? 'COD' : 'Online'}
                    </Typography>
                    {/* <Typography variant="body2" fontWeight={500} ml={3} mt={0} pt={0}>
                      {order.paymentOffline ? 'COD' : 'Online'}
                    </Typography> */}
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body1" fontWeight={700} color="error.main" sx={{ mt: 1, textAlign: 'right' }}>
                      Thành tiền: {formatCurrency(order.priceAtOrder * order.quantity)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>
          {/* HẾT KHỐI LẶP */}


          {/* TỔNG THANH TOÁN (Footer Summary) - Đặt ở cuối CardContent */}
          <Box
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              p: 3,
              borderRadius: 2,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 1, opacity: 0.8 }}>
              Tổng giá trị tất cả đơn hàng
            </Typography>
            <Divider sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.4)' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" fontWeight={600}>
                TỔNG CỘNG
              </Typography>
              <Typography variant="h4" fontWeight={700} color="inherit">
                {formatCurrency(totalFinalPrice)}
              </Typography>
            </Box>
          </Box>

          {/* NÚT HÀNH ĐỘNG (Đặt ở cuối) */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => navigate(-1)}
              disabled={confirming}
              startIcon={<ArrowBackIcon />}
              sx={{ py: 1 }}
            >
              Quay lại
            </Button>
            <Button
              variant="contained"
              color="success"
              size="large"
              fullWidth
              onClick={handleConfirmPayment}
              disabled={confirming}
              startIcon={confirming ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutlineIcon />}
              sx={{ py: 1.5, fontWeight: 700 }}
            >
              {confirming ? 'Đang xác nhận...' : 'XÁC NHẬN ĐẶT HÀNG'}
            </Button>
          </Box>

        </CardContent>
      </Card>
    </Container>
  );
};

export default Payment;