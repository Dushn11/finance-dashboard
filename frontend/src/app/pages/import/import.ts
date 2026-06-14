import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service.js';
import { ChartService } from '../../core/services/chart.service.js';
import { AuthService } from '../../core/services/auth.service.js';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ImportService } from '../../core/services/import.service.js';
import * as Papa from 'papaparse';

interface CsvPreview {
  headers: string[];
  rows: string[][];
}
@Component({
  selector: 'app-import',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './import.html',
  styleUrl: './import.scss',
})

export class Import {
  tabId: string | null = null;
  private fb = new FormBuilder();
  selectedFile: File | null = null;
  showMapping = false;
  importForm: FormGroup;
  public csvPreview: CsvPreview | null = null;

  availableFields = [
    { value: 'ignore', label: 'Ignore' },
    { value: 'date', label: 'Date' },
    { value: 'description', label: 'Description' },
    { value: 'category', label: 'Category' },
    { value: 'recipient', label: 'Recipient' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
    { value: 'amount', label: 'Amount' },
    { value: 'type', label: 'Type' },
    { value: 'sender', label: 'Sender' }
  ];

  pressets = [
    { name: 'Santander', hasHeader: false, skipRows: 2, mapping: { 1: 'date', 3: 'description', 8: 'type', 10: 'expense', 11: 'income' } }
  ];

  getVisibleColumns(): number[] {
    if (!this.csvPreview) return [];
    return this.csvPreview.headers
      .map((_, i) => i)
      .filter(i => this.columnMappingArray.at(i)?.value !== 'ignore');
  }
  constructor(
    private importService: ImportService,
    private dashboardService: DashboardService,
    private chartService: ChartService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.importForm = this.fb.group({
      tabName: [''],
      hasHeader: [true],
      columnSeparator: [',', Validators.required],
      skipRows: [2, [Validators.required, Validators.min(0)]],
      columnMapping: this.fb.array([])
    });

    // Слушаем только изменения настроек, не columnMapping
    this.importForm.get('columnSeparator')?.valueChanges.subscribe(() => {
      if (this.selectedFile) this.parsePreview();
    });
    this.importForm.get('skipRows')?.valueChanges.subscribe(() => {
      if (this.selectedFile) this.parsePreview();
    });
    this.importForm.get('hasHeader')?.valueChanges.subscribe(() => {
      if (this.selectedFile) this.parsePreview();
    });
  }
  get columnMappingArray() {
    return this.importForm.get('columnMapping') as FormArray;
  }
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
    this.parsePreview();
  }

  onImport(): void {
    if (!this.selectedFile) {
      console.error('No file selected');
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('User not authenticated');
      return;
    }

    const tabName = this.importForm.get('tabName')?.value?.trim() || `Import ${new Date().toLocaleDateString()}`;
    const userId = currentUser.id; // ID текущего авторизованного пользователя

    // Получаем настройки парсинга из формы
    const separator = this.importForm.get('columnSeparator')?.value ?? ',';
    const skipRows = this.importForm.get('skipRows')?.value ?? 0;

    // Собираем маппинг колонок { "0": "date", "1": "amount" }
    const mapping: { [key: string]: string } = {};
    this.columnMappingArray.controls.forEach((control, index) => {
      const value = control.value;
      if (value && value !== 'ignore') {
        mapping[index.toString()] = value;
      }
    });

    console.log('Отправка данных на импорт:', { tabName, userId, separator, skipRows, mapping });

    // Передаем всё в сервис
    this.importService.importFile(
      this.selectedFile,
      userId,
      tabName,
      separator,
      skipRows,
      JSON.stringify(mapping) // Передаем маппинг как JSON-строку
    ).subscribe({
      next: (response) => {
        console.log('Импорт успешен. ID вкладки:', response.tabId);
        const newTab = this.dashboardService.addTab(tabName, response, response.tabId);
        this.chartService.refreshCharts();
        this.dashboardService.setActiveTab(response.tabId);
        this.router.navigate(['/dashboard/tab', response.tabId]);
      },
      error: (error) => {
        console.error('Ошибка при импорте файла:', error);
      }
    });
  }
  applyPreset(preset: any) {
    this.importForm.patchValue({
      columnSeparator: preset.separator ?? this.importForm.get('columnSeparator')?.value,
      skipRows: preset.skipRows,
      hasHeader: preset.hasHeader ?? this.importForm.get('hasHeader')?.value
    });

    if (this.selectedFile) {
      setTimeout(() => {
        this.columnMappingArray.controls.forEach((control, index) => {
          const field = preset.mapping[index];
          control.setValue(field ?? 'ignore');
        });
        this.cdr.detectChanges();
      }, 200);
    }
  }
  parsePreview(): void {
    if (!this.selectedFile) {
      console.error('No file selected for preview');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const separator = this.importForm.get('columnSeparator')?.value || ',';
      const skipRows = this.importForm.get('skipRows')?.value || 0;

      const parsed = Papa.parse(text, {
        delimiter: separator,
        skipEmptyLines: true
      });

      const allRows = parsed.data as string[][];
      const dataAfterSkip = allRows.slice(skipRows);
      const hasHeader = this.importForm.get('hasHeader')?.value;

      let headers: string[];
      let rows: string[][];

      if (hasHeader) {
        headers = dataAfterSkip[0];
        rows = dataAfterSkip.slice(1, 6);
      } else {
        headers = dataAfterSkip[0].map((_, i) => `Column ${i}`);
        rows = dataAfterSkip.slice(0, 5);
      }

      this.csvPreview = { headers, rows };

      // Сохраняем текущие значения маппинга
      const currentMapping = this.columnMappingArray.controls.map(c => c.value);

      // Очищаем FormArray
      while (this.columnMappingArray.length) {
        this.columnMappingArray.removeAt(0);
      }

      headers.forEach((header, index) => {
        if (currentMapping[index] !== undefined) {
          this.columnMappingArray.push(this.fb.control(currentMapping[index]));
        } else {
          const isEmpty = !header.trim() && rows.every(row => !row[index]?.trim());
          this.columnMappingArray.push(this.fb.control(isEmpty ? 'ignore' : ''));
        }
      });

      this.cdr.detectChanges();
    };
    reader.readAsText(this.selectedFile);
  }
}
