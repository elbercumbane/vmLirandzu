import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Baixas, recibos e tesouraria: apenas Administrador ou Gestor. Técnicos não acedem. */
export const billingFinanceiroGuard: CanActivateFn = (_, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.canAccessBaixasERecibos()) return true;
  router.navigate(['/billing'], { queryParams: { semPermissao: 'financeiro' } });
  return false;
};
