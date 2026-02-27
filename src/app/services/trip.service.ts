import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Trip, TripStatus, TripWithOrders, CheckItem, CheckStatus } from '../models/trip.model';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  constructor(private storage: StorageService) {}

  private generateTripNumber(): string {
    const trips = this.storage.getTrips();
    const year = new Date().getFullYear();
    const last = trips
      .filter(t => t.tripNumber.startsWith(`VML-VIAGEM-${year}-`))
      .sort((a, b) => {
        const numA = parseInt(a.tripNumber.split('-')[3]);
        const numB = parseInt(b.tripNumber.split('-')[3]);
        return numB - numA;
      })[0];

    let next = 1;
    if (last) {
      const lastNum = parseInt(last.tripNumber.split('-')[3]);
      next = lastNum + 1;
    }

    return `VML-VIAGEM-${year}-${String(next).padStart(3, '0')}`;
  }

  private generateId(): string {
    return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
  }

  getAllTrips(): Trip[] {
    return this.storage.getTrips();
  }

  getTripById(id: string): Trip | undefined {
    return this.storage.getTrips().find(t => t.id === id);
  }

  getTripWithOrders(id: string, orders: Order[]): TripWithOrders | undefined {
    const trip = this.getTripById(id);
    if (!trip) return undefined;
    const tripOrders = orders.filter(o => trip.orderIds.includes(o.id));
    return { ...trip, orders: tripOrders };
  }

  createTrip(partial: Omit<Trip, 'id' | 'tripNumber' | 'status' | 'orderIds' | 'checkItems' | 'creationDate' | 'lastUpdateDate'>): Trip {
    const trips = this.storage.getTrips();
    const now = new Date();

    const newTrip: Trip = {
      ...partial,
      id: this.generateId(),
      tripNumber: this.generateTripNumber(),
      status: TripStatus.PLANNED,
      orderIds: [],
      checkItems: [],
      creationDate: now,
      lastUpdateDate: now
    };

    trips.push(newTrip);
    this.storage.saveTrips(trips);
    return newTrip;
  }

  updateTrip(updated: Trip): void {
    const trips = this.storage.getTrips();
    const index = trips.findIndex(t => t.id === updated.id);
    if (index === -1) return;
    trips[index] = { ...updated, lastUpdateDate: new Date() };
    this.storage.saveTrips(trips);
  }

  addOrdersToTrip(tripId: string, orderIds: string[], orders: Order[]): void {
    const trip = this.getTripById(tripId);
    if (!trip) return;

    const uniqueOrderIds = Array.from(new Set([...trip.orderIds, ...orderIds]));
    const existingChecks = trip.checkItems;

    const newChecks: CheckItem[] = uniqueOrderIds.map(orderId => {
      const existing = existingChecks.find(c => c.orderId === orderId);
      if (existing) return existing;

      const order = orders.find(o => o.id === orderId);
      if (!order || order.products.length === 0) {
        return {
          orderId,
          productName: 'Produtos',
          store: '',
          valueZAR: 0,
          paymentStatus: order ? order.status : '',
          checkStatus: CheckStatus.PENDING
        };
      }

      const firstProduct = order.products[0];
      return {
        orderId,
        productName: firstProduct.name,
        store: firstProduct.store,
        valueZAR: firstProduct.valueZAR * firstProduct.quantity,
        paymentStatus: order.status,
        checkStatus: CheckStatus.PENDING
      };
    });

    trip.orderIds = uniqueOrderIds;
    trip.checkItems = newChecks;
    trip.lastUpdateDate = new Date();
    this.updateTrip(trip);
  }

  updateCheckStatus(tripId: string, orderId: string, status: CheckStatus, notes?: string): void {
    const trip = this.getTripById(tripId);
    if (!trip) return;

    trip.checkItems = trip.checkItems.map(c =>
      c.orderId === orderId ? { ...c, checkStatus: status, notes: notes ?? c.notes } : c
    );
    trip.lastUpdateDate = new Date();
    this.updateTrip(trip);
  }

  updateTripStatus(tripId: string, status: TripStatus): void {
    const trip = this.getTripById(tripId);
    if (!trip) return;
    trip.status = status;
    if (status === TripStatus.COMPLETED && !trip.returnDate) {
      trip.returnDate = new Date();
    }
    trip.lastUpdateDate = new Date();
    this.updateTrip(trip);
  }
}

