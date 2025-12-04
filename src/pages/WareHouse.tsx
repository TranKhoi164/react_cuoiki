import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Typography,
  Box,
  Chip,
  Avatar,
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { productApi, Product } from '../services/api';
import { useAppSelector } from '../app/hooks';

const Warehouse: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await productApi.list();
        setProducts(data);
      } catch (err) {
        console.error("Load products failed:", err);
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
              <TableCell><b>SKU</b></TableCell>
              <TableCell><b>Tên sản phẩm</b></TableCell>
              <TableCell><b>Danh mục</b></TableCell>
              <TableCell><b>Số lượng</b></TableCell>
              <TableCell><b>Giá</b></TableCell>
              <TableCell><b>Thuộc tính</b></TableCell>
              <TableCell><b>Ngày tạo</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {products.map((p: any) => (
              <TableRow key={p._id}>
                {/* Ảnh */}
                <TableCell>
                  <Avatar
                    src={p.image}
                    variant="rounded"
                    sx={{ width: 56, height: 56 }}
                  />
                </TableCell>

                {/* SKU */}
                <TableCell>{p.sku || "---"}</TableCell>

                {/* Name */}
                <TableCell>{p.name}</TableCell>

                {/* Category Name */}
                <TableCell>{p.category?.name || "Không có"}</TableCell>

                {/* Quantity */}
                <TableCell>{p.quantity}</TableCell>

                {/* Price */}
                <TableCell>{p.price.toLocaleString()}đ</TableCell>

                {/* Attributes */}
                <TableCell>
                  {p.attributes?.length > 0 ? (
                    p.attributes.map((a: any, idx: number) => (
                      <Chip
                        key={idx}
                        label={`${a.key}: ${a.value}`}
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))
                  ) : (
                    <i>Không có</i>
                  )}
                </TableCell>

                {/* CreatedAt */}
                <TableCell>
                  {new Date(p.createdAt).toLocaleString("vi-VN")}
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






// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
//   TableContainer,
//   Paper,
//   Box,
//   Chip,
//   Avatar,
// } from "@mui/material";
// import { inventoryApi, Inventory } from '../services/api';

// const Warehouse: React.FC = () => {
//   const [inventory, setInventory] = React.useState<Inventory[]>([]);

//   useEffect(() => {
//     async function load() {
//       try {
//         const data = await inventoryApi.list();
//         setInventory(data);
//       } catch (err) {
//         console.error("Load inventory failed:", err);
//       }
//     }
//     load();
//   }, []);

//   return (
//     <Box sx={{ padding: 3 }}>
//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
//             <TableRow>
//               <TableCell><b>Ảnh</b></TableCell>
//               <TableCell><b>SKU</b></TableCell>
//               <TableCell><b>Tên sản phẩm</b></TableCell>
//               <TableCell><b>Số lượng</b></TableCell>
//               <TableCell><b>Giá</b></TableCell>
//               <TableCell><b>Thuộc tính</b></TableCell>
//               <TableCell><b>Ngày tạo</b></TableCell>
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {inventory.map((item: Inventory) => (
//               <TableRow key={item._id}>
//                 {/* Ảnh - Ưu tiên ảnh từ inventory, nếu không có thì dùng ảnh từ product */}
//                 <TableCell>
//                   <Avatar
//                     src={item.image || (item.product as any)?.images?.[0] || (item.product as any)?.image}
//                     variant="rounded"
//                     sx={{ width: 56, height: 56 }}
//                   />
//                 </TableCell>

//                 {/* SKU */}
//                 <TableCell>{item.sku || "---"}</TableCell>

//                 {/* Tên sản phẩm - Lấy từ product object */}
//                 <TableCell>{(item.product as any)?.name || "Không có tên"}</TableCell>

//                 {/* Stock */}
//                 <TableCell>{item.stock}</TableCell>

//                 {/* Price */}
//                 <TableCell>{item.price.toLocaleString()}đ</TableCell>

//                 {/* Attributes */}
//                 <TableCell>
//                   {item.attribute && Object.keys(item.attribute).length > 0 ? (
//                     Object.entries(item.attribute).map(([key, value], idx) => (
//                       <Chip
//                         key={idx}
//                         label={`${key}: ${value}`}
//                         sx={{ mr: 0.5, mb: 0.5 }}
//                         size="small"
//                       />
//                     ))
//                   ) : (
//                     <i>Không có</i>
//                   )}
//                 </TableCell>

//                 {/* CreatedAt */}
//                 <TableCell>
//                   {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "---"}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// };

// export default Warehouse;