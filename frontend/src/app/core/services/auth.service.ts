import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { DashboardService } from './dashboard.service';

export interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
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

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  public currentUser = signal<User | null>(null);

  private loadingSubject = new BehaviorSubject<boolean>(true);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private dashboardService: DashboardService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');

      if (token && userJson) {
        this.fetchCurrentUser();
      } else {
        this.loadingSubject.next(false);
      }
    } else {
      this.loadingSubject.next(false);
    }
  }

  /** Возвращает токен из localStorage для интерцептора. */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  /** Вход пользователя: сохраняет токен и данные пользователя. */
  login(email: string, password: string) {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password }).pipe(
      tap((response: AuthResponse) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          this.currentUser.set(response.user);
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }

  /** Регистрация пользователя: сохраняет токен и данные пользователя. */
  register(email: string, password: string, username: string) {
    return this.http.post<AuthResponse>('/api/auth/register', { username, password, email }).pipe(
      tap((response: AuthResponse) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          this.currentUser.set(response.user);
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }

  /** Выход: очищает токен, данные пользователя и состояние dashboard. */
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      // Полностью очищаем localStorage
      localStorage.clear();

      this.currentUserSubject.next(null);
      this.currentUser.set(null);
    }

    // Сбрасываем состояние DashboardService
    this.dashboardService.clearState();

    this.loadingSubject.next(false);
    this.router.navigate(['/login']);
  }

  /** Проверка, авторизован ли пользователь. */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** Восстанавливает пользователя из localStorage.
   *  Если бэкенд не поддерживает /api/auth/me, используем локальное хранилище.
   */
  private fetchCurrentUser(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loadingSubject.next(false);
      return;
    }

    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        this.currentUserSubject.next(user);
        this.currentUser.set(user);
      } catch {
        this.currentUserSubject.next(null);
        this.currentUser.set(null);
      }
    }

    this.loadingSubject.next(false);
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
