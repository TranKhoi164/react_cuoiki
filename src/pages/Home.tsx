import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { productApi, Product } from '../services/api';
import { useAppSelector } from '../app/hooks';

type FilterState = {
  name: string;
  minPrice: string;
  maxPrice: string;
};

const defaultFilters: FilterState = {
  name: '',
  minPrice: '',
  maxPrice: '',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = React.useState<FilterState>(defaultFilters);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { account } = useAppSelector((state) => state.user);
  const fetchProducts = React.useCallback(async (activeFilters: FilterState) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productApi.list({
        name: activeFilters.name || undefined,
        minPrice: activeFilters.minPrice ? Number(activeFilters.minPrice) : undefined,
        maxPrice: activeFilters.maxPrice ? Number(activeFilters.maxPrice) : undefined,
      });
      if (account?.role == 1) {
        setProducts(data);
      } else {
        setProducts(data.filter((product) => product.visible !== false));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải sản phẩm';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProducts(defaultFilters);
  }, [fetchProducts]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchProducts(filters);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    fetchProducts(defaultFilters);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Danh sách sản phẩm
          </Typography>
          <Typography color="text.secondary">
            Tìm kiếm theo tên hoặc khoảng giá, nhấn vào sản phẩm để xem chi tiết.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          component="section"
          aria-label="Bộ lọc sản phẩm"
        >
          <TextField
            label="Tên sản phẩm"
            name="name"
            value={filters.name}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Giá tối thiểu"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleInputChange}
            type="number"
            fullWidth
          />
          <TextField
            label="Giá tối đa"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleInputChange}
            type="number"
            fullWidth
          />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={handleApplyFilters}>
              Áp dụng
            </Button>
            <Button variant="outlined" onClick={handleResetFilters}>
              Làm mới
            </Button>
          </Stack>
        </Stack>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!loading && products.length === 0 && !error && (
          <Typography color="text.secondary">Không có sản phẩm phù hợp.</Typography>
        )}

        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid key={product._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardActionArea onClick={() => navigate(`/products/${product._id}`)}>
                  {product.image && (
                    <CardMedia
                      component="img"
                      height="180"
                      image={product.image}
                      alt={product.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6">{product.name}</Typography>
                    <Typography color="text.secondary" sx={{ mb: 1 }} noWrap>
                      {product.description || 'Chưa có mô tả.'}
                    </Typography>
                    <Typography fontWeight="bold">{formatCurrency(product.price)}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
};

export default Home;
export {};







// // src/pages/Home.tsx
// import React from 'react';
// import {
//   Alert,
//   Box,
//   Button,
//   Container,
//   Grid,
//   Paper,
//   Stack,
//   Typography,
//   Chip,
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import { orderApi, Order } from '../services/api';
// import { useAppSelector } from '../app/hooks';

// const formatCurrency = (value: number) =>
//   new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

// const Home: React.FC = () => {
//   const navigate = useNavigate();
//   const { account } = useAppSelector((state) => state.user);
//   const [orders, setOrders] = React.useState<Order[]>([]);
//   const [loading, setLoading] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);

//   const fetchOrders = React.useCallback(async () => {
//     if (!account?._id) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await orderApi.list(account._id);
//       setOrders(data);
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Không thể tải đơn hàng';
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   }, [account?._id]);

//   React.useEffect(() => {
//     fetchOrders();
//   }, [fetchOrders]);

//   return (
//     <Container sx={{ py: 4 }}>
//       <Stack spacing={3}>
//         <Box>
//           <Typography variant="h4" gutterBottom>
//             Lịch sử mua hàng
//           </Typography>
//           <Typography color="text.secondary">
//             Xem chi tiết các đơn hàng đã đặt.
//           </Typography>
//         </Box>

//         {loading && (
//           <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
//             <Typography>Đang tải...</Typography>
//           </Box>
//         )}

//         {error && (
//           <Alert severity="error" onClose={() => setError(null)}>
//             {error}
//           </Alert>
//         )}

//         {!loading && orders.length === 0 && !error && (
//           <Typography color="text.secondary">Bạn chưa có đơn hàng nào.</Typography>
//         )}

//         <Grid container spacing={3}>
//           {orders.map((order) => (
//             <Grid key={order._id} item xs={12} sm={6} md={4}>
//               <Paper elevation={3} sx={{ p: 2 }}>
//                 <Stack spacing={1}>
//                   <Typography fontWeight="bold">Mã đơn: {order._id}</Typography>
//                   <Typography color="text.secondary">
//                     Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
//                   </Typography>
//                   <Typography>Tổng tiền: {formatCurrency(order.totalAmount)}</Typography>
//                   <Chip
//                     label={order.status.toUpperCase()}
//                     color={
//                       order.status === 'pending'
//                         ? 'warning'
//                         : order.status === 'delivered'
//                         ? 'success'
//                         : order.status === 'cancelled'
//                         ? 'error'
//                         : 'info'
//                     }
//                   />
//                   <Button
//                     variant="outlined"
//                     onClick={() => navigate(`/my-orders/${order._id}`)}
//                   >
//                     Xem chi tiết
//                   </Button>
//                 </Stack>
//               </Paper>
//             </Grid>
//           ))}
//         </Grid>
//       </Stack>
//     </Container>
//   );
// };

// export default Home;
