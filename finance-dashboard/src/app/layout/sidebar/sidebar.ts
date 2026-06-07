import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule } from "@angular/common";
import { DashboardService } from "../../core/services/dashboard.service";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  constructor(public authService: AuthService, public dashboardService: DashboardService) {}
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private body = this.document.body;
  isDark: boolean = false;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isDark = localStorage.getItem('theme') === 'dark';
    }
  }

  switchTheme() {
    if (isPlatformBrowser(this.platformId)) {
      this.isDark = !this.isDark;
      this.body.classList.toggle('dark');
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    }
  }
}
