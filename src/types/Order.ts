// src/types/Order.ts
export type OrderStatus = 'pending' | 'confirmed' | 'delivering' | 'delivered' | 'cancelled';

export interface OrderItem {
  product: string;
  inventory: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  account: string;                    // ID người mua
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}