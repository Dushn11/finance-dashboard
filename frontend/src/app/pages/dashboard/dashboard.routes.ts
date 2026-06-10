console.log("ОНО ЖИВОЕ! ДЭШБОРД РАБОТАЕТ!"); // Проверка, что код выполняется
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

export default [
  {
    path: '',
    component: DashboardComponent,
    children: [
      // Переносим детей сюда!
      { 
        path: '', 
        loadComponent: () => import('../../components/no-tab/no-tab').then(m => m.NoTabComponent) 
      },
      { 
        path: 'tab/:id', 
        loadComponent: () => import('../../components/tab-detail/tab-detail').then(m => m.TabDetailComponent) 
      }
    ]
  }] satisfies Routes;