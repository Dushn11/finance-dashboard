import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// --- ИНТЕРФЕЙСЫ (DTO) ---
export interface WidgetDTO {
  id: number;
  type: string;
  title: string;
  gridPosition: any;
  settings: any;
  config?: any;  // Добавляем для совместимости с фронтенд виджетами
  dataSourceId?: number;
  rawData?: any;
}

export interface TabResponse {
  tabId: number;
  title: string;
  widgets: WidgetDTO[];
}

export interface LocalTab {
  id: number;
  title: string;
  data: TabResponse;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService  {
  private tabsSubject = new BehaviorSubject<LocalTab[]>([]);
  private activeTabIdSubject = new BehaviorSubject<number | null>(null);

  tabs$: Observable<LocalTab[]> = this.tabsSubject.asObservable();
  activeTabId$: Observable<number | null> = this.activeTabIdSubject.asObservable();

  constructor() {
    this.init();
  }
  private init(): void {
    try {
      this.loadFromStorage();
      // ... дальше твой код парсинга ...
    } catch (e) {
      console.error('LocalStorage пуст или поврежден', e);
      // Обязательно: очисти битый кэш, чтобы при следующем запуске 
      // приложение не пыталось снова упасть на этой ошибке
      localStorage.removeItem('dashboard_tabs');
    }
  }
  private loadFromStorage(): void {
    try {
      const storedTabs = localStorage.getItem('dashboard_tabs');
      const storedActiveId = localStorage.getItem('dashboard_active_tab_id');

      if (storedTabs) {
        this.tabsSubject.next(JSON.parse(storedTabs) as LocalTab[]);
      }
      if (storedActiveId) {
        this.activeTabIdSubject.next(Number(storedActiveId));
      }
    } catch (e) {
      console.error('Error loading dashboard from localStorage', e);
    }
  }

  private saveToStorage(tabs: LocalTab[], activeId: number | null): void {
    localStorage.setItem('dashboard_tabs', JSON.stringify(tabs));
    if (activeId !== null) {
      localStorage.setItem('dashboard_active_tab_id', activeId.toString());
    }
  }

  addTab(title: string, rawResponse: TabResponse, tabId: number): LocalTab {
    const currentTabs = this.tabsSubject.value;
    
    const newTab: LocalTab = {
      id: tabId,
      title: title,
      data: rawResponse
    };

    const updatedTabs = [...currentTabs, newTab];
    this.tabsSubject.next(updatedTabs);
    this.activeTabIdSubject.next(tabId);
    
    this.saveToStorage(updatedTabs, tabId);
    return newTab;
  }

  setActiveTab(id: number): void {
    this.activeTabIdSubject.next(id);
    this.saveToStorage(this.tabsSubject.value, id);
  }
  // Позволяет получить вкладку из текущего состояния BehaviorSubject
  getTabById(id: number): LocalTab | null {
    return this.tabsSubject.value.find(tab => tab.id === id) || null;
  }

  // Обновляет измененную вкладку (например, добавился или удалился виджет) и сохраняет в кэш
  updateTabInStorage(updatedTab: LocalTab | null): void {
    if (!updatedTab) return;
    const currentTabs = this.tabsSubject.value;
    const updatedTabs = currentTabs.map(tab => tab.id === updatedTab.id ? updatedTab : tab);
    
    this.tabsSubject.next(updatedTabs);
    this.saveToStorage(updatedTabs, this.activeTabIdSubject.value);
  }
  get activeTab(): LocalTab | null {
    const activeId = this.activeTabIdSubject.value;
    if (activeId === null) return null;
    return this.tabsSubject.value.find(tab => tab.id === activeId) || null;
  }

  /** Полностью сбрасывает состояние (для logout) */
  clearState(): void {
    this.tabsSubject.next([]);
    this.activeTabIdSubject.next(null);
  }

  /** Загружает табы из массива (для инициализации с бэкенда) */
  loadTabsFromBackend(tabResponses: TabResponse[]): void {
    const tabs: LocalTab[] = tabResponses.map(response => ({
      id: response.tabId,
      title: response.title,
      data: response
    }));

    this.tabsSubject.next(tabs);
    this.saveToStorage(tabs, this.activeTabIdSubject.value);
  }
}