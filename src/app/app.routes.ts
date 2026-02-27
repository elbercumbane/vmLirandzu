import { Routes } from '@angular/router';

export const routes: Routes = [
  // App raiz vmLirandzu agora não tem mais UI própria de facturação.
  // Mantemos apenas uma rota muito simples, para não quebrar o build.
  {
    path: '',
    loadComponent: () => import('./placeholder-root.component').then(m => m.PlaceholderRootComponent)
  }
];
