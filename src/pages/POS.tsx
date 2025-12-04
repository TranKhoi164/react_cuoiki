import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Grid, Alert
} from '@mui/material';
import { Add, Delete, PointOfSale, Search } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setAccount } from '../features/user/userSlice';
import { accountApi, inventoryApi, orderApi } from '../services/api';
import type { Inventory } from '../services/api';
import { Order } from '../types/Order';
import { Navigate } from 'react-router-dom';

interface CartItem {
  inventory: Inventory;
  quantity: number;
}

const POS: React.FC = () => {
  const { account } = useAppSelector(state => state.user);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inventoryApi.list().then(data => setInventory(data.filter(i => i.stock > 0)));
    inputRef.current?.focus();
  }, []);

  const filtered = inventory.filter(i =>
    (i.product as any)?.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item: Inventory) => {
    setCart(prev => {
      const exist = prev.find(c => c.inventory._id === item._id);
      if (exist) return prev.map(c => c.inventory._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { inventory: item, quantity: 1 }];
    });
    setSearch('');
    inputRef.current?.focus();
  };

  const total = cart.reduce((sum, i) => sum + i.inventory.price * i.quantity, 0);

  const checkout = async () => {
    const orderData = {
      items: cart.map(c => ({
        product: (c.inventory.product as any)._id,
        inventory: c.inventory._id,
        quantity: c.quantity,
        price: c.inventory.price
      })),
      totalAmount: total,
      status: 'delivered' as const,
      shippingAddress: 'Bán tại quầy'
    };

    try {
      await orderApi.create(orderData, account?.role);
      setMessage('Thanh toán thành công!');
      setCart([]);
      setTimeout(() => setMessage(null), 3000);
      inventoryApi.list().then(data => setInventory(data.filter(i => i.stock > 0)));
    } catch (err) {
      setMessage('Thanh toán thất bại');
    }
  };

  if (!account || account.role !== 1) return <Navigate to="/" />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PointOfSale /> BÁN HÀNG TẠI QUẦY
      </Typography>

      {message && <Alert severity={message.includes('thành công') ? 'success' : 'error'} sx={{ mt: 2 }}>{message}</Alert>}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <TextField
            fullWidth placeholder="Tìm sản phẩm..."
            value={search} onChange={e => setSearch(e.target.value)}
            inputRef={inputRef}
            InputProps={{ startAdornment: <Search /> }}
          />
          <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead><TableRow><TableCell>Tên</TableCell><TableCell>Giá</TableCell><TableCell>Tồn</TableCell></TableRow></TableHead>
              <TableBody>
                {filtered.map(item => (
                  <TableRow key={item._id} hover onDoubleClick={() => addToCart(item)}>
                    <TableCell>{(item.product as any).name}</TableCell>
                    <TableCell>{item.price.toLocaleString()}₫</TableCell>
                    <TableCell>{item.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Giỏ hàng ({cart.length})</Typography>
            {cart.map(item => (
              <Box key={item.inventory._id} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography>{(item.inventory.product as any).name} x{item.quantity}</Typography>
                <Typography>{(item.inventory.price * item.quantity).toLocaleString()}₫</Typography>
              </Box>
            ))}
            <Box sx={{ borderTop: '2px solid', mt: 2, pt: 1 }}>
              <Typography variant="h5" align="right">Tổng: {total.toLocaleString()}₫</Typography>
              <Button fullWidth variant="contained" color="success" size="large" sx={{ mt: 2 }} onClick={checkout} disabled={cart.length === 0}>
                THANH TOÁN
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default POS;