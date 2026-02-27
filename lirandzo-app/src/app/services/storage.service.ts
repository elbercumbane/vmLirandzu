import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';
import { Customer } from '../models/customer.model';
import { Trip } from '../models/trip.model';
import { Configuration } from '../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly ORDERS_KEY = 'vmlirandzu_orders';
  private readonly CUSTOMERS_KEY = 'vmlirandzu_customers';
  private readonly TRIPS_KEY = 'vmlirandzu_trips';
  private readonly CONFIG_KEY = 'vmlirandzu_config';

  // Orders
  getOrders(): Order[] {
    const data = localStorage.getItem(this.ORDERS_KEY);
    if (!data) return [];
    const orders = JSON.parse(data);
    return orders.map((e: any) => ({
      ...e,
      registrationDate: new Date(e.registrationDate || e.dataRegisto),
      expectedDepartureDate: e.expectedDepartureDate || e.dataPrevistaIda ? new Date(e.expectedDepartureDate || e.dataPrevistaIda) : undefined,
      expectedReturnDate: e.expectedReturnDate || e.dataPrevistaRetorno ? new Date(e.expectedReturnDate || e.dataPrevistaRetorno) : undefined,
      payments: e.payments || e.pagamentos ? (e.payments || e.pagamentos).map((p: any) => ({ ...p, date: new Date(p.date || p.data) })) : [],
      lastUpdateDate: new Date(e.lastUpdateDate || e.dataUltimaActualizacao)
    }));
  }

  saveOrders(orders: Order[]): void {
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
  }

  // Customers
  getCustomers(): Customer[] {
    const data = localStorage.getItem(this.CUSTOMERS_KEY);
    if (!data) return [];
    const customers = JSON.parse(data);
    return customers.map((c: any) => ({
      ...c,
      registrationDate: new Date(c.registrationDate || c.dataRegisto)
    }));
  }

  saveCustomers(customers: Customer[]): void {
    localStorage.setItem(this.CUSTOMERS_KEY, JSON.stringify(customers));
  }

  // Trips
  getTrips(): Trip[] {
    const data = localStorage.getItem(this.TRIPS_KEY);
    if (!data) return [];
    const trips = JSON.parse(data);
    return trips.map((v: any) => ({
      ...v,
      departureDate: new Date(v.departureDate || v.dataPartida),
      returnDate: v.returnDate || v.dataRetorno ? new Date(v.returnDate || v.dataRetorno) : undefined,
      creationDate: new Date(v.creationDate || v.dataCriacao),
      lastUpdateDate: new Date(v.lastUpdateDate || v.dataUltimaActualizacao)
    }));
  }

  saveTrips(trips: Trip[]): void {
    localStorage.setItem(this.TRIPS_KEY, JSON.stringify(trips));
  }

  // Configuration
  getConfig(): Configuration | null {
    const data = localStorage.getItem(this.CONFIG_KEY);
    if (!data) return null;
    return JSON.parse(data);
  }

  saveConfig(config: Configuration): void {
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
  }

  // Full backup
  exportBackup(): string {
    return JSON.stringify({
      orders: this.getOrders(),
      customers: this.getCustomers(),
      trips: this.getTrips(),
      config: this.getConfig(),
      exportDate: new Date().toISOString()
    });
  }

  importBackup(jsonString: string): void {
    const data = JSON.parse(jsonString);
    if (data.orders || data.encomendas) this.saveOrders(data.orders || data.encomendas);
    if (data.customers || data.clientes) this.saveCustomers(data.customers || data.clientes);
    if (data.trips || data.viagens) this.saveTrips(data.trips || data.viagens);
    if (data.config || data.configuracao) this.saveConfig(data.config || data.configuracao);
  }
}

