import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
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