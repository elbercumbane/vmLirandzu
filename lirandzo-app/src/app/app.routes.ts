import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'rastreio', loadComponent: () => import('./features/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent) },
  { path: 'orcamento', loadComponent: () => import('./features/request-quote/request-quote.component').then(m => m.RequestQuoteComponent) },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'servicos', loadComponent: () => import('./features/all-services/all-services.component').then(m => m.AllServicesComponent) },
  { path: '**', redirectTo: '' }
];
