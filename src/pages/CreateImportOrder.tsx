import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { productApi, importOrderApi, Product, ImportDetailPayload } from '../services/api';

interface ImportProduct extends ImportDetailPayload {
  productName: string;
  currentStock: number;
}

const CreateImportOrder: React.FC = () => {
  const navigate = useNavigate();
  const { account } = useAppSelector((state) => state.user);
  const [products, setProducts] = useState<Product[]>([]);
  const [importProducts, setImportProducts] = useState<ImportProduct[]>([]);
  const [note, setNote] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productApi.list();
      setProducts(data);
    } catch (err) {
      console.error('Load products failed:', err);
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct || quantity <= 0 || price < 0) {
      alert('Vui lòng điền đầy đủ thông tin sản phẩm');
      return;
    }

    const product = products.find(p => p._id === selectedProduct);
    if (!product) return;

    const existingIndex = importProducts.findIndex(item => item.productId === selectedProduct);
    
    if (existingIndex >= 0) {
      // Update existing product
      const updatedProducts = [...importProducts];
      updatedProducts[existingIndex].quantity += quantity;
      updatedProducts[existingIndex].price = price;
      setImportProducts(updatedProducts);
    } else {
      // Add new product
      const newProduct: ImportProduct = {
        productId: selectedProduct,
        productName: product.name,
        quantity,
        price,
        currentStock: product.quantity || 0
      };
      setImportProducts([...importProducts, newProduct]);
    }

    // Reset form
    setSelectedProduct('');
    setQuantity(1);
    setPrice(0);
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = importProducts.filter((_, i) => i !== index);
    setImportProducts(updatedProducts);
  };

  const calculateTotalAmount = () => {
    return importProducts.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const handleSubmit = async () => {
    if (importProducts.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    if (!account) {
      alert('Vui lòng đăng nhập');
      return;
    }

    try {
      const importDetails: ImportDetailPayload[] = importProducts.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }));

      const payload = {
        importDate: new Date().toISOString(),
        totalAmount: calculateTotalAmount(),
        note,
        importDetails
      };

    console.log('Creating import order with payload:', payload);

      await importOrderApi.create(payload, account.role);
      alert('Tạo phiếu nhập thành công!');
      navigate('/import-orders');
    } catch (error) {
      console.error('Create import order failed:', error);
      alert('Tạo phiếu nhập thất bại');
    }
  };

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    const product = products.find(p => p._id === productId);
    if (product) {
      setPrice(product.price);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tạo Phiếu Nhập Hàng
      </Typography>

      {/* Sử dụng Box thay vì Grid để tránh lỗi */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Form thêm sản phẩm */}
        <Box sx={{ width: { xs: '100%', md: '35%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thêm sản phẩm
              </Typography>
              
              <TextField
                select
                fullWidth
                label="Sản phẩm"
                value={selectedProduct}
                onChange={(e) => handleProductChange(e.target.value)}
                margin="normal"
              >
                {products.map((product) => (
                  <MenuItem key={product._id} value={product._id}>
                    {product.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                type="number"
                label="Số lượng"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                margin="normal"
                inputProps={{ min: 1 }}
              />

              <TextField
                fullWidth
                type="number"
                label="Giá nhập"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                margin="normal"
                InputProps={{
                  endAdornment: 'đ'
                }}
              />

              <Button
                fullWidth
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddProduct}
                sx={{ mt: 2 }}
              >
                Thêm vào phiếu nhập
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Ghi chú"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                margin="normal"
              />

              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h6">
                  Tổng tiền: {calculateTotalAmount().toLocaleString()}đ
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{ mt: 2 }}
                disabled={importProducts.length === 0}
              >
                Tạo Phiếu Nhập
              </Button>
            </CardContent>
          </Card>
        </Box>

        {/* Danh sách sản phẩm trong phiếu nhập */}
        <Box sx={{ width: { xs: '100%', md: '65%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Danh sách sản phẩm nhập ({importProducts.length} sản phẩm)
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell><b>Tên sản phẩm</b></TableCell>
                      <TableCell><b>Số lượng</b></TableCell>
                      <TableCell><b>Giá nhập</b></TableCell>
                      <TableCell><b>Thành tiền</b></TableCell>
                      <TableCell><b>Thao tác</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importProducts.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.price.toLocaleString()}đ</TableCell>
                        <TableCell>{(item.quantity * item.price).toLocaleString()}đ</TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveProduct(index)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {importProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography color="textSecondary">
                            Chưa có sản phẩm nào trong phiếu nhập
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {importProducts.length > 0 && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
                  <Typography variant="h6" align="right">
                    Tổng cộng: {calculateTotalAmount().toLocaleString()}đ
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateImportOrder;