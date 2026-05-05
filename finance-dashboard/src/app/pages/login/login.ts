import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  username: string = '';
  password: string = '';
  onLogin() {
    // Implement login logic here
    console.log('Username:', this.username);
    console.log('Password:', this.password);
  }
}
