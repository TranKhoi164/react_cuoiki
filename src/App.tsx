import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateProduct from './pages/CreateProduct';
import ProductDetail from './pages/ProductDetail';
import Warehouse from "./pages/Warehouse";
import CreateImportOrder from './pages/CreateImportOrder';
import ImportOrderList from './pages/ImportOrderList';
import ImportOrderDetail from './pages/ImportOrderDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/warehouse" element={<Warehouse />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create_product" element={<CreateProduct />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          {/* Thêm routes mới */}
          <Route path="/create-import-order" element={<CreateImportOrder />} />
          <Route path="/import-orders" element={<ImportOrderList />} />
          <Route path="/import-orders/:id" element={<ImportOrderDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;