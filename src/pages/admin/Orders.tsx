// src/pages/admin/Orders.tsx
import React from 'react';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, Box
} from '@mui/material';
import { useAppSelector } from '../../app/hooks';
import { orderApi } from '../../services/api';
import { Order } from '../../types/Order'; 
import { Navigate } from 'react-router-dom';

const statusColors = {
  pending: 'warning', confirmed: 'info', delivering: 'primary',
  delivered: 'success', cancelled: 'error'
} as const;

const statusLabels = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
  delivering: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy'
};

const AdminOrders: React.FC = () => {
  const { account } = useAppSelector(state => state.user);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (account?.role === 1) {
      orderApi.list().then(setOrders).finally(() => setLoading(false));
    }
  }, [account]);

  if (!account || account.role !== 1) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Quản lý đơn hàng</Typography>

      {loading ? <Typography>Đang tải...</Typography> :
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Ngày đặt</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order._id}>
                  <TableCell>{order._id.slice(-6)}</TableCell>
                  <TableCell>{order.account}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleString('vi-VN')}</TableCell>
                  <TableCell>{order.totalAmount.toLocaleString('vi-VN')}₫</TableCell>
                  <TableCell>
                    <Chip label={statusLabels[order.status]} color={statusColors[order.status]} size="small" />
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

export default AdminOrders;






// // src/pages/admin/Orders.tsx
// import React from 'react';
// import {
//   Container, Typography, Table, TableBody, TableCell, TableContainer,
//   TableHead, TableRow, Paper, Chip
// } from '@mui/material';
// import { useAppSelector } from '../../app/hooks';
// import { orderApi, Order as ApiOrder } from '../../services/api';
// import { Navigate } from 'react-router-dom';

// // Cập nhật tất cả trạng thái từ API
// const statusColors: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'error' | 'default'> = {
//   inCart: 'default',
//   pending: 'warning',
//   beingShipped: 'primary',
//   confirmed: 'info',
//   delivering: 'primary',
//   delivered: 'success',
//   cancelled: 'error'
// };

// const statusLabels: Record<string, string> = {
//   inCart: 'Trong giỏ',
//   pending: 'Chờ xác nhận',
//   beingShipped: 'Đang giao',
//   confirmed: 'Đã xác nhận',
//   delivering: 'Đang giao',
//   delivered: 'Đã giao',
//   cancelled: 'Đã hủy'
// };

// const AdminOrders: React.FC = () => {
//   const { account } = useAppSelector(state => state.user);
//   const [orders, setOrders] = React.useState<ApiOrder[]>([]);
//   const [loading, setLoading] = React.useState(true);

//   React.useEffect(() => {
//     if (account?.role === 1) {
//       orderApi.getAllOrders()
//         .then(res => {
//           // res là Order[], không cần res.data
//           setOrders(res);
//         })
//         .catch(err => console.error(err))
//         .finally(() => setLoading(false));
//     }
//   }, [account]);

//   if (!account || account.role !== 1) {
//     return <Navigate to="/" replace />;
//   }

//   return (
//     <Container sx={{ py: 4 }}>
//       <Typography variant="h4" gutterBottom>Quản lý đơn hàng</Typography>

//       {loading ? (
//         <Typography>Đang tải...</Typography>
//       ) : (
//         <TableContainer component={Paper}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Mã đơn</TableCell>
//                 <TableCell>Khách hàng</TableCell>
//                 <TableCell>Ngày đặt</TableCell>
//                 <TableCell>Tổng tiền</TableCell>
//                 <TableCell>Trạng thái</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {orders.map(order => (
//                 <TableRow key={order._id}>
//                   <TableCell>{order._id.slice(-6)}</TableCell>
//                   <TableCell>{order.account?.username ?? 'Unknown'}</TableCell>
//                   <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '-'}</TableCell>
//                   <TableCell>{(order.priceAtOrder ?? 0).toLocaleString('vi-VN')}₫</TableCell>
//                   <TableCell>
//                     <Chip
//                       label={statusLabels[order.status] ?? 'Unknown'}
//                       color={statusColors[order.status] ?? 'default'}
//                       size="small"
//                     />
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       )}
//     </Container>
//   );
// };

// export default AdminOrders;
