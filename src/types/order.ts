export type OrderType = 'Dine-in' | 'Takeaway' | 'Delivery';
export type OrderStatus = 'Pending' | 'Cooking' | 'Ready' | 'Completed';
export type PaymentMode = 'Cash' | 'UPI' | 'Card';
export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Unpaid';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  mobile_number: string;
  biryani_type: string;
  quantity: number;
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
  biryani_type: string;
  quantity: number;
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
