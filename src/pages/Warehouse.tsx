import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Box,
  Avatar,
} from "@mui/material";
import { inventoryApi, Inventory } from '../services/api';

const Warehouse: React.FC = () => {
  const [inventory, setInventory] = React.useState<Inventory[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await inventoryApi.list();
        setInventory(data);
      } catch (err) {
        console.error("Load inventory failed:", err);
      }
    }
    load();
  }, []);

  return (
    <Box sx={{ padding: 3 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>Ảnh</b></TableCell>
              <TableCell><b>Tên sản phẩm</b></TableCell>
              <TableCell><b>Số lượng</b></TableCell>
              <TableCell><b>Giá</b></TableCell>
              <TableCell><b>Ngày tạo</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {inventory.map((item: Inventory) => (
              <TableRow key={item._id}>
                {/* Ảnh */}
                <TableCell>
                  <Avatar
                    src={item.image || (item.product as any)?.image}
                    variant="rounded"
                    sx={{ width: 56, height: 56 }}
                  />
                </TableCell>

                {/* Tên sản phẩm */}
                <TableCell>{(item.product as any)?.name || "Không có tên"}</TableCell>

                {/* Quantity */}
                <TableCell>{item.quantity}</TableCell>

                {/* Price */}
                <TableCell>{item.price.toLocaleString()}đ</TableCell>

                {/* CreatedAt */}
                <TableCell>
                  {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "---"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Warehouse;