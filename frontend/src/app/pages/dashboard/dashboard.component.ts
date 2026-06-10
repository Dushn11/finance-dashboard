import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import {  TabResponse } from '../../core/services/dashboard.service'; // Твой единственный сервис
import { ImportService } from '../../core/services/import.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { ChartService } from '../../core/services/chart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentTab: TabResponse | null = null;

  constructor(
    private importService: ImportService,    // Используем только его
    private dashboardService: DashboardService,
    private chartService: ChartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Слушаем ID вкладки из URL
    this.route.paramMap.subscribe(params => {
      const tabIdStr = params.get('id');
      if (tabIdStr && !isNaN(Number(tabIdStr))) {
        this.loadTab(Number(tabIdStr));
      }
    });
  }

  loadTab(tabId: number): void {
    // Делаем один чистый запрос на бэкенд
    this.importService.getTabById(tabId).subscribe({
      next: (data: TabResponse) => {
        this.currentTab = data;
        
        // Делаем вкладку активной в нашем State (localStorage)
        this.dashboardService.setActiveTab(tabId);

        // Говорим графикам перерисоваться, так как currentTab обновился
        this.chartService.refreshCharts();
      },
      error: (err: unknown) => {
        console.error('Не удалось загрузить вкладку по ID:', err);
      }
    });
  }
}
