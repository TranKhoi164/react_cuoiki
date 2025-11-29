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
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { productApi, Product } from '../services/api';
import { useAppSelector } from '../app/hooks';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account } = useAppSelector((state) => state.user);
  const isAdmin = account?.role === 1;

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
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
    <Container sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Button variant="text" onClick={() => navigate(-1)}>
          Quay lại
        </Button>

        <Typography variant="h4">{product.name}</Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            {product.image ? (
              <Box
                component="img"
                src={product.image}
                alt={product.name}
                sx={{ width: '100%', borderRadius: 2 }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 320,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color="text.secondary">Chưa có hình ảnh</Typography>
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {isAdmin ? (
              <Box component="form" onSubmit={handleUpdate}>
                <Stack spacing={2}>
                  <TextField
                    label="Tên sản phẩm"
                    name="name"
                    value={formValues.name}
                    onChange={handleChange}
                    required
                  />
                  <TextField
                    label="Mô tả"
                    name="description"
                    value={formValues.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                  />
                  <TextField
                    label="Giá (VND)"
                    name="price"
                    type="number"
                    value={formValues.price}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 0 }}
                  />
                  <TextField
                    label="URL hình ảnh"
                    name="image"
                    value={formValues.image}
                    onChange={handleChange}
                  />
                  <FormControlLabel
                    control={<Switch checked={formValues.visible} onChange={handleVisibilityChange} />}
                    label="Hiển thị sản phẩm"
                  />
                  <Button type="submit" variant="contained" disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Cập nhật sản phẩm'}
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Stack spacing={2}>
                <Typography variant="h6">Mô tả</Typography>
                <Typography>{product.description || 'Chưa có mô tả.'}</Typography>

                <Typography variant="h6">Giá</Typography>
                <Typography fontWeight="bold">{formatCurrency(product.price)}</Typography>

                <Typography variant="h6">Trạng thái hiển thị</Typography>
                <Typography>{product.visible ? 'Đang hiển thị' : 'Đã ẩn'}</Typography>

                <Typography variant="h6">Cập nhật lần cuối</Typography>
                <Typography color="text.secondary">
                  {product.updatedAt
                    ? new Date(product.updatedAt).toLocaleString('vi-VN')
                    : 'Không xác định'}
                </Typography>
              </Stack>
            )}
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default ProductDetail;

