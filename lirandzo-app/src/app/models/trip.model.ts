import { Order } from './order.model';

export enum TripStatus {
  PLANNED = 'PLANEADA',
  IN_PROGRESS = 'EM CURSO',
  COMPLETED = 'CONCLUÍDA'
}

export enum CheckStatus {
  PENDING = 'PENDENTE',
  PURCHASED = 'COMPRADO',
  NOT_FOUND = 'NÃO ENCONTRADO',
  WAITING = 'AGUARDA'
}

export interface CheckItem {
  orderId: string;
  productName: string;
  store: string;
  valueZAR: number;
  paymentStatus: string;
  checkStatus: CheckStatus;
  notes?: string;
}

export interface Trip {
  id: string;
  tripNumber: string; // VML-VIAGEM-001
  departureDate: Date;
  returnDate?: Date;
  responsibleManager: string;
  status: TripStatus;
  orderIds: string[];
  checkItems: CheckItem[];
  notes?: string;
  creationDate: Date;
  lastUpdateDate: Date;
}

export interface TripWithOrders extends Trip {
  orders: Order[];
}

