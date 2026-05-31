import { Injectable, inject } from '@angular/core';
import { GridsterConfig } from 'angular-gridster2';
import { DashboardTab } from '../../models/dashboard.model.js';
import { WidgetItem } from '../../models/dashboard.model.js';
import { ImportService } from './import.service.js';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  importService = inject(ImportService);
  tabs: DashboardTab[] = [];
  isLoading = false;
  public activeTabId: string | null = null;

  loadTabs() {

    this.isLoading = true;
    this.importService.getTabs().subscribe({
      next: (tabs) => {
        this.tabs = tabs.map(t => ({
          id: t.id,
          name: t.name,
          gridsterConfig: this.getDefaultGridsterConfig(),
          widgets: [],
          transactions: t.transactions
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
  get activeTab() {
    return this.tabs.find(t => t.id === this.activeTabId) ?? this.tabs[0] ?? null;
  }

  setActiveTab(tabId: string) {
    this.activeTabId = tabId;
  }

  getDefaultGridsterConfig(): GridsterConfig {
    return {
      gridType: 'fit',
      displayGrid: 'onDrag&Resize',
      pushItems: true,
      draggable: { enabled: true },
      resizable: { enabled: true },
      minCols: 12,
      maxCols: 12,
      minRows: 10,
      maxRows: 100,
      margin: 10,
    };
  }

  addTab(name: string, importedData: any) {
  const newTab: DashboardTab = {
    id: `tab-${Date.now()}`,
    name: name,
    gridsterConfig: this.getDefaultGridsterConfig(),
    widgets: [],
    transactions: importedData?.transactions ?? []
  };
  this.tabs.push(newTab);
  this.activeTabId = newTab.id;
  return newTab;
}

  removeTab(tabId: string) {
    this.tabs = this.tabs.filter(tab => tab.id !== tabId);
    if (this.activeTabId === tabId) {
      this.activeTabId = this.tabs[0]?.id ?? null;
    }
  }

  addWidget(tabId: string, widget: WidgetItem) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.widgets.push(widget);
    }
  }
}