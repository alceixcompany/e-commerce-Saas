import { User } from './auth';

export interface AdminUserAddress {
  title?: string;
  fullAddress?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface AdminUser extends User {
  _id: string;
  id: string; // Redux normalization
  createdAt: string;
  totalSpent?: number;
  orderCount?: number;
}

export interface AdminUserDetails extends AdminUser {
  addresses?: AdminUserAddress[];
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalSales: number;
  paidOrders: number;
  unpaidOrders: number;
}

export interface Message {
  _id: string;
  id: string; // Redux normalization
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}
