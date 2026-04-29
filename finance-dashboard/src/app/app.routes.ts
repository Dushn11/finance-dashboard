import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Settings } from './pages/settings/settings';
import { Import } from './pages/import/import';

export const routes: Routes = [
    {
        path: '',
        component: Dashboard,
        title: 'Dashboard'
    },
    {
        path: 'settings',
        component: Settings,
        title: 'Settings'
    },
    {
        path: 'import',
        component: Import,
        title: 'Import'
    }
];
