import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Grid,
  Paper,
} from '@mui/material';
import { orderApi, Order, OrderStatus } from '../services/orderApi';
import { useAppSelector } from '../app/hooks';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Purchase: React.FC = () => {
  const { account } = useAppSelector((state) => state.user);
  const isAdmin = account?.role === 1;
  const accountId = account?._id || '';

  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const statusConfig = [
    { status: 'pending' as OrderStatus, label: 'Chờ xác nhận', icon: <HourglassEmptyIcon /> },
    { status: 'beingShipped' as OrderStatus, label: 'Đang giao hàng', icon: <LocalShippingIcon /> },
    { status: 'delivered' as OrderStatus, label: 'Hoàn thành', icon: <CheckCircleIcon /> },
    { status: 'cancelled' as OrderStatus, label: 'Đã huỷ', icon: <CancelIcon /> },
  ];

  useEffect(() => {
    fetchOrders();
  }, [isAdmin, accountId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      let fetchedOrders: Order[];

      if (isAdmin) {
        // Admin sees all orders
        fetchedOrders = await orderApi.getAllOrders();
      } else {
        // User sees only their orders
        if (!accountId) {
          setError('Vui lòng đăng nhập để xem đơn hàng');
          setLoading(false);
          return;
        }
        fetchedOrders = await orderApi.getOrdersByUserId(accountId);
      }

      setOrders(fetchedOrders);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách đơn hàng';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!accountId) return;

    try {
      setActionLoading(orderId);
      await orderApi.cancelOrder(orderId, accountId);
      await fetchOrders();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể huỷ đơn hàng';
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      setActionLoading(orderId);
      await orderApi.updateOrderStatus(orderId, 'beingShipped');
      await fetchOrders();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xác nhận đơn hàng';
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      setActionLoading(orderId);
      await orderApi.updateOrderStatus(orderId, 'delivered');
      await fetchOrders();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái';
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'beingShipped':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderOrderCard = (order: Order) => {
    const totalPrice = order.priceAtOrder * order.quantity;
    const isCurrentUserOrder = order.account._id === accountId;

    return (
      <Card key={order._id} sx={{ mb: 2 }} elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Mã đơn hàng: #{order._id.slice(-8).toUpperCase()}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                Ngày đặt: {formatDate(order.createdAt)}
              </Typography>
            </Box>
            <Chip
              label={statusConfig.find((s) => s.status === order.status)?.label}
              color={getStatusColor(order.status)}
              size="small"
            />
          </Box>

          {/* Show user info for admin */}
          {isAdmin && (
            <Paper elevation={0} sx={{ bgcolor: 'info.light', p: 1.5, mb: 2, borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Thông tin khách hàng:
              </Typography>
              <Typography variant="body2">
                Tên: {order.account.username}
              </Typography>
              <Typography variant="body2">
                {/* Email: {order.account.email} */}
              </Typography>
              <Typography variant="body2">
                {/* Ngày sinh: {order.account.dateOfBirth} */}
              </Typography>
            </Paper>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              {order.product.image && (
                <Box
                  component="img"
                  src={order.product.image}
                  alt={order.product.name}
                  sx={{
                    width: '100%',
                    height: 100,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.300',
                  }}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {order.product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đơn giá: {formatCurrency(order.priceAtOrder)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Số lượng: {order.quantity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Địa chỉ: {order.shippingAddress}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={700} color="error.main">
              {formatCurrency(totalPrice)}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* User can cancel order in pending tab */}
              {order.status === 'pending' && !isAdmin && isCurrentUserOrder && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleCancelOrder(order._id)}
                  disabled={actionLoading === order._id}
                >
                  {actionLoading === order._id ? <CircularProgress size={20} /> : 'Huỷ đơn'}
                </Button>
              )}

              {/* Admin can confirm order in pending tab */}
              {order.status === 'pending' && isAdmin && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleConfirmOrder(order._id)}
                  disabled={actionLoading === order._id}
                >
                  {actionLoading === order._id ? <CircularProgress size={20} /> : 'Xác nhận'}
                </Button>
              )}

              {/* User can mark as delivered in beingShipped tab */}
              {order.status === 'beingShipped' && !isAdmin && isCurrentUserOrder && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => handleMarkDelivered(order._id)}
                  disabled={actionLoading === order._id}
                >
                  {actionLoading === order._id ? <CircularProgress size={20} /> : 'Đã nhận'}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card >
    );
  };

  const getFilteredOrders = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        {isAdmin ? 'Quản lý đơn hàng' : 'Đơn hàng của tôi'}
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="order status tabs"
        >
          {statusConfig.map((config, index) => (
            <Tab
              key={config.status}
              label={config.label}
              icon={config.icon}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          ))}
        </Tabs>
      </Box>

      {statusConfig.map((config, index) => (
        <TabPanel key={config.status} value={tabValue} index={index}>
          {getFilteredOrders(config.status).length === 0 ? (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography variant="body1" color="text.secondary">
                Không có đơn hàng nào
              </Typography>
            </Paper>
          ) : (
            getFilteredOrders(config.status).map(renderOrderCard)
          )}
        </TabPanel>
      ))}
    </Container>
  );
};

export default Purchase;
