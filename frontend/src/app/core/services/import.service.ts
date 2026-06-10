import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TabResponse, WidgetDTO } from './dashboard.service'; // Импортируем интерфейс ответа вкладки

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  // Базовый URL, соответствующий @RequestMapping("/api/tabs") в твоем Spring Boot
  private apiUrl = '/api/tabs';

  constructor(private http: HttpClient) {}

  /**
   * 1. ИМПОРТ ФАЙЛА
   * Отправляет CSV, ID пользователя и кастомное имя вкладки на бэкенд
   * Соответствует @PostMapping("/import")
   */
  importFile(
    file: File, 
    userId: number, 
    tabTitle: string, 
    separator: string, 
    skipRows: number, 
    mappingJson: string
  ): Observable<TabResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());
    formData.append('title', tabTitle);
    formData.append('separator', separator);
    formData.append('skipRows', skipRows.toString());
    formData.append('mapping', mappingJson); // Наш JSON маппинга колонок

    return this.http.post<TabResponse>(`${this.apiUrl}/import`, formData);
  }

  /**
   * 2. ПОЛУЧЕНИЕ ВКЛАДКИ ПО ID
   * Загружает ВСЮ вкладку сразу вместе с виджетами и транзакциями (rawData)
   * Соответствует @GetMapping("/{id}")
   */
  getTabById(id: number): Observable<TabResponse> {
    return this.http.get<TabResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * 2.1. ПОЛУЧЕНИЕ ВСЕХ ВКЛАДОК ПОЛЬЗОВАТЕЛЯ
   * Загружает список всех вкладок текущего пользователя
   * Соответствует @GetMapping
   */
  getUserTabs(): Observable<TabResponse[]> {
    return this.http.get<TabResponse[]>(`${this.apiUrl}`);
  }

  /**
   * 3. СОХРАНЕНИЕ КОНФИГУРАЦИИ ВКЛАДКИ
   * Отправляет текущую конфигурацию вкладки (виджеты и их позиции) на бэкенд
   * Соответствует @PostMapping("/save")
   */
  saveTab(tabId: number, title: string, widgets: WidgetDTO[]): Observable<TabResponse> {
    const payload = {
      tabId,
      title,
      widgets
    };
    return this.http.post<TabResponse>(`${this.apiUrl}/save`, payload);
  }

  /**
   * 4. ПОЛУЧЕНИЕ ТРАНЗАКЦИЙ ВКЛАДКИ
   * Загружает все транзакции из всех DataSource виджетов вкладки
   * Соответствует @GetMapping("/{id}/transactions")
   */
  getTabTransactions(tabId: number): Observable<any[]> {
    const url = `${this.apiUrl}/${tabId}/transactions`;
    console.log('Requesting transactions from:', url);
    return this.http.get<any[]>(url);
  }
}