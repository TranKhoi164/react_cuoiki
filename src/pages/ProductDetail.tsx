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
  IconButton, // Thêm IconButton cho nút cộng/trừ
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
// Cần giả định interface Product có thêm quantity: number
// Nếu interface Product gốc không có, bạn cần thêm nó vào:
// export interface Product { ... quantity: number; ... }
import { productApi, Product } from '../services/api';
import { useAppSelector } from '../app/hooks';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RemoveIcon from '@mui/icons-material/Remove'; // Icon trừ
import AddIcon from '@mui/icons-material/Add'; // Icon cộng

// Hàm định dạng tiền tệ
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { account } = useAppSelector((state) => state.user);
  const isAdmin = account?.role === 1;

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);

  // --- STATE MỚI: Số lượng người dùng chọn ---
  const [selectedQuantity, setSelectedQuantity] = React.useState(1);
  // ---------------------------------------------

  const [formValues, setFormValues] = React.useState({
    name: '',
    description: '',
    price: '',
    image: '',
    visible: true,
    quantity: 0,
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
          quantity: data.quantity || 0,
        });
        // Thiết lập số lượng chọn ban đầu là 1
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
          quantity: product?.quantity
          // Giả định Admin có thể cập nhật quantity qua form (nếu cần)
          // quantity: Number(formValues.quantity), 
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

  // --- LOGIC CHO SỐ LƯỢNG ---
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!product) return;
    let value = parseInt(event.target.value);

    if (!product.quantity) return

    // Giới hạn tối thiểu là 1
    if (isNaN(value) || value < 1) {
      value = 1;
    }
    // Giới hạn tối đa là số lượng tồn kho
    else if (value > product.quantity) {
      value = product.quantity;
    }

    setSelectedQuantity(value);
  };

  const incrementQuantity = () => {
    if (!product) return
    if (!product.quantity) return
    if (product && selectedQuantity < product.quantity) {
      setSelectedQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (selectedQuantity > 1) {
      setSelectedQuantity(prev => prev - 1);
    }
  };
  // -------------------------

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Giả định product.quantity luôn là số (ví dụ 100) nếu không có trong data
  // Dùng toán tử nullish coalescing hoặc kiểm tra if:
  const availableQuantity = product?.quantity ?? 100;

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

        <Grid container spacing={4} component={Card} elevation={5} sx={{ p: 0 }}>
          {/* Cột 1: Hình ảnh (Giữ nguyên) */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* ... (Code hình ảnh giữ nguyên) ... */}
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

          {/* Cột 2: Thông tin/Form chỉnh sửa */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
            <CardContent sx={{ width: '100%', p: 3 }}>
              {isAdmin ? (
                /* Giao diện Admin (Giữ nguyên) */
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
                /* Giao diện Người dùng (Đã cập nhật số lượng) */
                <Stack spacing={2}>

                  {/* Tiêu đề sản phẩm */}
                  <Typography variant="h5" component="h1" sx={{ fontWeight: 500 }}>
                    {product.name}
                  </Typography>

                  <Divider />

                  {/* Khu vực Giá */}
                  <Box sx={{ bgcolor: theme.palette.primary.light + '10', p: 2, borderRadius: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={3}>
                      <Typography variant="h3" component="p" color="primary.main" fontWeight="bold">
                        {formatCurrency(product.price)}
                      </Typography>
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* =========== PHẦN SỐ LƯỢNG MỚI =========== */}
                  <Stack direction="row" alignItems="center" spacing={4}>
                    <Typography variant="body1" color="text.secondary">
                      Số Lượng
                    </Typography>

                    <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                      {/* Nút Trừ */}
                      <IconButton
                        size="small"
                        onClick={decrementQuantity}
                        disabled={selectedQuantity <= 1}
                        sx={{ borderRadius: 0, borderRight: '1px solid', borderColor: 'grey.300' }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>

                      {/* Input Số lượng */}
                      <TextField
                        value={selectedQuantity}
                        onChange={handleQuantityChange}
                        variant="standard"
                        type="number"
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

                      {/* Nút Cộng */}
                      <IconButton
                        size="small"
                        onClick={incrementQuantity}
                        disabled={selectedQuantity >= availableQuantity}
                        sx={{ borderRadius: 0, borderLeft: '1px solid', borderColor: 'grey.300' }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      {availableQuantity} CÒN HÀNG
                    </Typography>
                  </Stack>
                  {/* ========================================= */}

                  <Divider sx={{ my: 2 }} />

                  {/* Khu vực Mô tả (Giữ nguyên) */}
                  <Typography variant="h6" gutterBottom>Mô tả sản phẩm</Typography>
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ maxHeight: 150, overflowY: 'auto' }}>
                    {product.description || 'Sản phẩm này chưa có mô tả chi tiết. Vui lòng liên hệ để biết thêm thông tin.'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Nút Mua Hàng/Thêm vào Giỏ hàng (Giữ nguyên) */}
                  <Grid container spacing={2} sx={{ mt: 3 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Button
                        variant="contained"
                        color="error"
                        size="large"
                        startIcon={<ShoppingCartIcon />}
                        sx={{ width: '100%', py: 1.5, fontWeight: 'bold' }}
                        disabled={availableQuantity === 0} // Vô hiệu hóa nếu hết hàng
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
                        disabled={availableQuantity === 0} // Vô hiệu hóa nếu hết hàng
                      >
                        Mua ngay ({selectedQuantity} sản phẩm)
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