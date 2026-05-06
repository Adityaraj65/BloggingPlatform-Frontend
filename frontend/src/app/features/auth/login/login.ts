import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  credentials = {
    identifier: '',
    password: ''
  };
  
  error = '';
  loading = false;

  onSubmit() {
    this.loading = true;
    this.error = '';
    
    // Basic validation
    if (!this.credentials.identifier || !this.credentials.password) {
      this.error = 'Please enter both email/username and password';
      this.loading = false;
      return;
    }
    
    console.log('Attempting login with:', this.credentials);
    console.log('API URL:', 'http://localhost:8080/auth/login');
    
    this.performLogin();
  }

  performLogin() {
    console.log('Performing actual login...');
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = 'Request timed out. Please check your internet and try again.';
        console.error('Login request timed out');
      }
    }, 15000); // 15 second timeout
    
    this.authService.login(this.credentials).subscribe({
      next: (token) => {
        clearTimeout(timeoutId);
        this.loading = false;
        console.log('Login successful');
        // Wait a moment for auth state to update before navigating
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 300);
      },
      error: (err) => {
        clearTimeout(timeoutId);
        this.loading = false;
        console.error('Login error:', err);
        
        let errorMessage = 'Login failed. Please try again.';
        
        // Extract error message from backend response
        if (err.error && typeof err.error === 'object') {
          errorMessage = err.error.error || err.error.message || errorMessage;
        } else if (err.error && typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            errorMessage = parsed.error || parsed.message || errorMessage;
          } catch (e) {
            errorMessage = err.error;
          }
        }
        
        // Provide user-friendly messages based on HTTP status
        if (err.status === 401) {
          this.error = errorMessage.includes('Invalid') ? errorMessage : 'Invalid email/username or password';
        } else if (err.status === 404) {
          this.error = 'User account not found. Please check your credentials.';
        } else if (err.status === 400) {
          this.error = errorMessage || 'Please enter both email/username and password.';
        } else if (err.status === 0) {
          this.error = 'Cannot connect to the server. Check your internet connection.';
        } else if (err.status === 403) {
          this.error = 'Access denied. Please contact support if this persists.';
        } else if (err.status >= 500) {
          this.error = 'Server error. Please try again later.';
        } else if (err.status === 409) {
          this.error = 'Account conflict. Please contact support.';
        } else if (err.status > 0) {
          this.error = errorMessage || `Login error (${err.status}). Please try again.`;
        } else {
          this.error = errorMessage;
        }
      },
      complete: () => {
        clearTimeout(timeoutId);
      }
    });
  }
}
