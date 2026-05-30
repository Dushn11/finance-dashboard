import { Injectable } from '@angular/core';
import { GridsterConfig } from 'angular-gridster2';
import { DashboardTab } from '../../models/dashboard.model.js';
import { WidgetItem } from '../../models/dashboard.model.js';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  tabs: DashboardTab[] = [];
  getDefaultGridsterConfig(): GridsterConfig {
    return {
      gridType: 'fit',
      displayGrid: 'onDrag&Resize',
      pushItems: true,
      draggable: {
        enabled: true,
      },
      resizable: {
        enabled: true,
      },
      minCols: 12,
      maxCols: 12,
      minRows: 10,
      maxRows: 10,
      margin: 10,
    };
  }
  addTab(name: string, importedData: any) {
    const newTab: DashboardTab = {
      id: `tab-${Date.now()}`,
      name: name,
      gridsterConfig: this.getDefaultGridsterConfig(),
      widgets: []
    };
    this.tabs.push(newTab);
    return newTab;
  }
  removeTab(tabId: string) {
    this.tabs = this.tabs.filter(tab => tab.id !== tabId);
  }
  addWidget(tabId: string, widget: WidgetItem) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.widgets.push(widget);
    }
  }
  
}