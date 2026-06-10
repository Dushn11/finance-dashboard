import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Transaction, WidgetItem, SummaryWidgetConfig } from '../../models/dashboard.model';

@Component({
  selector: 'app-widget-builder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './widget-builder.html',
  styleUrl: './widget-builder.scss'
})
export class WidgetBuilderComponent implements OnInit {
  @Input() transactions: Transaction[] = [];
  @Output() widgetCreated = new EventEmitter<WidgetItem>();
  @Output() closed = new EventEmitter<void>();

  form: FormGroup;
  selectedType = 'summary';

  // Календарь
  calendarMode: 'from' | 'to' | null = null;
  currentMonth: Date = new Date();
  calendarDays: (Date | null)[] = [];
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  hoverDate: Date | null = null;

  get categories(): string[] {
    const cats = [...new Set(this.transactions.map(t => t.category))].filter(Boolean);
    return cats;
  }

  get minDate(): Date {
    if (!this.transactions.length) {
      console.warn('No transactions, using current date as minDate');
      return new Date();
    }
    const dates = this.transactions
      .map(t => this.parseTransactionDate(t.date))
      .filter(d => !isNaN(d.getTime()));

    if (dates.length === 0) {
      console.warn('No valid dates found, using current date');
      return new Date();
    }

    const min = new Date(Math.min(...dates.map(d => d.getTime())));
    console.log('minDate:', min);
    return min;
  }

  get maxDate(): Date {
    if (!this.transactions.length) {
      console.warn('No transactions, using current date as maxDate');
      return new Date();
    }
    const dates = this.transactions
      .map(t => this.parseTransactionDate(t.date))
      .filter(d => !isNaN(d.getTime()));

    if (dates.length === 0) {
      console.warn('No valid dates found, using current date');
      return new Date();
    }

    const max = new Date(Math.max(...dates.map(d => d.getTime())));
    console.log('maxDate:', max);
    return max;
  }

  // Парсит даты в формате DD-MM-YYYY
  parseTransactionDate(dateStr: string): Date {
    if (!dateStr) return new Date();

    // Проверяем формат DD-MM-YYYY
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length <= 2) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        return new Date(year, month - 1, day);
      }
    }
    return new Date(dateStr);
  }

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      metric: ['expenses', Validators.required],
      category: ['any'],
      chartType: ['line']
    });
  }

  ngOnInit() {
    console.log('Widget builder initialized');
    console.log('Transactions received:', this.transactions.length);
    if (this.transactions.length > 0) {
      console.log('First transaction:', this.transactions[0]);
    }

    const min = this.minDate;
    const max = this.maxDate;

    console.log('Calculated minDate:', min);
    console.log('Calculated maxDate:', max);

    // Проверяем валидность дат
    if (isNaN(min.getTime()) || isNaN(max.getTime())) {
      console.error('Invalid dates calculated, using fallback');
      // Используем последние 30 дней как fallback
      this.dateTo = new Date();
      this.dateFrom = new Date();
      this.dateFrom.setDate(this.dateFrom.getDate() - 30);
      this.currentMonth = new Date(this.dateFrom);
    } else {
      this.dateFrom = min;
      this.dateTo = max;
      this.currentMonth = new Date(min);
    }

    console.log('Final date range:', { from: this.dateFrom, to: this.dateTo });

    try {
      this.buildCalendar();
    } catch (e) {
      console.error('Error building calendar:', e);
    }
  }

  buildCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay + 6) % 7; // Mon start
    this.calendarDays = [
      ...Array(offset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
    ];
  }

  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.buildCalendar();
  }

  selectDate(day: Date) {
    if (!this.calendarMode) return;
    if (this.calendarMode === 'from') {
      this.dateFrom = day;
      if (this.dateTo && day > this.dateTo) this.dateTo = null;
      this.calendarMode = 'to';
    } else {
      if (this.dateFrom && day < this.dateFrom) {
        this.dateTo = this.dateFrom;
        this.dateFrom = day;
      } else {
        this.dateTo = day;
      }
      this.calendarMode = null;
    }
  }

  isInRange(day: Date): boolean {
    if (!this.dateFrom) return false;
    const end = this.dateTo ?? this.hoverDate;
    if (!end) return false;
    return day > this.dateFrom && day < end;
  }

  isFrom(day: Date): boolean {
    return !!this.dateFrom && day.toDateString() === this.dateFrom.toDateString();
  }

  isTo(day: Date): boolean {
    return !!this.dateTo && day.toDateString() === this.dateTo.toDateString();
  }

  isDisabled(day: Date): boolean {
    return day < this.minDate || day > this.maxDate;
  }

  formatDate(d: Date | null): string {
    if (!d) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  onSubmit() {
    console.log('Submit clicked');
    console.log('dateFrom:', this.dateFrom);
    console.log('dateTo:', this.dateTo);
    console.log('form valid:', this.form.valid);

    if (!this.dateFrom || !this.dateTo) {
      console.error('Dates not selected');
      return;
    }

    if (isNaN(this.dateFrom.getTime()) || isNaN(this.dateTo.getTime())) {
      console.error('Invalid dates');
      return;
    }

    const config: SummaryWidgetConfig = {
      metric: this.form.value.metric,
      category: this.form.value.category,
      dateFrom: this.dateFrom.toISOString().split('T')[0],
      dateTo: this.dateTo.toISOString().split('T')[0],
    };

    console.log('Widget config:', config);

    const widget: WidgetItem = {
      id: Date.now(),
      type: this.selectedType === 'chart' ? 'chart' : 'summary',
      x: 0, y: 0, cols: 6, rows: 4,
      config: { ...config, chartType: this.form.value.chartType } as any
    };

    console.log('Emitting widget:', widget);
    this.widgetCreated.emit(widget);
  }
}