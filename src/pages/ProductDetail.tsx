// import React from 'react';
// import {
//   Alert,
//   Box,
//   Button,
//   CircularProgress,
//   Container,
//   FormControlLabel,
//   Grid,
//   Stack,
//   Switch,
//   TextField,
//   Typography,
// } from '@mui/material';
// import { useNavigate, useParams } from 'react-router-dom';
// import { productApi, Product } from '../services/api';
// import { useAppSelector } from '../app/hooks';

// const formatCurrency = (value: number) =>
//   new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

// const ProductDetail: React.FC = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { account } = useAppSelector((state) => state.user);
//   const isAdmin = account?.role === 1;

//   const [product, setProduct] = React.useState<Product | null>(null);
//   const [loading, setLoading] = React.useState(true);
//   const [formValues, setFormValues] = React.useState({
//     name: '',
//     description: '',
//     price: '',
//     image: '',
//     visible: true,
//   });
//   const [saving, setSaving] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);
//   const [success, setSuccess] = React.useState<string | null>(null);

//   React.useEffect(() => {
//     if (!id) return;
//     const loadProduct = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const data = await productApi.getById(id);
//         setProduct(data);
//         setFormValues({
//           name: data.name,
//           description: data.description || '',
//           price: String(data.price),
//           image: data.image || '',
//           visible: data.visible !== false,
//         });
//       } catch (err) {
//         const message = err instanceof Error ? err.message : 'Không thể tải sản phẩm';
//         setError(message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProduct();
//   }, [id]);

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = event.target;
//     setFormValues((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleVisibilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setFormValues((prev) => ({ ...prev, visible: event.target.checked }));
//   };

//   const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     if (!id || !isAdmin) return;

//     setSaving(true);
//     setError(null);
//     setSuccess(null);
//     try {
//       const updated = await productApi.update(
//         id,
//         {
//           name: formValues.name,
//           description: formValues.description,
//           image: formValues.image,
//           price: Number(formValues.price),
//           visible: formValues.visible,
//         },
//         account?.role,
//       );
//       setProduct(updated);
//       setSuccess('Cập nhật sản phẩm thành công');
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Cập nhật sản phẩm thất bại';
//       setError(message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (!product) {
//     return (
//       <Container sx={{ py: 4 }}>
//         <Alert severity="error">Không tìm thấy sản phẩm.</Alert>
//       </Container>
//     );
//   }

//   return (
//     <Container sx={{ py: 4 }}>
//       <Stack spacing={3}>
//         <Button variant="text" onClick={() => navigate(-1)}>
//           Quay lại
//         </Button>

//         <Typography variant="h4">{product.name}</Typography>

//         {error && (
//           <Alert severity="error" onClose={() => setError(null)}>
//             {error}
//           </Alert>
//         )}
//         {success && (
//           <Alert severity="success" onClose={() => setSuccess(null)}>
//             {success}
//           </Alert>
//         )}

//         <Grid container spacing={4}>
//           <Grid size={{ xs: 12, md: 6 }}>
//             {product.image ? (
//               <Box
//                 component="img"
//                 src={product.image}
//                 alt={product.name}
//                 sx={{ width: '100%', borderRadius: 2 }}
//               />
//             ) : (
//               <Box
//                 sx={{
//                   width: '100%',
//                   height: 320,
//                   bgcolor: 'grey.100',
//                   borderRadius: 2,
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                 }}
//               >
//                 <Typography color="text.secondary">Chưa có hình ảnh</Typography>
//               </Box>
//             )}
//           </Grid>

