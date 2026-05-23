import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  constructor(public authService: AuthService, private router: Router) { }
  errorMessage: string = '';
  showLogin: boolean = true;

  // Login form
  loginEmail: string = '';
  loginPassword: string = '';

  // Register form
  registerEmail: string = '';
  registerUsername: string = '';
  registerPassword: string = '';
  confirmPassword: string = '';

  onLogin() {
    this.authService.login(this.loginEmail, this.loginPassword).subscribe(
      {
        next: (response) => { this.router.navigate(['/dashboard']) },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Invalid email or password';
          console.error('Login failed', err);
        }
      }
    )
  }

  onRegister() {
    if (this.registerPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    this.authService.register(this.registerEmail, this.registerPassword, this.registerUsername).subscribe(
      {
        next: (response) => { this.router.navigate(['/dashboard']) },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Registration failed';
          console.error('Registration failed', err);
        }
      }
    )
  }

  switch() {
    this.showLogin = !this.showLogin;
  }
}