import { GridsterConfig } from 'angular-gridster2';

export interface DashboardTab {
    id: string;
    name: string;
    gridsterConfig: GridsterConfig;
    widgets: WidgetItem[];
}
export interface WidgetItem {
    id: string;
    type: 'chart' | 'table' | 'stats';
    x: number;
    y: number;
    cols: number;
    rows: number;
    data?: any;
}