//           <Grid size={{ xs: 12, md: 6 }}>
//             {isAdmin ? (
//               <Box component="form" onSubmit={handleUpdate}>
//                 <Stack spacing={2}>
//                   <TextField
//                     label="Tên sản phẩm"
//                     name="name"
//                     value={formValues.name}
//                     onChange={handleChange}
//                     required
//                   />
//                   <TextField
//                     label="Mô tả"
//                     name="description"
//                     value={formValues.description}
//                     onChange={handleChange}
//                     multiline
//                     rows={4}
//                   />
//                   <TextField
//                     label="Giá (VND)"
//                     name="price"
//                     type="number"
//                     value={formValues.price}
//                     onChange={handleChange}
//                     required
//                     inputProps={{ min: 0 }}
//                   />
//                   <TextField
//                     label="URL hình ảnh"
//                     name="image"
//                     value={formValues.image}
//                     onChange={handleChange}
//                   />
//                   <FormControlLabel
//                     control={<Switch checked={formValues.visible} onChange={handleVisibilityChange} />}
//                     label="Hiển thị sản phẩm"
//                   />
//                   <Button type="submit" variant="contained" disabled={saving}>
//                     {saving ? 'Đang lưu...' : 'Cập nhật sản phẩm'}
//                   </Button>
//                 </Stack>
//               </Box>
//             ) : (
//               <Stack spacing={2}>
//                 <Typography variant="h6">Mô tả</Typography>
//                 <Typography>{product.description || 'Chưa có mô tả.'}</Typography>

//                 <Typography variant="h6">Giá</Typography>
//                 <Typography fontWeight="bold">{formatCurrency(product.price)}</Typography>

//                 <Typography variant="h6">Trạng thái hiển thị</Typography>
//                 <Typography>{product.visible ? 'Đang hiển thị' : 'Đã ẩn'}</Typography>

//                 <Typography variant="h6">Cập nhật lần cuối</Typography>
//                 <Typography color="text.secondary">
//                   {product.updatedAt
//                     ? new Date(product.updatedAt).toLocaleString('vi-VN')
//                     : 'Không xác định'}
//                 </Typography>
//               </Stack>
//             )}
//           </Grid>
//         </Grid>
//       </Stack>
//     </Container>
//   );
// };

// export default ProductDetail;

import React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Divider,
  useTheme,
  Chip,
  IconButton,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { productApi, Product } from '../services/api';
import { useAppSelector } from '../app/hooks';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

// ----------------------------------------------------------------------------------
// THÊM IMPORTS CHO ORDER API
import { orderApi, OrderStatus, CreateOrderPayload } from '../services/orderApi';
// ----------------------------------------------------------------------------------

