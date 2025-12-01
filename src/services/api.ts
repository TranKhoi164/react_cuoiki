import { Inventory } from "@mui/icons-material";

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

// Inventory update
export interface InventoryPayload {
  product: string;       // productId
  sku: string;
  attribute?: Record<string, string>;
  stock: number;
  quantity?: number;
  price: number;
  image?: string;
}
// 

// Cập nhật interface Product
export interface Product extends ProductPayload {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  quantity?: number; // Thêm thuộc tính quantity
  sku?: string; // Thêm thuộc tính sku
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

// Inventory update
export interface Inventory extends InventoryPayload {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}
// 

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

// Inventory update
const handleInventoryResponse = async <T>(response: Response): Promise<T> => {
  const payload = await response.json();

  if (!response.ok) {
    // FIX: Xử lý lỗi tốt hơn
    const errorMessage = payload.message || payload.error || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  // FIX: Đảm bảo payload có data
  if (!payload.data) {
    throw new Error('Invalid response format: missing data field');
  }

  return payload.data as T;
};
// 

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

    return response.json();
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

    return response.json();
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

    const url = params.toString()
      ? `${API_BASE_URL}/products?${params.toString()}`
      : `${API_BASE_URL}/products`;

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

// Inventory update
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
  }
};

// 
// Inventory update
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

// Thêm API functions
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
  }
};

// 