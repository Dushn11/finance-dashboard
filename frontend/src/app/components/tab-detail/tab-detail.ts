import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService, LocalTab, WidgetDTO } from '../../core/services/dashboard.service';
import { ImportService } from '../../core/services/import.service';
import { Gridster, GridsterItem, GridsterItemConfig, GridsterConfig } from 'angular-gridster2';
import { WidgetBuilderComponent } from '../widget-builder/widget-builder';
import { ChartWidgetComponent } from '../widgets/chart-widget/chart-widget';
import { SummaryWidgetComponent } from '../widgets/summary-widget/summary-widget';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-tab-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, Gridster, GridsterItem, WidgetBuilderComponent, ChartWidgetComponent, SummaryWidgetComponent],
  templateUrl: './tab-detail.html',
  styleUrls: ['./tab-detail.scss']
})
export class TabDetailComponent implements OnInit, OnDestroy {
  tabId!: number;
  activeTab: LocalTab | null = null;
  showWidgetBuilder: boolean = false;
  isBrowser: boolean = true;
  transactions: any[] = []; // Транзакции загруженные с бэкенда

  // Subject для debounced сохранения
  private saveSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  gridsterConfig: GridsterConfig = {
    gridType: 'fit',
    displayGrid: 'none',
    compactType: 'none',
    margin: 10,
    outerMargin: true,
    draggable: { enabled: true },
    resizable: { enabled: true },
    minCols: 15,
    maxCols: 15,
    minRows: 15,
    maxRows: 15,
    maxItemCols: 10,
    maxItemRows: 15,
    pushItems: true,
    swap: false,
    itemChangeCallback: (item: GridsterItemConfig, itemComponent: GridsterItem) => {
      console.log('itemChange fired:', item);
      const widget = this.activeTab?.data.widgets.find(w => w.gridPosition === item);
      console.log('found widget:', widget);
      if (widget) {
        this.saveSubject.next();
      }
    },
    itemResizeCallback: (item: GridsterItemConfig, itemComponent: GridsterItem) => {
      const widget = this.activeTab?.data.widgets.find(w => w.gridPosition === item);
      if (widget) {
        this.saveSubject.next();
      }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dashboardService: DashboardService,
    private importService: ImportService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Настраиваем debounced сохранение
    this.saveSubject
      .pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.saveToBackend();
      });

