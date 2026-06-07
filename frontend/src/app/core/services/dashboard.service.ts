import { Injectable, inject } from '@angular/core';
import { GridsterConfig } from 'angular-gridster2';
import { DashboardTab } from '../../models/dashboard.model.js';
import { WidgetItem } from '../../models/dashboard.model.js';
import { TabService } from './tab.service.js';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private tabService = inject(TabService);
  tabs: DashboardTab[] = [];
  isLoading = false;
  public activeTabId: string | null = null;

  constructor() {
    this.tabService.tabs$.subscribe((tabs) => (this.tabs = tabs));
    this.tabService.activeTabId$.subscribe((activeTabId) => {
      this.activeTabId = activeTabId;
    });
  }

  loadTabs() {
    this.isLoading = true;
    this.tabService.loadTabs().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
  get activeTab() {
    return this.tabService.activeTab;
  }

  setActiveTab(tabId: string) {
    this.tabService.setActiveTab(tabId);
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

  addTab(name: string, importedData: any, id?: string) {
    return this.tabService.addTab(name, importedData?.transactions ?? [], id);
  }

  removeTab(tabId: string) {
    this.tabService.removeTab(tabId);
  }

  addWidget(tabId: string, widget: WidgetItem) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.widgets.push(widget);
    }
  }
}