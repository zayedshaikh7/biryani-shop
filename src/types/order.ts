export type OrderType = 'Dine-in' | 'Takeaway' | 'Delivery';
export type OrderStatus = 'Pending' | 'Ready' | 'Completed';
export type PaymentMode = 'Cash' | 'UPI' | 'Card';
export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Unpaid';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  mobile_number: string;
  shop_id: string;
  biryani_type: string;
  quantity: number;
  unit_price: number;
  price: number;
  
  order_status: OrderStatus;
  payment_mode: PaymentMode | null;
  advance_payment: number;
  remaining_amount: number;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface NewOrderInput {
  customer_name: string;
  mobile_number: string;
  shop_id: string;
  biryani_type: string;
  quantity: number;
  unit_price: number;
  price: number;
  order_type: OrderType;
  order_status: OrderStatus;
  payment_mode: PaymentMode | null;
  advance_payment: number;
  remaining_amount: number;
  payment_status: PaymentStatus;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingPayments: number;
  mostSoldBiryani: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  shop_id: string;
  product_name: string;
  quantity: number; // allow decimal quantities
  unit_price: number;
  line_total: number;
  created_at: string;
  updated_at: string;
}
