import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryWidgetConfig } from '../../../models/dashboard.model';

@Component({
  selector: 'app-summary-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-widget.html',
  styleUrls: ['./summary-widget.scss']
})
export class SummaryWidgetComponent implements OnInit, OnChanges {
  @Input() config: SummaryWidgetConfig | any;
  @Input() transactions: any[] = [];

  total = 0;
  count = 0;

  ngOnInit() {
    this.calculateSummary();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transactions'] || changes['config']) {
      this.calculateSummary();
    }
  }

  calculateSummary() {
    if (!this.transactions?.length) {
      this.total = 0;
      this.count = 0;
      return;
    }

    const metric = (this.config?.metric || '').toString().toLowerCase();
    const isIncome = metric === 'income';
    const isExpense = metric === 'expenses' || metric === 'expense';
    const category = this.config?.category;
    const fromDate = this.config?.dateFrom ? this.parseDate(this.config.dateFrom) : null;
    const toDate = this.config?.dateTo ? this.parseDate(this.config.dateTo) : null;

    const filtered = this.transactions.filter((t: any) => {
      if (category && category !== 'any') {
        if (t.category !== category) return false;
      }

      const tType = t.type?.toString().toUpperCase();
      if (isIncome && tType !== 'INCOME') return false;
      if (isExpense && tType !== 'EXPENSE') return false;

      if (fromDate || toDate) {
        const transactionDate = this.parseDate(t.date);
        if (fromDate && transactionDate < fromDate) return false;
        if (toDate && transactionDate > toDate) return false;
      }

      return true;
    });

    this.count = filtered.length;
    this.total = filtered.reduce((sum: number, t: any) => {
      const amount = Number(t.amount ?? 0);
      return sum + Math.abs(isNaN(amount) ? 0 : amount);
    }, 0);
  }

  parseDate(dateStr: string | Date | null | undefined): Date {
    if (!dateStr) return new Date(NaN);
    if (dateStr instanceof Date) return dateStr;

    const value = dateStr.toString().trim();
    if (!value) return new Date(NaN);

    if (value.includes('-')) {
      const parts = value.split('-');
      if (parts[0].length <= 2 && parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month - 1, day);
        }
      }
    }

    return new Date(value);
  }
}
