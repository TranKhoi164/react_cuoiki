import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { importOrderApi, ImportOrder } from '../services/api';

const ImportOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [importOrder, setImportOrder] = useState<ImportOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadImportOrderDetail(id);
    }
  }, [id]);

  const loadImportOrderDetail = async (orderId: string) => {
    try {
      const data = await importOrderApi.getById(orderId);
      setImportOrder(data);
    } catch (err) {
      console.error('Load import order detail failed:', err);
      alert('Không tìm thấy phiếu nhập');
      navigate('/import-orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ padding: 3 }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (!importOrder) {
    return (
      <Box sx={{ padding: 3 }}>
        <Typography>Không tìm thấy phiếu nhập</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        component={Link}
        to="/import-orders"
        sx={{ mb: 2 }}
      >
        Quay lại danh sách
      </Button>

      <Typography variant="h4" gutterBottom>
        Chi tiết phiếu nhập #{importOrder._id.slice(-6).toUpperCase()}
      </Typography>

      {/* Sử dụng Box thay vì Grid */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Thông tin chung */}
        <Box sx={{ width: { xs: '100%', md: '35%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin chung
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Ngày nhập
                </Typography>
                <Typography variant="body1">
                  {new Date(importOrder.importDate).toLocaleString('vi-VN')}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Tổng tiền
                </Typography>
                <Typography variant="h6" color="primary">
                  {importOrder.totalAmount.toLocaleString()}đ
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Số loại sản phẩm
                </Typography>
                <Typography variant="body1">
                  <Chip 
                    label={importOrder.importDetails.length} 
                    color="primary" 
                    size="small" 
                  />
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="textSecondary">
                  Ghi chú
                </Typography>
                <Typography variant="body1">
                  {importOrder.note || <i>Không có ghi chú</i>}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Chi tiết sản phẩm */}
        <Box sx={{ width: { xs: '100%', md: '65%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Chi tiết sản phẩm nhập
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell><b>Tên sản phẩm</b></TableCell>
                      <TableCell><b>Số lượng</b></TableCell>
                      <TableCell><b>Giá nhập</b></TableCell>
                      <TableCell><b>Thành tiền</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importOrder.importDetails.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {typeof detail.productId === 'object' 
                            ? detail.productId.name 
                            : `Product ${detail.productId}`}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={detail.quantity} 
                            color="secondary" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>{detail.price.toLocaleString()}đ</TableCell>
                        <TableCell>
                          <Typography fontWeight="bold">
                            {(detail.quantity * detail.price).toLocaleString()}đ
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                <Typography variant="h6" align="right">
                  Tổng cộng: {importOrder.totalAmount.toLocaleString()}đ
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default ImportOrderDetail;