// Hàm định dạng tiền tệ
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const { account } = useAppSelector((state) => state.user);


  // Giả định account có _id để làm accountId. Nếu không có, dùng ID giả.
  const accountId = account?._id || 'mocked_user_id_for_canvas';

  const isAdmin = account?.role === 1;

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedQuantity, setSelectedQuantity] = React.useState(1);

  // ----------------------------------------------------------------------------------
  // STATE MỚI CHO ORDER
  const [isOrdering, setIsOrdering] = React.useState(false);
  const [orderSuccess, setOrderSuccess] = React.useState<string | null>(null);
  const [orderError, setOrderError] = React.useState<string | null>(null);
  // ----------------------------------------------------------------------------------

  const [formValues, setFormValues] = React.useState({
    name: '',
    description: '',
    price: '',
    image: '',
    visible: true,
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productApi.getById(id);
        setProduct(data);
        setFormValues({
          name: data.name,
          description: data.description || '',
          price: String(data.price),
          image: data.image || '',
          visible: data.visible !== false,
        });
        setSelectedQuantity(1);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể tải sản phẩm';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleVisibilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({ ...prev, visible: event.target.checked }));
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !isAdmin) return;

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await productApi.update(
        id,
        {
          name: formValues.name,
          description: formValues.description,
          image: formValues.image,
          price: Number(formValues.price),
          visible: formValues.visible,
        },
        account?.role,
      );
      setProduct(updated);
      setSuccess('Cập nhật sản phẩm thành công');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cập nhật sản phẩm thất bại';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const availableQuantity = product?.quantity ?? 100;

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!product) return;
    let value = parseInt(event.target.value);

    if (isNaN(value) || value < 1) {
      value = 1;
    }
    else if (value > availableQuantity) {
      value = availableQuantity;
    }

    setSelectedQuantity(value);
  };

  const incrementQuantity = () => {
    if (selectedQuantity < availableQuantity) {
      setSelectedQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (selectedQuantity > 1) {
      setSelectedQuantity(prev => prev - 1);
    }
  };

  const handleCreateOrder = async (targetStatus: OrderStatus) => {
    console.log('=== START handleCreateOrder ===');
    console.log('targetStatus:', targetStatus); // Phải là 'inCart'
    console.log('Payload sẽ gửi:', {
      product: product?._id,
      quantity: selectedQuantity,
      paymentOffline: true,
      shippingAddress: account?.address,
      accountId: accountId,
      status: targetStatus
    });

    if (!product || availableQuantity === 0 || !accountId) {
      setOrderError('Không thể tạo đơn hàng: Thiếu sản phẩm hoặc ID người dùng.');
      return;
    }
    
    if (!account?.address) {
      setOrderError('Vui lòng cập nhật địa chỉ giao hàng trong trang hồ sơ trước khi đặt hàng.');
      return;
    }

    // Nếu là mua ngay và số lượng đặt lớn hơn tồn kho
    if (targetStatus === 'pending' && selectedQuantity > availableQuantity) {
      setOrderError(`Chỉ còn ${availableQuantity} sản phẩm trong kho.`);
      return;
    }

    setIsOrdering(true);
    setOrderSuccess(null);
    setOrderError(null);

    const payload: CreateOrderPayload = {
      product: product._id,
      quantity: selectedQuantity,
      paymentOffline: true,
      shippingAddress: account.address,
      accountId: accountId,
      status: targetStatus // Đảm bảo có trường này
    };

    try {
      // Tạo đơn hàng với status = targetStatus
      const createdOrder = await orderApi.createOrder(payload);

      const actionText = targetStatus === 'inCart' ? 'thêm vào giỏ hàng' : 'đặt hàng';
      setOrderSuccess(`Đã ${actionText} thành công!`);

      // Tự động redirect sau 1.5 giây
      setTimeout(() => {
        if (targetStatus === 'inCart') {
          navigate('/cart');
        } else if (targetStatus === 'pending') {
          navigate(`/payment?orderIds=${createdOrder._id}`);
        }
      }, 1500);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định khi tạo đơn hàng.';
      setOrderError(message);
    } finally {
      setIsOrdering(false);
    }
  };
  // ----------------------------------------------------------------------------------


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Không tìm thấy sản phẩm.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Quay lại
        </Button>

        {/* Thông báo chung cho Admin/Update */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Thông báo cho chức năng Order */}
        {orderError && (
          <Alert severity="error" onClose={() => setOrderError(null)} sx={{ mb: 2 }}>
            {orderError}
          </Alert>
        )}
        {orderSuccess && (
          <Alert severity="success" onClose={() => setOrderSuccess(null)} sx={{ mb: 2 }}>
            {orderSuccess}
          </Alert>
        )}

        <Grid container spacing={4} component={Card} elevation={5} sx={{ p: 0 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            {product.image ? (
              <CardMedia
                component="img"
                image={product.image}
                alt={product.name}
                sx={{
                  width: '100%',
                  height: 450,
                  objectFit: 'contain',
                  borderRadius: 2,
                  p: 2,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 450,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color="text.secondary" variant="h6">Chưa có hình ảnh</Typography>
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
            <CardContent sx={{ width: '100%', p: 3 }}>
              {isAdmin ? (
                /* Giao diện Admin: Form chỉnh sửa */
                <Box component="form" onSubmit={handleUpdate}>
                  <Typography variant="h5" component="h2" mb={3} display="flex" alignItems="center">
                    <EditIcon sx={{ mr: 1 }} /> Chỉnh sửa Sản phẩm
                  </Typography>
                  <Stack spacing={3}>
                    <TextField fullWidth label="Tên sản phẩm" name="name" value={formValues.name} onChange={handleChange} required variant="outlined" />
                    <TextField fullWidth label="Mô tả" name="description" value={formValues.description} onChange={handleChange} multiline rows={4} variant="outlined" />
                    <TextField fullWidth label="Giá (VND)" name="price" type="number" value={formValues.price} onChange={handleChange} required variant="outlined" inputProps={{ min: 0 }} />
                    <TextField fullWidth label="URL hình ảnh" name="image" value={formValues.image} onChange={handleChange} variant="outlined" />
                    <FormControlLabel
                      control={<Switch checked={formValues.visible} onChange={handleVisibilityChange} color="primary" />}
                      label={formValues.visible ? "Đang hiển thị trên trang bán hàng" : "Đã ẩn khỏi trang bán hàng"}
                      sx={{ mt: 2 }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      sx={{ py: 1.5, mt: 3 }}
                    >
                      {saving ? 'Đang lưu...' : 'Cập nhật sản phẩm'}
                    </Button>
                  </Stack>
                </Box>
              ) : (
                /* Giao diện Người dùng */
                <Stack spacing={2}>
                  <Typography variant="h5" component="h1" sx={{ fontWeight: 500 }}>
                    {product.name}
                  </Typography>

                  <Divider />

                  <Box sx={{ bgcolor: theme.palette.primary.light + '10', p: 2, borderRadius: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={3}>
                      <Typography variant="h3" component="p" color="primary.main" fontWeight="bold">
                        {formatCurrency(product.price)}
                      </Typography>
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* PHẦN SỐ LƯỢNG */}
                  <Stack direction="row" alignItems="center" spacing={4}>
                    <Typography variant="body1" color="text.secondary">
                      Số Lượng
                    </Typography>

                    <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                      <IconButton
                        size="small"
                        onClick={decrementQuantity}
                        disabled={selectedQuantity <= 1 || isOrdering}
                        sx={{ borderRadius: 0, borderRight: '1px solid', borderColor: 'grey.300' }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>

                      <TextField
                        value={selectedQuantity}
                        onChange={handleQuantityChange}
                        variant="standard"
                        type="number"
                        disabled={isOrdering}
                        inputProps={{
                          min: 1,
                          max: availableQuantity,
                          style: {
                            textAlign: 'center',
                            padding: '5px 8px',
                            height: '20px'
                          }
                        }}
                        sx={{
                          width: '60px',
                          '& .MuiInput-underline:before': { borderBottom: 'none' },
                          '& .MuiInput-underline:after': { borderBottom: 'none' },
                          '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                        }}
                      />

                      <IconButton
                        size="small"
                        onClick={incrementQuantity}
                        disabled={selectedQuantity >= availableQuantity || isOrdering}
                        sx={{ borderRadius: 0, borderLeft: '1px solid', borderColor: 'grey.300' }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      {availableQuantity} CÒN HÀNG
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {/* Khu vực Mô tả */}
                  <Typography variant="h6" gutterBottom>Mô tả sản phẩm</Typography>
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ maxHeight: 150, overflowY: 'auto' }}>
                    {product.description || 'Sản phẩm này chưa có mô tả chi tiết. Vui lòng liên hệ để biết thêm thông tin.'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Nút Mua Hàng/Thêm vào Giỏ hàng */}
                  <Grid container spacing={2} sx={{ mt: 3 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Button
                        variant="contained"
                        color="error"
                        size="large"
                        startIcon={isOrdering ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
                        sx={{ width: '100%', py: 1.5, fontWeight: 'bold' }}
                        disabled={availableQuantity === 0 || isOrdering}
                        onClick={() => handleCreateOrder('inCart')} // THÊM VÀO GIỎ HÀNG -> IN CART
                      >
                        Thêm vào Giỏ hàng
                      </Button>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="large"
                        sx={{ width: '100%', py: 1.5 }}
                        disabled={availableQuantity === 0 || isOrdering}
                        onClick={() => handleCreateOrder('pending')} // MUA NGAY -> PENDING
                      >
                        {isOrdering ? 'Đang Đặt...' : `Mua ngay (${selectedQuantity} sản phẩm)`}
                      </Button>
                    </Grid>
                  </Grid>
                </Stack>
              )}
            </CardContent>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default ProductDetail;