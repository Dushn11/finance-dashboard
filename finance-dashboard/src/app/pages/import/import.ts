import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service.js';
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

  getVisibleColumns(): number[] {
    if (!this.csvPreview) return [];
    return this.csvPreview.headers
      .map((_, i) => i)
      .filter(i => this.columnMappingArray.at(i)?.value !== 'ignore');
  }
  constructor(
    private importService: ImportService,
    private dashboardService: DashboardService,
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

    // Временно: создаем тестовую вкладку с липовыми данными
    const tabName = this.importForm.get('tabName')?.value || `Import ${new Date().toLocaleDateString()}`;

    const mockData = {
      transactions: [
        { date: '2025-11-21', description: 'LIDL KOSCIUSZKI', amount: -10.89, type: 'expense', category: 'Groceries' },
        { date: '2025-11-24', description: 'ZABKA Z2613', amount: -4.50, type: 'expense', category: 'Groceries' },
        { date: '2025-11-26', description: 'Transfer from son', amount: 100.00, type: 'income', category: 'Transfer' },
        { date: '2025-11-29', description: 'T-MOBILE POLSKA', amount: -35.00, type: 'expense', category: 'Bills' },
        { date: '2025-11-29', description: 'PANDORA Bonarka', amount: -139.30, type: 'expense', category: 'Shopping' },
        { date: '2025-12-02', description: 'BLIK Payment', amount: -5.00, type: 'expense', category: 'Other' },
      ]
    };

    this.dashboardService.addTab(tabName, mockData);


    // Закомментировано: реальный запрос на сервер
    const formData = new FormData();
    const file = this.selectedFile!;
    formData.append('file', file);
    formData.append('tabName', tabName);
    formData.append('tabId', this.tabId ?? new Date().toISOString());

    const mapping: { [key: string]: string } = {};

  this.columnMappingArray.controls.forEach((control, index) => {
    const value = control.value;
    if (value && value !== 'ignore') {
      mapping[index.toString()] = value;
    }
  });

  formData.append('columnMapping', JSON.stringify(mapping));
  formData.append('separator', String(this.importForm.get('columnSeparator')?.value ?? ','));
  formData.append('skipRows', String(this.importForm.get('skipRows')?.value ?? '0'));

  this.importService.uploadCsv(formData).subscribe({
    next: (response) => {
      this.dashboardService.addTab(tabName, response);
      this.router.navigate(['/dashboard']);
    },
    error: (error) => {
      console.error('Error uploading file', error);
    }
  });
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
