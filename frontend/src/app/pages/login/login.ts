import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service.js';
import { Router } from '@angular/router';
import { usernameAvailabilityValidator, emailAvailabilityValidator } from '../../core/validators/async-validators';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage: string = '';
  showLogin: boolean = true;

  // Login form (без async validators)
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Register form с async validators
  registerForm: FormGroup = this.fb.group({
    email: ['',
      [Validators.required, Validators.email], // Sync validators
      [emailAvailabilityValidator(this.authService)] // Async validator
    ],
    username: ['',
      [Validators.required, Validators.minLength(3)],
      [usernameAvailabilityValidator(this.authService)]
    ],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  onLogin() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly';
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else if (err.status === 404) {
          this.errorMessage = 'User not found';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
        console.error('Login failed', err);
      }
    });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly';
      this.registerForm.markAllAsTouched();
      return;
    }

    const { password, confirmPassword, email, username } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.authService.register(email, password, username).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 409) {
          this.errorMessage = 'Username or email already exists';
        } else if (err.status === 400) {
          this.errorMessage = err.error?.error || 'Invalid registration data';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
        console.error('Registration failed', err);
      }
    });
  }

  switch() {
    this.showLogin = !this.showLogin;
    this.errorMessage = '';
    this.loginForm.reset();
    this.registerForm.reset();
  }

  // Вспомогательные геттеры для шаблона
  get usernameControl() {
    return this.registerForm.get('username');
  }

  get emailControl() {
    return this.registerForm.get('email');
  }

  get passwordControl() {
    return this.registerForm.get('password');
  }

  get confirmPasswordControl() {
    return this.registerForm.get('confirmPassword');
  }

  get loginEmailControl() {
    return this.loginForm.get('email');
  }

  get loginPasswordControl() {
    return this.loginForm.get('password');
  }
}