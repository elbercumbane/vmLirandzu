import { Order } from './order.model';

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  nifBi?: string;
  address?: string;
  registrationDate: Date;
  orderIds: string[]; // IDs of orders from this customer
  totalSpent: number; // sum of all paid orders
  totalDebt: number; // sum of all active debts
  notes?: string;
}

export interface CustomerWithHistory extends Customer {
  orders: Order[];
}

