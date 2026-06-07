import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { GridsterConfig } from 'angular-gridster2'; // Оставили только сам конфиг
import { DashboardTab } from '../../models/dashboard.model.js';
import { ImportService } from './import.service.js';

@Injectable({
  providedIn: 'root',
})
export class TabService {
  private tabsSubject = new BehaviorSubject<DashboardTab[]>([]);
  public tabs$ = this.tabsSubject.asObservable();

  private activeTabIdSubject = new BehaviorSubject<string | null>(null);
  public activeTabId$ = this.activeTabIdSubject.asObservable();

  public activeTab$: Observable<DashboardTab | null> = combineLatest([
    this.tabs$,
    this.activeTabId$
  ]).pipe(
    map(([tabs, activeId]) => tabs.find(tab => tab.id === activeId) ?? tabs[0] ?? null)
  );

  get activeTab(): DashboardTab | null {
    return this.tabsSubject.value.find(tab => tab.id === this.activeTabIdSubject.value) ?? this.tabsSubject.value[0] ?? null;
  }

  constructor(private importService: ImportService) {}

  loadTabs() {
    return this.importService.getTabs().pipe(
      tap((tabs) => {
        const normalizedTabs: DashboardTab[] = tabs.map((t) => ({
          id: t.id,
          name: t.name,
          gridsterConfig: this.getDefaultGridsterConfig(),
          widgets: t.widgets ?? [],
          transactions: t.transactions ?? []
        })) as DashboardTab[];

        this.tabsSubject.next(normalizedTabs);

        if (!this.activeTabIdSubject.value && normalizedTabs.length > 0) {
          this.activeTabIdSubject.next(normalizedTabs[0].id);
        }
      })
    );
  }

  setActiveTab(tabId: string): void {
    const foundTab = this.tabsSubject.value.find(tab => tab.id === tabId);
    if (!foundTab) {
      console.warn('Tab not found while setting active tab', tabId);
      return;
    }
    this.activeTabIdSubject.next(tabId);
  }

  addTab(name: string, transactions: any[], id?: string): DashboardTab {
    const newTab: DashboardTab = {
      id: id ?? `tab-${Date.now()}`,
      name,
      gridsterConfig: this.getDefaultGridsterConfig(),
      widgets: [],
      transactions: transactions ?? []
    };

    const nextTabs = [...this.tabsSubject.value, newTab];
    this.tabsSubject.next(nextTabs);
    this.activeTabIdSubject.next(newTab.id);
    return newTab;
  }

  removeTab(tabId: string): void {
    const nextTabs = this.tabsSubject.value.filter(tab => tab.id !== tabId);
    this.tabsSubject.next(nextTabs);

    if (this.activeTabIdSubject.value === tabId) {
      this.activeTabIdSubject.next(nextTabs[0]?.id ?? null);
    }
  }

  private getDefaultGridsterConfig(): GridsterConfig {
    const config = {
      gridType: 'fit',
      displayGrid: 'onDragAndResize', // Поправили на валидное строковое значение либы
      pushItems: true,
      draggable: { enabled: true },
      resizable: { enabled: true },
      minCols: 12,
      maxCols: 12,
      minRows: 10,
      maxRows: 100,
      margin: 10,
    };
    return config as unknown as GridsterConfig;
  }
}