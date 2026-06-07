import { Injectable, inject,PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  currentUser = signal<User | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.currentUser.set(JSON.parse(storedUser));
      }
    }
  }
  login(email: string, password: string) {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password }).pipe(
      tap((response: AuthResponse) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token)
          localStorage.setItem('user', JSON.stringify(response.user))
          this.currentUser.set(response.user);
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }
  register(email: string, password: string, username: string) {
    return this.http.post<AuthResponse>('/api/auth/register', { username, password, email }).pipe(
      tap((response: AuthResponse) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token)
          localStorage.setItem('user', JSON.stringify(response.user))
          this.currentUser.set(response.user);
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.currentUser.set(null);
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

  checkUsernameAvailability(username: string) {
    return this.http.get<{ available: boolean }>(
      `/api/auth/search?username=${username}`
    );
  }

  checkEmailAvailability(email: string) {
    return this.http.get<{ available: boolean }>(
      `/api/auth/search?email=${email}`
    );
  }
}