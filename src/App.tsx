import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateImportOrder from './pages/CreateImportOrder';
import ImportOrderList from './pages/ImportOrderList';
import Warehouse from './pages/WareHouse';           
import MyOrders from './pages/customer/MyOrders';
import AdminOrders from './pages/admin/Orders';
import POS from './pages/POS';

import './App.css';

// Các trang tạm giữ nguyên
const CreateProduct = () => (
  <div style={{ padding: 50, textAlign: 'center', fontSize: 24 }}>
    <h2>Tạo sản phẩm</h2>
    <p>Trang đang phát triển...</p>
  </div>
);

const ProductDetail = () => (
  <div style={{ padding: 50, textAlign: 'center', fontSize: 24 }}>
    <h2>Chi tiết sản phẩm</h2>
    <p>Trang đang phát triển...</p>
  </div>
);

const ImportOrderDetail = () => (
  <div style={{ padding: 50, textAlign: 'center', fontSize: 24 }}>
    <h2>Chi tiết phiếu nhập</h2>
    <p>Trang đang phát triển...</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/warehouse" element={<Warehouse />} />   {/* Đường dẫn vẫn là /warehouse (không phân biệt hoa thường) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create_product" element={<CreateProduct />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Nhập kho */}
          <Route path="/create-import-order" element={<CreateImportOrder />} />
          <Route path="/import-orders" element={<ImportOrderList />} />
          <Route path="/import-orders/:id" element={<ImportOrderDetail />} />

          {/* 3 route mới  */}
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/pos" element={<POS />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;