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

export const accountApi = {
  register: async (data: RegisterData): Promise<ApiResponse<Account>> => {
    const response = await fetch(`${API_BASE_URL}/accounts/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  login: async (data: LoginData): Promise<ApiResponse<Account>> => {
    const response = await fetch(`${API_BASE_URL}/accounts/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/accounts/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Logout failed');
    }

    return response.json();
  },
};

