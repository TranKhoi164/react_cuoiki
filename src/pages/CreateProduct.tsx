import React from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { productApi } from '../services/api';

const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const { account } = useAppSelector((state) => state.user);
  const isAdmin = account?.role === 1;

  const [formValues, setFormValues] = React.useState({
    name: '',
    description: '',
    price: '',
    image: '',
    visible: true,
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleVisibilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({ ...prev, visible: event.target.checked }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const product = await productApi.create(
        {
          name: formValues.name,
          description: formValues.description,
          image: formValues.image,
          price: Number(formValues.price),
          visible: formValues.visible,
        },
        account?.role,
      );
      setSuccess('Tạo sản phẩm thành công');
      setFormValues({
        name: '',
        description: '',
        price: '',
        image: '',
        visible: true,
      });
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tạo sản phẩm thất bại';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tạo sản phẩm mới
      </Typography>

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

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Đang tạo...' : 'Tạo sản phẩm'}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default CreateProduct;