import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/** Envia o perfil ao backend para aplicar regras de pagamento (aprovação técnico vs confirmação imediata). */
export const lirandzoRoleInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const role = auth.role;
  if (role && auth.canAccessSistema()) {
    return next(req.clone({ setHeaders: { 'X-Lirandzo-Role': role } }));
  }
  return next(req);
};
