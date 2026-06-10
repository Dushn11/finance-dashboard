
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { ImportService } from '../../core/services/import.service';

@Component({
  selector: 'app-no-tab',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './no-tab.html',
  styleUrls: ['./no-tab.scss']
})
export class NoTabComponent implements OnInit {
  constructor(
    public dashboardService: DashboardService,
    private importService: ImportService
  ) {}

  ngOnInit() {
    // Загружаем табы с бэкенда при инициализации
    this.importService.getUserTabs().subscribe({
      next: (tabs) => {
        if (tabs && tabs.length > 0) {
          this.dashboardService.loadTabsFromBackend(tabs);
        }
      },
      error: (err) => {
        console.error('Failed to load user tabs:', err);
      }
    });
  }
}