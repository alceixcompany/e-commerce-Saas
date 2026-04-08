import { User } from './auth';

export interface AdminUser extends User {
  _id: string;
  id: string; // Redux normalization
  createdAt: string;
  totalSpent?: number;
  orderCount?: number;
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
