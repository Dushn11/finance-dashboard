import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component/layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
      path: 'login',
      loadComponent: () =>
  import('./pages/login/login').then(m => m.Login)
    },
    {
      path: '',
      component: LayoutComponent,
      canActivate: [authGuard],
      children: [
        { path: '', redirectTo: 'dashboard',
  pathMatch: 'full' },
        { path: 'dashboard', loadComponent: () =>
  import('./pages/dashboard/dashboard').then(m =>
  m.Dashboard) },
        { path: 'settings', loadComponent: () =>
  import('./pages/settings/settings').then(m =>
  m.Settings) },
        { path: 'import', loadComponent: () =>
  import('./pages/import/import').then(m =>
  m.Import) },
      ]
    }
  ];
