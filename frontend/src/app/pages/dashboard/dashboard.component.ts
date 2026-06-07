import { Component, PLATFORM_ID, inject, OnInit, Input } from '@angular/core'; 
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { Gridster, GridsterItem } from 'angular-gridster2';
import { DashboardService } from '../../core/services/dashboard.service.js';
import { TransactionService } from '../../core/services/transaction.service.js';
import { TabService } from '../../core/services/tab.service.js';
import { WidgetItem } from '../../models/dashboard.model.js';
import { WidgetBuilderComponent } from '../../components/widget-builder/widget-builder';
import { ChartWidgetComponent } from '../../components/widgets/chart-widget/chart-widget';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    Gridster,
    GridsterItem,
    RouterLink,
    WidgetBuilderComponent,
    ChartWidgetComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.component.scss',
})

export class DashboardComponent implements OnInit {
  @Input() transactions = [];
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);
  showWidgetBuilder = false;

  constructor(
    public dashboardService: DashboardService,
    private tabService: TabService,
    private transactionService: TransactionService
  ) {}

  ngOnInit() {
    this.tabService.activeTab$.subscribe((tab) => {
      if (!tab) {
        return;
      }
      this.dashboardService.setActiveTab(tab.id);
      this.transactionService.fetchTransactions(tab.id).subscribe({
        error: (err) => console.error('Failed to load transactions for active tab', err)
      });
    });

    this.tabService.loadTabs();
  }

  openWidgetBuilder() {
    this.showWidgetBuilder = true;
  }

  onWidgetCreated(widget: WidgetItem) {
    const tab = this.dashboardService.activeTab;
    if (tab) {
      this.dashboardService.addWidget(tab.id, widget);
    }
    this.showWidgetBuilder = false;
  }

  removeWidget(tabId: string, widgetId: string) {
    const tab = this.dashboardService.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.widgets = tab.widgets.filter(w => w.id !== widgetId);
    }
  }

  // Обработчик перемещения/обновления элемента gridster
  onItemChange(event: any, widget: any) {
    // event may contain the updated item; normalize to widget update
    const item = event && event.item ? event.item : event;
    if (!item) return;
    widget.x = item.x ?? widget.x;
    widget.y = item.y ?? widget.y;
    widget.cols = item.cols ?? widget.cols;
    widget.rows = item.rows ?? widget.rows;
    // изменения уже живут в табе (по ссылке); при необходимости можно вызвать сохранение
  }

  onItemResize(event: any, widget: any) {
    this.onItemChange(event, widget);
  }

  // Простейшая отрисовка summary-виджета — подсчёт суммы по транзакциям
  getSummaryValue(widget: any): number {
    const tab = this.dashboardService.activeTab;
    if (!tab || !widget.config) return 0;
    const cfg = widget.config;
    const from = this.parseDate(cfg.dateFrom);
    const to = this.parseDate(cfg.dateTo);
    const metric = cfg.metric === 'expenses' ? 'expense' : 'income';
    const category = cfg.category;

    const filtered = tab.transactions.filter((t: any) => {
      const d = new Date(t.date);
      if (from && d < from) return false;
      if (to && d > to) return false;
      if (category && category !== 'any' && t.category !== category) return false;
      return true;
    });
    const sum = filtered.reduce((acc: number, t: any) => {
      if (cfg.metric === 'expenses' && t.type === 'expense') return acc + Math.abs(t.amount);
      if (cfg.metric === 'income' && t.type === 'income') return acc + Math.abs(t.amount);
      return acc;
    }, 0);
    return sum;
  }

  parseDate(s: string | undefined | null): Date | null {
    if (!s) return null;
    // assume YYYY-MM-DD
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
}