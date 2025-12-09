import axios from 'axios';

// Giả định URL cơ sở của Backend Express/Nodejs
const API_BASE_URL = 'http://localhost:5000';
const ORDER_API_URL = `${API_BASE_URL}/orders`;

// ----------------------------------------------------
// 1. INTERFACE/TYPE ĐỒNG BỘ VỚI BACKEND
// ----------------------------------------------------

// Định nghĩa trạng thái đơn hàng (Đồng bộ với order.model.ts)
export type OrderStatus = 'inCart' | 'pending' | 'beingShipped' | 'delivered' | 'cancelled';

// Interface cho dữ liệu Đơn hàng trả về
export interface Order {
  _id: string;
  product: { _id: string; name: string; price: number; image?: string };
  account: { _id: string; username: string; email: string };
  status: OrderStatus;
  quantity: number;
  paymentOffline: boolean;
  shippingAddress: string;
  priceAtOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Interface cho dữ liệu gửi lên khi TẠO đơn hàng (Đồng bộ với CreateOrderBody)
export interface CreateOrderPayload {
  product: string; // ID sản phẩm
  quantity: number;
  paymentOffline?: boolean;
  shippingAddress: string;
  accountId: string; // Bắt buộc phải có
  status?: OrderStatus;
}

// ----------------------------------------------------
// 2. CÁC HÀM GỌI API
// ----------------------------------------------------

export const orderApi = {

  /**
   * [GET] Lấy TẤT CẢ đơn hàng.
   * LƯU Ý: Tuyến đường này hiện đang KHÔNG CÓ BẢO MẬT.
   */
  getAllOrders: async (): Promise<Order[]> => {
    try {
      const response = await axios.get<Order[]>(ORDER_API_URL);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy tất cả đơn hàng.');
      }
      throw new Error('Lỗi không xác định khi gọi API.');
    }
  },

  /**
   * [GET] Lấy chi tiết một đơn hàng theo ID.
   * @param id ID của đơn hàng
   */
  getOrderById: async (id: string): Promise<Order> => {
    try {
      const response = await axios.get<Order>(`${ORDER_API_URL}/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || `Lỗi khi lấy đơn hàng ID: ${id}.`);
      }
      throw new Error('Lỗi không xác định khi gọi API.');
    }
  },

  /**
   * [GET] Lấy TẤT CẢ đơn hàng của một người dùng.
   * @param userId ID người dùng
   */
  getOrdersByUserId: async (userId: string): Promise<Order[]> => {
    try {
      const response = await axios.get<Order[]>(`${ORDER_API_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || `Không tìm thấy đơn hàng cho User ID: ${userId}.`);
      }
      throw new Error('Lỗi không xác định khi gọi API.');
    }
  },

  /**
   * [POST] Tạo đơn hàng mới.
   * @param payload Dữ liệu đơn hàng, bao gồm accountId.
   */
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    try {
      console.log('=== API createOrder call ===');
      console.log('Payload sent to backend:', payload); // Thêm log này
      console.log('Payload has status?', 'status' in payload); // Kiểm tra
      console.log('Status value:', payload.status); // Kiểm tra giá trị
      
      const response = await axios.post<{ message: string, order: Order }>(
        ORDER_API_URL,
        payload
      );
      return response.data.order;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lỗi khi tạo đơn hàng.');
      }
      throw new Error('Lỗi không xác định khi gọi API.');
    }
  },

  /**
   * [PATCH] Hủy đơn hàng.
   * @param id ID đơn hàng cần hủy
   * @param accountId ID người dùng hủy (để xác nhận quyền)
   */
  cancelOrder: async (id: string, accountId: string): Promise<Order> => {
    // try {
    //   const response = await axios.patch<{ message: string, order: Order }>(
    //     `${ORDER_API_URL}/${id}/cancel`,
    //     { accountId } // accountId được gửi trong body để xác nhận
    //   );
    //   return response.data.order;
    // } catch (error) {
    //   if (axios.isAxiosError(error)) {
    //     throw new Error(error.response?.data?.message || 'Lỗi khi hủy đơn hàng.');
    //   }
    //   throw new Error('Lỗi không xác định khi gọi API.');
    // 
    try {
      // Tạm thời: dùng updateOrderStatus để chuyển thành 'cancelled'
      // KHÔNG gửi accountId vì updateOrderStatus không cần
      return await orderApi.updateOrderStatus(id, 'cancelled');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Hiển thị chi tiết lỗi
        console.error('Cancel order error:', error.response?.data);
        throw new Error(error.response?.data?.message || 'Lỗi khi xóa đơn hàng.');
      }
      throw new Error('Lỗi không xác định khi gọi API.');
    }
  },

  /**
   * [PATCH] Cập nhật trạng thái đơn hàng (Không kiểm tra Admin).
   * @param id ID đơn hàng
   * @param newStatus Trạng thái mới
   */
  updateOrderStatus: async (id: string, newStatus: OrderStatus): Promise<Order> => {
    try {
      const response = await axios.patch<{ message: string, order: Order }>(
        `${ORDER_API_URL}/${id}/status`,
        { status: newStatus }
      );
      return response.data.order;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái.');
      }
      throw new Error('Lỗi không xác định khi gọi API.');
    }
  },
};