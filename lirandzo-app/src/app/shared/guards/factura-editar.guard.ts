import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Só administrador e gestor podem abrir a rota de edição de factura/encomenda. */
export const facturaEditarGuard: CanActivateFn = (route): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin || auth.isGestor) {
    return true;
  }
  const id = route.paramMap.get('id');
  if (id) {
    return router.createUrlTree(['/billing/encomendas', id]);
  }
  return router.createUrlTree(['/billing/encomendas']);
};
