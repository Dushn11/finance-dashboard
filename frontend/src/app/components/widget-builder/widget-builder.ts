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
    if (!this.transactions.length) return new Date();
    return new Date(Math.min(...this.transactions.map(t => new Date(t.date).getTime())));
  }

  get maxDate(): Date {
    if (!this.transactions.length) return new Date();
    return new Date(Math.max(...this.transactions.map(t => new Date(t.date).getTime())));
  }

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      metric: ['expenses', Validators.required],
      category: ['any'],
      chartType: ['line']
    });
  }

  ngOnInit() {
    this.dateFrom = this.minDate;
    this.dateTo = this.maxDate;
    this.currentMonth = new Date(this.minDate);
    this.buildCalendar();
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
    if (!this.dateFrom || !this.dateTo) return;
    const config: SummaryWidgetConfig = {
      metric: this.form.value.metric,
      category: this.form.value.category,
      dateFrom: this.dateFrom.toISOString().split('T')[0],
      dateTo: this.dateTo.toISOString().split('T')[0],
    };
    const widget: WidgetItem = {
      id: `widget-${Date.now()}`,
      type: this.selectedType === 'chart' ? 'chart' : 'summary',
      x: 0, y: 0, cols: 6, rows: 4,
      config: { ...config, chartType: this.form.value.chartType } as any
    };
    this.widgetCreated.emit(widget);
  }
}