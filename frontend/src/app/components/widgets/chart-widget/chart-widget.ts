import { Component, Input, OnInit, ViewChild, HostListener } from '@angular/core'; // Добавили ViewChild и HostListener
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

  // Получаем доступ к инстансу ng2-charts
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public chartType: ChartType = 'line';
  public chartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false, // Это критически важно!
    plugins: { legend: { display: true } },
    scales: {
      y: { beginAtZero: true }
    }
  } as any;

  // Слушаем изменение размеров. Когда gridster меняет размер, 
  // если у него включен resize Debounce/Event, или вызовется window.resize — график перерисуется.
  @HostListener('window:resize')
  onResize() {
    if (this.chart) {
      this.chart.update(); // Принудительно заставляем Chart.js пересчитать высоту canvas
    }
  }

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.chartType = (this.config?.chartType as ChartType) || 'line';
    this.buildChart();
  }

  buildChart() {
    const tab = this.dashboardService.activeTab;
    if (!tab || !this.config) return;
    const from = this.parseDate(this.config.dateFrom);
    const to = this.parseDate(this.config.dateTo);
    
    const days: string[] = [];
    const map = new Map<string, number>();
    for (let d = new Date(from!); d <= to!; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      days.push(key);
      map.set(key, 0);
    }
    const filtered = tab.transactions.filter((t: any) => {
      const d = new Date(t.date);
      if (from && d < from) return false;
      if (to && d > to) return false;
      if (this.config.category && this.config.category !== 'any' && t.category !== this.config.category) return false;
      return true;
    });
    filtered.forEach((t: any) => {
      const key = new Date(t.date).toISOString().split('T')[0];
      const prev = map.get(key) ?? 0;
      if (this.config.metric === 'expenses' && t.type === 'expense') map.set(key, prev + Math.abs(t.amount));
      if (this.config.metric === 'income' && t.type === 'income') map.set(key, prev + Math.abs(t.amount));
    });

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

    // Если данные перестроились, триггерим обновление холста
    setTimeout(() => this.chart?.update(), 0);
  }

  parseDate(s: string | undefined | null): Date | null {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
}
