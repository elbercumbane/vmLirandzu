import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'rastreio', loadComponent: () => import('./features/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent) },
  { path: 'orcamento', loadComponent: () => import('./features/request-quote/request-quote.component').then(m => m.RequestQuoteComponent) },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'servicos', loadComponent: () => import('./features/all-services/all-services.component').then(m => m.AllServicesComponent) },
  { path: 'sobre', loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent) },
  { path: 'faq', loadComponent: () => import('./features/faq/faq.component').then(m => m.FaqComponent) },
  { path: 'area-cliente', loadComponent: () => import('./features/client-area/client-area.component').then(m => m.ClientAreaComponent) },
  { path: 'billing', loadComponent: () => import('./features/billing-admin/billing-admin.component').then(m => m.BillingAdminComponent) },
  { path: 'billing/encomendas', loadComponent: () => import('./features/billing-orders/billing-orders.component').then(m => m.BillingOrdersComponent) },
  { path: 'billing/viagens', loadComponent: () => import('./features/billing-trips/billing-trips.component').then(m => m.BillingTripsComponent) },
  { path: 'billing/clientes', loadComponent: () => import('./features/billing-customers/billing-customers.component').then(m => m.BillingCustomersComponent) },
  { path: 'billing/relatorios', loadComponent: () => import('./features/billing-reports/billing-reports.component').then(m => m.BillingReportsComponent) },
  { path: 'billing/configuracoes', loadComponent: () => import('./features/billing-settings/billing-settings.component').then(m => m.BillingSettingsComponent) },
  { path: '**', redirectTo: '' }
];