    this.route.params.subscribe(params => {
      this.tabId = +params['id'];
      this.loadTabData();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTabData() {
    const cachedTab = this.dashboardService.getTabById(this.tabId);
    if (cachedTab) {
      this.activeTab = cachedTab;
    }

    this.importService.getTabById(this.tabId).subscribe({
      next: (response) => {
        response.widgets.forEach((w: any) => {
          if (w.gridPosition) {
            w.gridPosition.cols = w.gridPosition.cols ?? w.gridPosition.w ?? 4;
            w.gridPosition.rows = w.gridPosition.rows ?? w.gridPosition.h ?? 3;
            w.gridPosition.x = w.gridPosition.x ?? 0;
            w.gridPosition.y = w.gridPosition.y ?? 0;
          }
        });

        this.activeTab = { id: this.tabId, title: response.title, data: response };
        this.dashboardService.updateTabInStorage(this.activeTab);
        this.showWidgetBuilder = false;

        setTimeout(() => this.loadTransactions(), 100);
      },
      error: (err) => {
        console.error('Failed to load tab data from backend:', err);
        if (!cachedTab) {
          this.router.navigate(['/dashboard']);
        }
      }
    });
  }

  // Извлекаем транзакции. Так как при импорте бэк может временно положить их в data,
  // сделаем безопасное приведение к any, чтобы TS не ругался, пока структура на бэке утрясается
  getTransactions(): any[] {
    return this.transactions;
  }

  loadTransactions(): void {
    console.log('loadTransactions called, tabId:', this.tabId);
    if (!this.tabId) {
      console.warn('No tabId, skipping transaction load');
      return;
    }
    console.log('Fetching transactions from backend...');
    this.importService.getTabTransactions(this.tabId).subscribe({
      next: (transactions) => {
        this.transactions = [...transactions];
        this.cdr.detectChanges(); // форсим передачу в дочерние компоненты
        console.log('Loaded transactions:', transactions.length);
      },
      error: (err) => {
        console.error('Error loading transactions:', err);
      }
    });
  }

  onWidgetCreated(event: any) {
    if (!this.activeTab) return;

    // Маппим пришедший объект к нашему интерфейсу WidgetDTO
    const newWidget = event as WidgetDTO;

    if (!this.activeTab.data.widgets) {
      this.activeTab.data.widgets = [];
    }

    if (!newWidget.gridPosition) {
      newWidget.gridPosition = {
        x: 0,
        y: 0,
        cols: 4,
        rows: 3
      };
    }

    this.activeTab.data.widgets.push(newWidget);
    this.dashboardService.updateTabInStorage(this.activeTab);
    this.showWidgetBuilder = false;
  }

  onBuilderClosed() {
    this.showWidgetBuilder = false;
    if (!this.activeTab?.data?.widgets || this.activeTab.data.widgets.length === 0) {
      this.router.navigate(['/dashboard']);
    }
  }

  removeWidget(tabId: number, widgetId: number) {
    if (!this.activeTab || this.activeTab.id !== tabId) return;

    this.activeTab.data.widgets = this.activeTab.data.widgets.filter(w => w.id !== widgetId);
    this.dashboardService.updateTabInStorage(this.activeTab);
  }

  getSummaryValue(widget: WidgetDTO): number {
    const transactions = this.getTransactions();
    const metric = widget.settings?.metric; // В WidgetDTO настройки лежат в settings
    const category = widget.settings?.category;

    const filtered = transactions.filter((t: any) => {
      if (!category || category === 'any') return true;
      return t.category?.toLowerCase() === category.toLowerCase();
    });

    return filtered.reduce((sum: number, t: any) => {
      const amount = t.amount || 0;
      if (metric === 'income' && amount > 0) return sum + amount;
      if (metric === 'expense' && amount < 0) return sum + Math.abs(amount);
      if (metric === 'balance') return sum + amount;
      return sum;
    }, 0);
  }

  onItemChange(event: any, widget: WidgetDTO) {
    if (!this.activeTab) return;

    widget.gridPosition = {
      x: event.x ?? 0,
      y: event.y ?? 0,
      cols: event.cols ?? 4,
      rows: event.rows ?? 3,
      w: event.cols ?? 4,
      h: event.rows ?? 3
    };
    this.dashboardService.updateTabInStorage(this.activeTab);

    // Триггерим debounced сохранение на бэкенд
    this.saveSubject.next();
  }

  onItemResize(event: any, widget: WidgetDTO) {
    if (!this.activeTab) return;

    widget.gridPosition = {
      x: event.x ?? 0,
      y: event.y ?? 0,
      cols: event.cols ?? 4,
      rows: event.rows ?? 3,
      w: event.cols ?? 4,
      h: event.rows ?? 3
    };
    this.dashboardService.updateTabInStorage(this.activeTab);

    // Триггерим debounced сохранение на бэкенд
    this.saveSubject.next();
  }

  /** Сохранение конфигурации вкладки на бэкенд */
  private saveToBackend() {
    if (!this.activeTab) return;

    // Преобразуем виджеты в формат, ожидаемый бэкендом
    // Фильтруем виджеты со строковыми ID (старые данные из кэша)
    const widgets = this.activeTab.data.widgets
      .filter(widget => typeof widget.id === 'number')
      .map(widget => ({
        id: widget.id,
        type: widget.type,
        title: widget.title,
        dataSourceId: widget.dataSourceId,
        gridPosition: widget.gridPosition || {
          x: 0,
          y: 0,
          cols: 4,
          rows: 3,
          w: 4,
          h: 3
        },
        // Отправляем config в поле settings для backend
        settings: widget.config || widget.settings || {},
        rawData: widget.rawData
      }));

    const payload = {
      tabId: this.activeTab.id,
      title: this.activeTab.title,
      widgets: widgets
    };

    console.log('Saving to backend:', payload);

    this.importService.saveTab(
      this.activeTab.id,
      this.activeTab.title,
      widgets
    ).subscribe({
      next: (response) => {
        console.log('Tab saved successfully:', response);
      },
      error: (err) => {
        console.error('Failed to save tab to backend:', err);
        console.error('Error details:', err.error);
      }
    });
  }
}