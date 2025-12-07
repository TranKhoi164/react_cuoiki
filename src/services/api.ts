import axios from "axios";

// You are an software engineer proficient in web development. Make me a order management for both normal user and admin. The flow goes like this, when user click Mua ngay in product detail page, create order with    
//  status 'pending', redirect it to payment page (not real payment, just show the price by multiply price with quantity of product in order), and show information of order created previously, when user hit 'xác        
// nhận' redirect them to 'purchase' page. There is 4 tab in order page 'chờ xác nhận', 'đang giao hàng', 'hoàn thành', 'đã huỷ', each tab show order with aligned status 'pending', 'beingShipped', 
// 'delivered', 'cancelled'. For admin role, each tab show order's infor of all user and show infor of user make that order as well, in tab 'chờ xác nhận' user can click 'huỳ đơn' below order infor to change 
// status of that order to 'cancelled', admin can click 'xác nhận' below order box to change order status to 'beingShipped'. In tab 'đang giao hàng', user can click 'đã nhận' to change order status to 
// 'delivered'. Both admin and user can access order_management page though header link 

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
  // fullName: string | null; // Nếu bạn bật lại trường này trong schema
  // avatar: string | null; // Nếu bạn bật lại trường này trong schema
  dateOfBirth?: string; // Mongoose trả về Date, JSON/TS là string
  role: 0 | 1; // 0: user, 1: admin
  address?: string;
  createdAt: string;
  updatedAt: string;
}
export interface ApiResponse<T> {
  message: string;
  account?: T;
  error?: string;
}
export interface UpdateAccountPayload {
  username?: string;
  dateOfBirth?: string | Date;
  address?: string;
  // BẮT BUỘC KHÔNG BAO GỒM: password, role
}

export interface ProductPayload {
  name: string;
  description?: string;
  image?: string;
  price: number;
  visible?: boolean;
  quantity?: number;
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

const ACCOUNT_API_URL = `${API_BASE_URL}/accounts`;

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

  /**
   * [GET] Lấy thông tin chi tiết tài khoản.
   * Route: GET /api/accounts/:id
   * @param id ID của tài khoản
   */
  getAccountById: async (id: string): Promise<Account> => {
    try {
      const response = await axios.get<Account>(`${ACCOUNT_API_URL}/`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || `Lỗi khi lấy thông tin tài khoản`);
      }
      throw new Error('Lỗi không xác định khi gọi API.');
    }
  },

  getAllAccounts: async (): Promise<Account[]> => {
    try {
      // Gọi API mà không có ID trong URL
      const response = await axios.get<Account[]>(`${ACCOUNT_API_URL}/`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || `Lỗi khi lấy tất cả tài khoản`);
      }
      throw new Error('Lỗi không xác định khi gọi API.');
    }
  },

  /**
   * [PATCH] Cập nhật thông tin tài khoản.
   * Route: PATCH /api/accounts/:id
   * @param id ID của tài khoản cần cập nhật
   * @param payload Dữ liệu cập nhật (dateOfBirth, address, username)
   */
  updateAccount: async (id: string, payload: UpdateAccountPayload): Promise<Account> => {
    try {
      const response = await axios.patch<{ message: string, account: Account }>(
        `${ACCOUNT_API_URL}/${id}`,
        payload
      );
      return response.data.account;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || `Lỗi khi cập nhật tài khoản ID: ${id}.`);
      }
      throw new Error('Lỗi không xác định khi gọi API.');
    }
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

