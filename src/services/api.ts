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

export interface Product extends ProductPayload {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductQuery {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
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

