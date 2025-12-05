import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Checkbox,
  IconButton,
  Tooltip,
  useTheme,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import { useAppSelector } from '../app/hooks'; // Giả định import từ app/hooks
import { orderApi, Order } from '../services/orderApi';
import { LocationOn } from '@mui/icons-material';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Lấy ID người dùng từ Redux state
  const { account } = useAppSelector((state) => state.user);
  const userId = account?._id;

  const [allUserOrders, setAllUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Lọc ra các đơn hàng có trạng thái "inCart"
  const cartItems = useMemo(() =>
    allUserOrders.filter(order => order.status === 'inCart'),
    [allUserOrders]
  );

  // Tính tổng tiền của các đơn hàng đã chọn
  const totalSelectedPrice = useMemo(() => {
    return cartItems
      .filter(item => selectedOrderIds.includes(item._id))
      .reduce((sum, item) => sum + (item.priceAtOrder * item.quantity), 0);
  }, [cartItems, selectedOrderIds]);


  // 1. Fetch đơn hàng của người dùng hiện tại
  const fetchOrders = async () => {
    if (!userId) {
      setLoading(false);
      setError('Vui lòng đăng nhập để xem giỏ hàng.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Gọi API lấy tất cả đơn hàng của user và lọc trạng thái "inCart" ở Frontend
      const ordersData = await orderApi.getOrdersByUserId(userId);
      setAllUserOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải giỏ hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);


  // 2. Xử lý Checkbox
  const handleToggle = (orderId: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(cartItems.map(item => item._id));
    } else {
      setSelectedOrderIds([]);
    }
  };


  // 3. Xử lý Xóa Đơn hàng
  const handleDelete = async (orderId: string) => {
    if (!userId) return;
    try {
      // Sử dụng cancelOrder như hành động xóa trong trường hợp này
      await orderApi.cancelOrder(orderId, userId);
      // Cập nhật danh sách đơn hàng sau khi xóa
      setAllUserOrders(prev => prev.filter(order => order._id !== orderId));
      setSelectedOrderIds(prev => prev.filter(id => id !== orderId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi xóa đơn hàng.');
    }
  };


  // 4. Xử lý Thanh toán Đơn lẻ
  const handleCheckoutSingle = (orderId: string) => {
    navigate(`/payment?orderIds=${orderId}`);
  };


  // 5. Xử lý Thanh toán Tất cả (Đã chọn)
  const handleCheckoutMultiple = () => {
    if (selectedOrderIds.length === 0) {
      setError('Vui lòng chọn ít nhất một đơn hàng để thanh toán.');
      return;
    }
    const idsString = selectedOrderIds.join(',');
    navigate(`/payment?orderIds=${idsString}`);
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <ShoppingCartIcon sx={{ fontSize: 80, color: theme.palette.grey[400], mb: 2 }} />
        <Typography variant="h5" color="text.secondary">
          Giỏ hàng của bạn đang trống.
        </Typography>
        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/')}>
          Tiếp tục mua sắm
        </Button>
      </Container>
    );
  }

  // Tính trạng thái checkbox toàn bộ
  const isAllSelected = selectedOrderIds.length === cartItems.length && cartItems.length > 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
        <ShoppingCartIcon sx={{ mr: 1 }} color="primary" /> Giỏ hàng của tôi ({cartItems.length})
      </Typography>

      <Grid container spacing={4}>
        {/* Cột chính: Danh sách đơn hàng */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {/* Header Cột (Chỉ hiển thị trên màn hình lớn) */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'block' },
                p: 1,
                borderBottom: `2px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.grey[50],
                borderRadius: 1
              }}
            >
              <Grid container alignItems="center">
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ ml: 4 }}>Sản phẩm</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} align="center">Số lượng</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="subtitle2" fontWeight={600} align="right">Thành tiền</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} align="right">Hành động</Typography>
                </Grid>
              </Grid>
            </Box>

            {cartItems.map(order => (
              <Box key={order._id} sx={{ p: 2, border: `1px solid ${theme.palette.grey[300]}`, borderRadius: 2 }}>
                <Grid container alignItems="center" spacing={2}>

                  {/* Checkbox và Thông tin Sản phẩm (Chiếm 5/12) */}
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        checked={selectedOrderIds.includes(order._id)}
                        onChange={() => handleToggle(order._id)}
                      />
                      {order.product.image && (
                        <Box
                          component="img"
                          src={order.product.image}
                          alt={order.product.name}
                          sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1, mr: 1 }}
                        />
                      )}
                      <Typography variant="body1" fontWeight={500}>{order.product.name}</Typography>
                    </Box>
                  </Grid>

                  {/* Số lượng (Chiếm 2/12) */}
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: { xs: 'block', sm: 'none' } }} // Label mobile
                    >SL:
                    </Typography>
                    <Typography variant="body1" align="center" fontWeight={600}>
                      {order.quantity}
                    </Typography>
                  </Grid>

                  {/* Giá (Chiếm 3/12) */}
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: { xs: 'block', sm: 'none' } }} // Label mobile
                    >Thành tiền:
                    </Typography>
                    <Typography variant="subtitle1" color="error.main" fontWeight={700} align="right">
                      {formatCurrency(order.priceAtOrder * order.quantity)}
                    </Typography>
                  </Grid>

                  {/* Hành động (Chiếm 2/12) */}
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 1, mt: { xs: 1, sm: 0 } }}>
                      <Tooltip title="Xóa đơn hàng">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(order._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Thanh toán ngay">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleCheckoutSingle(order._id)}
                        >
                          Thanh toán
                        </Button>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Stack>
        </Grid>

        {/* Cột phụ: Tóm tắt & Thanh toán Tổng thể */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 3, bgcolor: theme.palette.grey[100], borderRadius: 2, position: 'sticky', top: theme.spacing(4) }}>

            <Typography variant="h6" gutterBottom>Tóm tắt Giỏ hàng</Typography>
            <Divider sx={{ mb: 2 }} />

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight={500}>
                Tổng số mục đã chọn:
              </Typography>
              <Typography variant="subtitle1" fontWeight={700}>
                {selectedOrderIds.length}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" color="primary.main">
                Tổng thanh toán:
              </Typography>
              <Typography variant="h4" color="error.main" fontWeight={700}>
                {formatCurrency(totalSelectedPrice)}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={500} sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={isAllSelected}
                  onChange={(e) => handleToggleAll(e.target.checked)}
                  color="primary"
                />
                Chọn tất cả ({cartItems.length})
              </Typography>
              <Button
                variant="contained"
                color="success"
                onClick={handleCheckoutMultiple}
                disabled={selectedOrderIds.length === 0}
                startIcon={<PaymentIcon />}
                sx={{ py: 1.5, fontWeight: 700 }}
              >
                Thanh toán Tất cả
              </Button>
            </Box>

          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;