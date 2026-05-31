import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class ImportService {
  private apiUrl = 'http://100.92.130.10/api';

  constructor(private http: HttpClient) {}

  uploadCsv(content: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/import/csv`, content);
  }

  getTabs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dashboard/tabs`);
  }
}
