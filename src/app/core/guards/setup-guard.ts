import { CanActivateFn } from '@angular/router';

export const setupGuard: CanActivateFn = (route, state) => {
  return true;
};
