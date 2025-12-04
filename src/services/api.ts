import { Inventory } from "@mui/icons-material";
import { Order } from '../types/Order';

const API_BASE_URL = 'http://localhost:5000';

export interface RegisterData {
  username: string;
  password: string;
  avatar?: string;
  dateOfBirth?: string;
  role?: number;
  address?: object;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface Account {
  _id: string;
  username: string;
  fullName?: string;
  avatar?: string;
  dateOfBirth?: string;
  role: number;
  address?: object;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  message: string;
  account?: T;
  error?: string;
}

export interface ProductPayload {
  name: string;
  description?: string;
  image?: string;
  price: number;
  visible?: boolean;
}

export interface InventoryPayload {
  product: string;
  sku: string;
  attribute?: Record<string, string>;
  stock: number;
  quantity?: number;
  price: number;
  image?: string;
}

export interface Product extends ProductPayload {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  quantity?: number;
  sku?: string;
  attributes?: Array<{ key: string; value: string }>;
  images?: string[];
  category?: {
    _id: string;
    name: string;
  };
}

export interface ProductQuery {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
}

// ĐÃ THÊM CHỮ "export" – ĐÂY LÀ CHỖ BẠN BỊ THIẾU!!!
export interface Inventory extends InventoryPayload {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

const withJsonHeaders = () => ({
  'Content-Type': 'application/json',
});

const withAdminHeaders = (role?: number) => {
  const headers: Record<string, string> = { ...withJsonHeaders() };
  if (role !== undefined) {
    headers['x-user-role'] = String(role);
  }
  return headers;
};

const handleProductResponse = async <T>(response: Response): Promise<T> => {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'Yêu cầu thất bại');
  }
  return payload.data as T;
};

const handleInventoryResponse = async <T>(response: Response): Promise<T> => {
  const payload = await response.json();
  if (!response.ok) {
    const errorMessage = payload.message || payload.error || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }
  if (!payload.data) {
    throw new Error('Invalid response format: missing data field');
  }
  return payload.data as T;
};

export const accountApi = {
  register: async (data: RegisterData): Promise<ApiResponse<Account>> => {
    const response = await fetch(`${API_BASE_URL}/accounts/register`, {
      method: 'POST',
      headers: withJsonHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Đăng ký thất bại');
    }
    const result = await response.json();
    return result as ApiResponse<Account>;
  },

  login: async (data: LoginData): Promise<ApiResponse<Account>> => {
    const response = await fetch(`${API_BASE_URL}/accounts/login`, {
      method: 'POST',
      headers: withJsonHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Đăng nhập thất bại');
    }
    const result = await response.json();
    return result as ApiResponse<Account>;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/accounts/logout`, {
      method: 'POST',
      headers: withJsonHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Đăng xuất thất bại');
    }
    return response.json();
  },
};

export const productApi = {
  list: async (query: ProductQuery = {}): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (query.name) params.append('name', query.name);
    if (query.minPrice !== undefined) params.append('minPrice', String(query.minPrice));
    if (query.maxPrice !== undefined) params.append('maxPrice', String(query.maxPrice));
    const url = params.toString() ? `${API_BASE_URL}/products?${params.toString()}` : `${API_BASE_URL}/products`;
    const response = await fetch(url);
    return handleProductResponse<Product[]>(response);
  },

  getById: async (id: string): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return handleProductResponse<Product>(response);
  },

  create: async (payload: ProductPayload, role?: number): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: withAdminHeaders(role),
      body: JSON.stringify(payload),
    });
    return handleProductResponse<Product>(response);
  },

  update: async (id: string, payload: ProductPayload, role?: number): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: withAdminHeaders(role),
      body: JSON.stringify(payload),
    });
    return handleProductResponse<Product>(response);
  },
};

export const inventoryApi = {
  list: async (): Promise<Inventory[]> => {
    const response = await fetch(`${API_BASE_URL}/inventory`);
    return handleInventoryResponse<Inventory[]>(response);
  },

  getById: async (id: string): Promise<Inventory> => {
    const response = await fetch(`${API_BASE_URL}/inventory/${id}`);
    return handleInventoryResponse<Inventory>(response);
  },

  create: async (payload: InventoryPayload, role?: number): Promise<Inventory> => {
    const response = await fetch(`${API_BASE_URL}/inventory`, {
      method: 'POST',
      headers: withAdminHeaders(role),
      body: JSON.stringify(payload),
    });
    return handleInventoryResponse<Inventory>(response);
  },

  update: async (id: string, payload: InventoryPayload, role?: number): Promise<Inventory> => {
    const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: 'PUT',
      headers: withAdminHeaders(role),
      body: JSON.stringify(payload),
    });
    return handleInventoryResponse<Inventory>(response);
  },

  delete: async (id: string, role?: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: 'DELETE',
      headers: withAdminHeaders(role),
    });
    return response.json();
  },

  updateStock: async (id: string, stock: number, role?: number) => {
    const response = await fetch(`${API_BASE_URL}/inventory/${id}/stock`, {
      method: 'PATCH',
      headers: withAdminHeaders(role),
      body: JSON.stringify({ stock }),
    });
    return handleProductResponse(response);
  },
};

export interface ImportDetailPayload {
  productId: string;
  quantity: number;
  price: number;
}

export interface ImportOrderPayload {
  importDate?: string;
  totalAmount: number;
  note?: string;
  importDetails: ImportDetailPayload[];
}

export interface ImportDetail {
  _id: string;
  importOrderId: string;
  productId: string | Product;
  quantity: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ImportOrder {
  _id: string;
  importDate: string;
  totalAmount: number;
  note: string;
  importDetails: ImportDetail[];
  createdAt?: string;
  updatedAt?: string;
}

export const importOrderApi = {
  list: async (): Promise<ImportOrder[]> => {
    const response = await fetch(`${API_BASE_URL}/import-orders`);
    return handleInventoryResponse<ImportOrder[]>(response);
  },

  getById: async (id: string): Promise<ImportOrder> => {
    const response = await fetch(`${API_BASE_URL}/import-orders/${id}`);
    return handleInventoryResponse<ImportOrder>(response);
  },

  create: async (payload: ImportOrderPayload, role?: number): Promise<ImportOrder> => {
    const response = await fetch(`${API_BASE_URL}/import-orders`, {
      method: 'POST',
      headers: withAdminHeaders(role),
      body: JSON.stringify(payload),
    });
    return handleInventoryResponse<ImportOrder>(response);
  },

  delete: async (id: string, role?: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/import-orders/${id}`, {
      method: 'DELETE',
      headers: withAdminHeaders(role),
    });
    return response.json();
  },
};

export const orderApi = {
  list: async (accountId?: string): Promise<Order[]> => {
    const params = accountId ? `?accountId=${accountId}` : '';
    const response = await fetch(`${API_BASE_URL}/orders${params}`);
    return handleProductResponse<Order[]>(response);
  },

  create: async (order: Partial<Order>, role?: number): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: withAdminHeaders(role),
      body: JSON.stringify(order),
    });
    return handleProductResponse<Order>(response);
  },

  cancel: async (id: string, role?: number): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
      method: 'PATCH',
      headers: withAdminHeaders(role),
      body: JSON.stringify({ status: 'cancelled' }),
    });
    return handleProductResponse<Order>(response);
  },
};










