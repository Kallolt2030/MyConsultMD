import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth';


export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (await auth.isLoggedIn()) return true;

  router.navigateByUrl('/login', { replaceUrl: true });
  return false;
};