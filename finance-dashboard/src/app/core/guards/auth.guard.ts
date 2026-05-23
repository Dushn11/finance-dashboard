import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service.js';

export const AuthGuard: CanActivateFn = ()=>{
  // DEVELOPMENT MODE: Auth check disabled
  return true;

  // const authService = inject(AuthService);
  // const router = inject(Router);
  // if (authService.isAuthenticated()) {
  //   return true;
  // } else {
  //   router.navigate(['/login']);
  //   return false;
  // }
}
