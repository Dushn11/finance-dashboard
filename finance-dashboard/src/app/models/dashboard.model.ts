import { GridsterConfig } from 'angular-gridster2';

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export interface DashboardTab {
  id: string;
  name: string;
  gridsterConfig: GridsterConfig;
  widgets: WidgetItem[];
  transactions: Transaction[];
}

export type WidgetType = 'summary' | 'chart' | 'table' | 'stats';

export interface SummaryWidgetConfig {
  metric: 'expenses' | 'income';
  category: string; // 'any' или конкретная категория
  dateFrom: string;
  dateTo: string;
}

export interface WidgetItem {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  cols: number;
  rows: number;
  config?: SummaryWidgetConfig;
  data?: any;
}