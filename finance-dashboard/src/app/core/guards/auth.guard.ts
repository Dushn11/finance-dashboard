import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service.js';

export const authGuard: CanActivateFn = ()=>{
  // TODO: Remove this bypass before production
  return true; // Temporary: allow all routes during development

  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
}
