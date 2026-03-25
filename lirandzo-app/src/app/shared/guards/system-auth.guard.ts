import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const systemAuthGuard: CanActivateFn = (_, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.canAccessSistema()) return true;
  router.navigate(['/login-sistema'], { queryParams: { returnUrl: state.url } });
  return false;
};
