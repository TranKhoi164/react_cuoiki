import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { orderApi, Order, OrderStatus } from '../services/orderApi';
import HistoryIcon from '@mui/icons-material/History';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// Đã loại bỏ: import { format } from 'date-fns'; // Dùng để định dạng ngày tháng

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

// HÀM ĐỊNH DẠNG NGÀY THÁNG BẰNG JS THƯỜNG
const formatDateTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Không rõ';
  }

  // Định dạng giờ:phút
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
  const time = date.toLocaleTimeString('vi-VN', timeOptions);

  // Định dạng ngày/tháng/năm
  const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const datePart = date.toLocaleDateString('vi-VN', dateOptions);

  return `${time} ${datePart}`; // Kết quả: HH:mm dd/MM/yyyy
};


// Hàm hiển thị màu sắc cho trạng thái
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'delivered':
      return 'success.main';
    case 'pending':
    case 'beingShipped':
      return 'warning.main';
    case 'cancelled':
      return 'error.main';
    case 'inCart':
      return 'info.main';
    default:
      return 'grey.600';
  }
};

const statusMap: { [key in OrderStatus]: string } = {
  inCart: 'Trong giỏ hàng',
  pending: 'Đang chờ xử lý',
  beingShipped: 'Đang vận chuyển',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy',
};

const OrderHistory: React.FC = () => {
  const { userId } = useParams<{ userId: string }>(); // Lấy userId từ URL params
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch lịch sử đơn hàng theo userId
  useEffect(() => {
    if (!userId) {
      setError('Thiếu ID người dùng để tải lịch sử đơn hàng.');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // Sử dụng orderApi đã được thiết lập để lấy đơn hàng theo ID người dùng
        const data = await orderApi.getOrdersByUserId(userId);
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải lịch sử đơn hàng.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, alignSelf: 'flex-start' }}
      >
        Quay lại
      </Button>

      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
        <HistoryIcon sx={{ mr: 1, color: 'text.primary' }} /> Lịch sử Đơn hàng (User ID: {userId ? userId.slice(-6) : 'N/A'})
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {orders.length === 0 ? (
        <Alert severity="info">
          Người dùng này chưa có đơn hàng nào được tạo (hoặc tất cả đều ở trạng thái 'inCart').
        </Alert>
      ) : (
        <Stack spacing={3}>
          {orders.map((order) => {
            const totalPrice = order.priceAtOrder * order.quantity;

            return (
              <Card key={order._id} elevation={3}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">

                    {/* Cột 1: Mã Đơn hàng & Ngày đặt */}
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">Mã đơn hàng</Typography>
                      <Typography variant="body1" fontWeight={600}>#{order._id.slice(-8).toUpperCase()}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Ngày đặt: {formatDateTime(order.createdAt)} {/* <-- Đã thay đổi */}
                      </Typography>
                    </Grid>

                    {/* Cột 2: Sản phẩm & Số lượng */}
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {order.product.image && (
                          <Box
                            component="img"
                            src={order.product.image}
                            alt={order.product.name}
                            sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
                          />
                        )}
                        <Stack>
                          <Typography variant="body1" fontWeight={500}>{order.product.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            SL: {order.quantity} x {formatCurrency(order.priceAtOrder)}
                          </Typography>
                        </Stack>
                      </Box>
                    </Grid>

                    {/* Cột 3: Trạng thái */}
                    <Grid size={{ xs: 6, sm: 2 }} sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
                      <Typography variant="subtitle2" color="text.secondary">Trạng thái</Typography>
                      <Typography variant="body1" fontWeight={700} sx={{ color: getStatusColor(order.status) }}>
                        {statusMap[order.status]}
                      </Typography>
                    </Grid>

                    {/* Cột 4: Tổng tiền */}
                    <Grid size={{ xs: 6, sm: 2 }} sx={{ textAlign: { xs: 'right', sm: 'right' } }}>
                      <Typography variant="subtitle2" color="text.secondary">Tổng tiền</Typography>
                      <Typography variant="body1" fontWeight={700} color="error.main">
                        {formatCurrency(totalPrice)}
                      </Typography>
                    </Grid>

                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Container>
  );
};

export default OrderHistory;