import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Order, OrderStatus, Product, Payment } from '../models/order.model';
import { Configuration } from '../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private storage: StorageService) {
    this.initDefaultConfig();
  }

  private initDefaultConfig(): void {
    const config = this.storage.getConfig();
    if (!config) {
      this.storage.saveConfig({
        company: {
          name: 'VM Lirandzu Transportes & Logística',
          nif: '',
          addressMaputo: 'Bairro Djuba, Célula D, Q.1 NR7',
          addressJHB: 'New Times Square, Bruma 2198',
          phoneMZ: '+258 848 310 348',
          phoneSA: '+27 11 615 0697',
          email: 'vm.liranzotransportes@gmail.com'
        },
        fees: {
          defaultTransportFee: 500,
          exchangeRateZAR_MZN: 3.5
        },
        users: []
      });
    }
  }

  generateOrderNumber(): string {
    const orders = this.storage.getOrders();
    const year = new Date().getFullYear();
    const lastOrder = orders
      .filter(e => e.orderNumber.startsWith(`VML-${year}-`))
      .sort((a, b) => {
        const numA = parseInt(a.orderNumber.split('-')[2]);
        const numB = parseInt(b.orderNumber.split('-')[2]);
        return numB - numA;
      })[0];
    
    let nextNumber = 1;
    if (lastOrder) {
      const lastNum = parseInt(lastOrder.orderNumber.split('-')[2]);
      nextNumber = lastNum + 1;
    }
    
    return `VML-${year}-${String(nextNumber).padStart(4, '0')}`;
  }

  calculateTotalValue(products: Product[], transportFee: number, exchangeRate: number): number {
    const productsValueZAR = products.reduce((sum, p) => sum + (p.valueZAR * p.quantity), 0);
    const productsValueMZN = productsValueZAR * exchangeRate;
    return productsValueMZN + transportFee;
  }

  calculateStatus(totalValue: number, paidAmount: number): OrderStatus {
    if (paidAmount >= totalValue) return OrderStatus.PAID;
    if (paidAmount > 0) return OrderStatus.PARTIAL;
    return OrderStatus.UNPAID;
  }

  getAllOrders(): Order[] {
    return this.storage.getOrders();
  }

  getOrderById(id: string): Order | undefined {
    return this.storage.getOrders().find(e => e.id === id);
  }

  createOrder(order: Omit<Order, 'id' | 'orderNumber' | 'paidAmount' | 'debtBalance' | 'status' | 'payments' | 'lastUpdateDate'>): Order {
    const newOrder: Order = {
      ...order,
      id: this.generateId(),
      orderNumber: this.generateOrderNumber(),
      paidAmount: 0,
      debtBalance: order.totalValueMZN,
      status: OrderStatus.UNPAID,
      payments: [],
      lastUpdateDate: new Date()
    };
    
    const orders = this.storage.getOrders();
    orders.push(newOrder);
    this.storage.saveOrders(orders);
    
    return newOrder;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | null {
    const orders = this.storage.getOrders();
    const index = orders.findIndex(e => e.id === id);
    
    if (index === -1) return null;
    
    const order = orders[index];
    const totalValue = updates.totalValueMZN ?? order.totalValueMZN;
    const paidAmount = updates.paidAmount ?? order.paidAmount;
    
    orders[index] = {
      ...order,
      ...updates,
      debtBalance: totalValue - paidAmount,
      status: this.calculateStatus(totalValue, paidAmount),
      lastUpdateDate: new Date()
    };
    
    this.storage.saveOrders(orders);
    return orders[index];
  }

  addPayment(orderId: string, payment: Omit<Payment, 'id' | 'orderId'>): Order | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;
    
    const newPayment: Payment = {
      ...payment,
      id: this.generateId(),
      orderId
    };
    
    order.payments.push(newPayment);
    const newPaidAmount = order.payments.reduce((sum, p) => sum + p.amount, 0);
    
    return this.updateOrder(orderId, {
      paidAmount: newPaidAmount,
      payments: order.payments
    });
  }

  cancelOrder(id: string): Order | null {
    return this.updateOrder(id, { status: OrderStatus.CANCELLED });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

