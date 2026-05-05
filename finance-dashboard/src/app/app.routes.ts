import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings').then(m => m.Settings) },
      { path: 'import', loadComponent: () => import('./pages/import/import').then(m => m.Import) },
      { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
    ]
  }
];
