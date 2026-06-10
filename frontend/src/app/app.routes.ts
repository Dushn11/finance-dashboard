import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component/layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/dashboard/dashboard.routes').then(m => m.default) 
      },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings').then(m => m.Settings) },
      { path: 'import', loadComponent: () => import('./pages/import/import').then(m => m.Import) },
    ]
  }
];
