import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap, first } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export function emailAvailabilityValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null); // Если поле пустое, не проверяем
    }
    return of(control.value).pipe(
      debounceTime(500), // Добавляем задержку для оптимизации запросов
      distinctUntilChanged(), // Проверяем только при изменении значения
      switchMap(email => authService.checkEmailAvailability(email)),
      map(response => response.available ? null : { emailTaken: true }),
      catchError(error => {console.error('Email check failed', error); return of(null); }),
      first()); // Завершаем поток после первого значения
  }
}

export function usernameAvailabilityValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null); // Если поле пустое, не проверяем
    }
    return of(control.value).pipe(
      debounceTime(500), // Добавляем задержку для оптимизации запросов
      distinctUntilChanged(), // Проверяем только при изменении значения
      switchMap(username => authService.checkUsernameAvailability(username)),
      map(response => response.available ? null : { usernameTaken: true }),
      catchError(error => {console.error('Username check failed', error); return of(null); }),
      first()); // Завершаем поток после первого значения
  }
}