import { Component, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { Gridster, GridsterItem } from 'angular-gridster2';
import { DashboardService } from '../../core/services/dashboard.service.js';
import { WidgetItem } from '../../models/dashboard.model.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    Gridster,
    GridsterItem
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  constructor(public dashboardService: DashboardService) { }

  closeTab(index: number) {
    const tab = this.dashboardService.tabs[index];
    this.dashboardService.removeTab(tab.id);
  }

  addWidget(tabId: string) {
    const newWidget: WidgetItem = {
      id: `widget-${Date.now()}`,
      type: 'chart',
      x: 0,
      y: 0,
      rows: 4,
      cols: 6
    };
    this.dashboardService.addWidget(tabId, newWidget);
  }

  removeWidget(tabId: string, widgetId: string) {
    const tab = this.dashboardService.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.widgets = tab.widgets.filter(w => w.id !== widgetId);
    }
  }
}