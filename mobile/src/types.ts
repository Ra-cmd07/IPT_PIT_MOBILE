export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category?: string;
  is_available?: boolean;
  estimated_prep_time?: number;
}

export interface OrderItem {
  id?: number;
  quantity: number;
  menu_item?: MenuItem;
  menu_item_id?: number;
  menu_item_name?: string;
  subtotal?: number;
}

export interface Order {
  id: number;
  items: OrderItem[];
  status: OrderStatus;
  table_number: number;
  created_at: string;
  completed_at?: string;
  total_price?: number;
  notes?: string;
}

export interface CreateOrderRequest {
  table_number?: number;
  items: Array<{ id: number; quantity: number }>;
  notes?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile?: {
    address?: string;
    age?: number | null;
    birthday?: string | null;
    picture?: string | null;
  };
}