// // src/services/api.ts
// import type { Product, Inventory, Order, OrderItem, ImportDetailPayload } from '../types';

// export interface Account {
//   _id: string;
//   username: string;
//   role: number;
//   createdAt: string;
// }

// export interface ApiResponse<T> {
//   message: string;
//   account?: T;
// }

// // MOCK DỮ LIỆU
// const mockProducts: Product[] = [
//   { _id: 'p1', name: 'Sản phẩm 1', price: 10000, quantity: 50, createdAt: new Date().toISOString() },
//   { _id: 'p2', name: 'Sản phẩm 2', price: 20000, quantity: 30, createdAt: new Date().toISOString() },
// ];

// const mockInventory: Inventory[] = [
//   { _id: 'i1', product: 'p1', sku: 'SKU01', stock: 50, price: 10000 },
//   { _id: 'i2', product: 'p2', sku: 'SKU02', stock: 30, price: 20000 },
// ];

// const mockOrders: Order[] = [
//   {
//     _id: 'o1',
//     account: 'u1',
//     items: [{ product: 'p1', inventory: 'i1', quantity: 2, price: 10000 }],
//     totalAmount: 20000,
//     status: 'delivered',
//     shippingAddress: 'Hà Nội',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
// ];

// // ================= ACCOUNT =================
// export const accountApi = {
//   login: async (data: { username: string; password: string }): Promise<ApiResponse<Account>> => {
//     return { message: 'Login success', account: { _id: 'u1', username: data.username, role: 1, createdAt: new Date().toISOString() } };
//   },
//   register: async (data: { username: string; password: string }): Promise<ApiResponse<Account>> => {
//     return { message: 'Register success', account: { _id: 'u1', username: data.username, role: 1, createdAt: new Date().toISOString() } };
//   },
//   logout: async () => ({ message: 'Logout success' }),
// };

// // ================= PRODUCT =================
// export const productApi = {
//   list: async (): Promise<Product[]> => mockProducts,
//   getById: async (id: string) => mockProducts.find(p => p._id === id) as Product,
//   create: async (p: Product) => p,
//   update: async (id: string, p: Product) => ({ ...p, _id: id }),
// };

// // ================= INVENTORY =================
// export const inventoryApi = {
//   list: async (): Promise<Inventory[]> => mockInventory,
//   getById: async (id: string) => mockInventory.find(i => i._id === id) as Inventory,
//   create: async (i: Inventory) => i,
//   update: async (id: string, i: Inventory) => ({ ...i, _id: id }),
//   delete: async (id: string) => ({ message: 'Deleted' }),
// };

// // ================= ORDER =================
// export const orderApi = {
//   list: async (): Promise<Order[]> => mockOrders,
//   create: async (order: Partial<Order>) => ({ ...order, _id: 'o' + Math.random(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
//   cancel: async (id: string) => ({ ...mockOrders[0], status: 'cancelled' }),
// };

// // ================= IMPORT ORDER =================
// export interface ImportDetail {
//   _id: string;
//   productId: string;
//   quantity: number;
//   price: number;
// }

// export interface ImportOrder {
//   _id: string;
//   importDate: string;
//   totalAmount: number;
//   note: string;
//   importDetails: ImportDetail[];
// }

// const mockImportOrders: ImportOrder[] = [
//   {
//     _id: 'im1',
//     importDate: new Date().toISOString(),
//     totalAmount: 50000,
//     note: 'Nhập hàng thử',
//     importDetails: [{ _id: 'id1', productId: 'p1', quantity: 5, price: 10000 }],
//   },
// ];

// export const importOrderApi = {
//   list: async (): Promise<ImportOrder[]> => mockImportOrders,
//   getById: async (id: string) => mockImportOrders.find(o => o._id === id) as ImportOrder,
//   create: async (o: ImportOrder) => o,
//   delete: async (id: string) => ({ message: 'Deleted' }),
// };
// export type { Product, Inventory, Order, OrderItem, ImportDetailPayload };