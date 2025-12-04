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
  Button,
  Chip,
} from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { importOrderApi, ImportOrder } from '../services/api';

const ImportOrderList: React.FC = () => {
  const [importOrders, setImportOrders] = useState<ImportOrder[]>([]);

  useEffect(() => {
    loadImportOrders();
  }, []);

  const loadImportOrders = async () => {
    try {
      const data = await importOrderApi.list();
      setImportOrders(data);
    } catch (err) {
      console.error('Load import orders failed:', err);
    }
  };

  const getTotalProducts = (order: ImportOrder) => {
    return order.importDetails.reduce((total, detail) => total + detail.quantity, 0);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Danh sách phiếu nhập
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          to="/create-import-order"
        >
          Tạo phiếu nhập
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><b>Mã phiếu</b></TableCell>
              <TableCell><b>Ngày nhập</b></TableCell>
              <TableCell><b>Số lượng sản phẩm</b></TableCell>
              <TableCell><b>Tổng tiền</b></TableCell>
              <TableCell><b>Ghi chú</b></TableCell>
              <TableCell><b>Thao tác</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {importOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>#{order._id.slice(-6).toUpperCase()}</TableCell>
                <TableCell>
                  {new Date(order.importDate).toLocaleString('vi-VN')}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getTotalProducts(order)} 
                    color="primary" 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    {order.totalAmount.toLocaleString()}đ
                  </Typography>
                </TableCell>
                <TableCell>
                  {order.note || <i>Không có ghi chú</i>}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    startIcon={<Visibility />}
                    component={Link}
                    to={`/import-orders/${order._id}`}
                    size="small"
                  >
                    Chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ImportOrderList;
export {};