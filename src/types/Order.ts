export interface Order {
  _id: string;
  product: string | import("./Product").Product;
  inventory: string;
  status: "pending" | "beingShipped" | "delivered" | "cancelled";
  payment: "fined_stamp" | "order";
  quantity: number;
  paymentOffline: boolean;
  shippingAddress: string;
  createdAt?: string;
  updatedAt?: string;
}
