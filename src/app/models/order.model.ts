export enum OrderStatus {
  PAID = 'PAGO',
  PARTIAL = 'PARCIAL',
  UNPAID = 'NÃO PAGO',
  CANCELLED = 'CANCELADO'
}

export enum PaymentMethod {
  CASH = 'Dinheiro',
  MPESA = 'M-Pesa',
  EMOLA = 'e-Mola',
  TRANSFER = 'Transferência'
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  store: string;
  link?: string;
  quantity: number;
  valueZAR: number;
  invoiceReceipt?: string; // URL or base64 image/PDF
}

export interface Payment {
  id: string;
  orderId: string;
  date: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  receivedBy: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // VML-2025-0001
  registrationDate: Date;
  
  // Customer Data
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  nifBi?: string;
  deliveryAddress?: string;
  
  // Products
  products: Product[];
  
  // Costs
  transportFee: number; // MZN
  exchangeRateZAR_MZN: number;
  totalValueMZN: number; // calculated automatically
  
  // Payment
  paidAmount: number; // sum of all payments
  debtBalance: number; // calculated automatically
  status: OrderStatus; // calculated automatically
  
  // Trip
  tripId?: string;
  expectedDepartureDate?: Date;
  expectedReturnDate?: Date;
  
  // Management
  responsibleManager: string;
  notes?: string;
  
  // History
  payments: Payment[];
  lastUpdateDate: Date;
}
