import { Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/core';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private document = inject(DOCUMENT);
  switchTheme() {
    this.document.body.classList.toggle('dark'); 
    console.log(this.document.body.classList);
  }
}
