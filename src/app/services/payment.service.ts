import { Injectable } from '@angular/core';
import { Order, Payment, PaymentMethod, OrderStatus } from '../models/order.model';
import { OrderService } from './order.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private orderService: OrderService, private storage: StorageService) {}

  registerPayment(orderId: string, amount: number, method: PaymentMethod, receivedBy: string, notes?: string): Order | null {
    const order = this.orderService.getOrderById(orderId);
    if (!order) return null;

    const payment: Payment = {
      id: this.generateId(),
      orderId,
      date: new Date(),
      amount,
      paymentMethod: method,
      receivedBy,
      notes
    };

    const newPaidAmount = (order.paidAmount || 0) + amount;
    const payments = [...(order.payments || []), payment];

    const updated = this.orderService.updateOrder(order.id, {
      paidAmount: newPaidAmount,
      payments
    });

    return updated;
  }

  private generateId(): string {
    return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
  }
}

