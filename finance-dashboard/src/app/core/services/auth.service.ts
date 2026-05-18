import { Injectable, inject,PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private platformId = inject(PLATFORM_ID);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  login(username: string, password: string) {
    return this.http.post<{ token: string }>('http://localhost:8080/api/auth/login', { username, password }).pipe(
      tap((response: { token: string }) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token)
        }
      })
    );
  }
  register(username: string, password: string) {
    return this.http.post<{ token: string }>('http://localhost:8080/api/auth/register', { username, password }).pipe(
      tap((response: { token: string }) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token)
        }
      })
    );
  }
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token')
    }
    this.router.navigate(['/login'])
  }
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId))
  {
      return localStorage.getItem('token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}