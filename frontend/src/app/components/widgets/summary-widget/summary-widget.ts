import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryWidgetConfig } from '../../../models/dashboard.model';

@Component({
  selector: 'app-summary-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-widget.html',
  styleUrls: ['./summary-widget.scss']
})
export class SummaryWidgetComponent implements OnInit {
  @Input() config: SummaryWidgetConfig | any;
  @Input() transactions: any[] = [];

  total = 0;
  count = 0;

  ngOnInit() {
    this.calculateSummary();
  }

  calculateSummary() {
    if (!this.config || !this.transactions.length) {
      this.total = 0;
      this.count = 0;
      return;
    }

    const filtered = this.transactions.filter((t: any) => {
      // Фильтр по категории
      if (this.config.category && this.config.category !== 'any') {
        if (t.category !== this.config.category) return false;
      }

      // Фильтр по типу (metric)
      const tType = t.type?.toUpperCase();
      if (this.config.metric === 'income' && tType !== 'INCOME') return false;
      if (this.config.metric === 'expenses' && tType !== 'EXPENSE') return false;

      // Фильтр по датам
      if (this.config.dateFrom || this.config.dateTo) {
        const transactionDate = this.parseDate(t.date);
        if (this.config.dateFrom) {
          const from = new Date(this.config.dateFrom);
          if (transactionDate < from) return false;
        }
        if (this.config.dateTo) {
          const to = new Date(this.config.dateTo);
          if (transactionDate > to) return false;
        }
      }

      return true;
    });

    this.count = filtered.length;
    this.total = filtered.reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);
  }

  parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();

    // Формат DD-MM-YYYY
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
}
