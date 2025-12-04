// src/pages/customer/MyOrders.tsx
import React from 'react';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Chip, Box, Alert
} from '@mui/material';
import { useAppSelector } from '../../app/hooks';
import { orderApi } from '../../services/api';
import { Order, OrderStatus } from '../../types/Order';

const statusColors: Record<OrderStatus, 'default' | 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  confirmed: 'default',
  delivering: 'default',
  delivered: 'success',
  cancelled: 'error',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  delivering: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

const MyOrders: React.FC = () => {
  const { account } = useAppSelector(state => state.user);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (account) {
      orderApi.list(account._id).then(setOrders).finally(() => setLoading(false));
    }
  }, [account]);

  const handleCancel = async (id: string) => {
    if (window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) {
      try {
        await orderApi.cancel(id, account?.role);
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'cancelled' } : o));
        setMessage('Hủy đơn thành công! Kho đã được hoàn lại.');
        setTimeout(() => setMessage(null), 3000);
      } catch (err) {
        alert('Hủy thất bại');
      }
    }
  };

  if (!account) return <Typography>Vui lòng đăng nhập</Typography>;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Đơn hàng của tôi</Typography>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      {loading ? <Typography>Đang tải...</Typography> :
        orders.length === 0 ? <Typography>Chưa có đơn hàng nào</Typography> :
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn</TableCell>
                  <TableCell>Ngày đặt</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id.slice(-6)}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{order.totalAmount.toLocaleString('vi-VN')}₫</TableCell>
                    <TableCell>
                      <Chip label={statusLabels[order.status]} color={statusColors[order.status]} size="small" />
                    </TableCell>
                    <TableCell>
                      {order.status === 'pending' && (
                        <Button size="small" color="error" onClick={() => handleCancel(order._id)}>
                          Hủy đơn
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
      }
    </Container>
  );
};

export default MyOrders;













