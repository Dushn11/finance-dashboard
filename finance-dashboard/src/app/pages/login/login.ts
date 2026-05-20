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
  username: string = '';
  password: string = '';
  email: string = '';
  confirmPassword: string = '';
  onLogin() {
    this.authService.login(this.username, this.password).subscribe(
      {
        next: (response) => { this.router.navigate(['/dashboard']) },
        error: (error) => { console.error('Login failed', error) }
      }
    )
  }
    onRegister() {
    if (this.password !== this.confirmPassword) {
      console.error('Passwords do not match');
      return;
    }
    this.authService.register(this.username, this.password, this.email).subscribe(
      {
        next: (response) => { this.router.navigate(['/dashboard']) },
        error: (error) => { console.error('Registration failed', error) }
      }
    )
  }
}