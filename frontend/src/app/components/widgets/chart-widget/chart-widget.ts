import { Component, Input, OnInit, ViewChild, HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DashboardService } from '../../../core/services/dashboard.service.js';
import { SummaryWidgetConfig } from '../../../models/dashboard.model.js';

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './chart-widget.html',
  styleUrls: ['./chart-widget.scss']
})
export class ChartWidgetComponent implements OnInit {
  @Input() config: SummaryWidgetConfig | any;
  private _transactions: any[] = [];

  @Input() set transactions(value: any[]) {
  console.log('setter called, length:', value?.length);
  this._transactions = value;
  if (value && value.length > 0) {
    this.buildWhenReady();
  }
}

  private buildWhenReady() {
  if (this.chart) {
    this.buildChart();
    return;
  }
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    console.log('waiting for chart, attempt:', attempts, 'chart:', this.chart);
    if (this.chart) {
      clearInterval(interval);
      this.buildChart();
    }
    if (attempts > 20) {
      clearInterval(interval);
      console.warn('chart never initialized');
    }
  }, 50);
}

  get transactions(): any[] {
    return this._transactions;
  }

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public chartType: ChartType = 'line';
  public chartData: ChartConfiguration['data'] = { datasets: [], labels: [] };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: {
      y: { beginAtZero: true }
    }
  } as any;

  @HostListener('window:resize')
  onResize() {
    if (this.chart) {
      this.chart.update();
    }
  }

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.chartType = (this.config?.chartType as ChartType) || 'line';
  }



  buildChart() {
    console.log('=== buildChart called ===');
    console.log('config:', this.config);
    console.log('transactions passed:', this.transactions.length);

    if (!this.config) {
      console.log('Early return: no config');
      return;
    }

    const allTransactions = this.transactions;

    console.log('=== Chart Widget Debug ===');
    console.log('Total transactions:', allTransactions.length);
    if (allTransactions.length > 0) {
      console.log('First transaction:', allTransactions[0]);
      console.log('Date from first transaction:', allTransactions[0].date);
      console.log('Parsed date:', this.parseTransactionDate(allTransactions[0].date));
    }

    const from = this.parseDate(this.config.dateFrom);
    const to = this.parseDate(this.config.dateTo);

    console.log('Date range:', { from, to });

    let actualFrom = from;
    let actualTo = to;

    if (!actualFrom || !actualTo) {
      const dates = allTransactions
        .map(t => this.parseTransactionDate(t.date))
        .filter(d => !isNaN(d.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());

      if (dates.length > 0) {
        actualFrom = actualFrom || dates[0];
        actualTo = actualTo || dates[dates.length - 1];
        console.log('Auto-detected date range:', { actualFrom, actualTo });
      } else {
        console.log('No valid dates found in transactions');
        return;
      }
    }

    const days: string[] = [];
    const map = new Map<string, number>();
    for (let d = new Date(actualFrom); d <= actualTo; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      days.push(key);
      map.set(key, 0);
    }

    console.log('Generated days:', days.length);

    const filtered = allTransactions.filter((t: any) => {
      const d = this.parseTransactionDate(t.date);
      if (actualFrom && d < actualFrom) return false;
      if (actualTo && d > actualTo) return false;
      if (this.config.category && this.config.category !== 'any' && t.category !== this.config.category) return false;
      return true;
    });

    console.log('Filtered transactions:', filtered.length);
    console.log('Config metric:', this.config.metric);

    filtered.forEach((t: any) => {
      const key = this.parseTransactionDate(t.date).toISOString().split('T')[0];
      const prev = map.get(key) ?? 0;
      const tType = t.type?.toUpperCase();

      if (!this.config.metric) {
        map.set(key, prev + Math.abs(t.amount));
      } else if (this.config.metric === 'expenses' && tType === 'EXPENSE') {
        map.set(key, prev + Math.abs(t.amount));
      } else if (this.config.metric === 'income' && tType === 'INCOME') {
        map.set(key, prev + Math.abs(t.amount));
      }
    });

    console.log('Data map sample:', Array.from(map.entries()).slice(0, 5));

    this.chartData = {
      labels: days,
      datasets: [
        {
          data: days.map(d => map.get(d) ?? 0),
          backgroundColor: this.chartType === 'bar' ? 'rgba(37,99,235,0.12)' : 'transparent',
          borderColor: 'rgba(37,99,235,0.9)',
          tension: 0.3,
          fill: this.chartType !== 'bar'
        }
      ]
    };

    setTimeout(() => this.chart?.update(), 0);
  }

  parseDate(s: string | undefined | null): Date | null {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  parseTransactionDate(dateStr: string): Date {
    if (!dateStr) return new Date();

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