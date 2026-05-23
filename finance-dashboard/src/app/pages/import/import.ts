import { Component } from '@angular/core';
import { ImportService } from '../../core/services/import.service.js';

@Component({
  selector: 'app-import',
  imports: [],
  standalone: true,
  templateUrl: './import.html',
  styleUrl: './import.scss',
})
export class Import {
  selectedFile: File | null = null;
  constructor(private importService: ImportService) {}

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onImport(): void {
    if (!this.selectedFile) {
      console.error('No file selected');
      return;
    }

    this.importService.uploadCsv(this.selectedFile).subscribe({
      next: (response) => {
        console.log('File uploaded successfully', response);
      },
      error: (error) => {
        console.error('Error uploading file', error);
      }
    });
  }
}
