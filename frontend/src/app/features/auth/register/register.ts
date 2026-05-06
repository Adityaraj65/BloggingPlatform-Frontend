import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  userData = {
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'AUTHOR'
  };
  
  error = '';
  loading = false;

  onSubmit() {
    this.loading = true;
    this.error = '';
    
    console.log('Attempting registration with:', this.userData);
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = 'Registration request timed out. Please try again.';
        console.error('Registration request timed out');
      }
    }, 10000); // 10 second timeout
    
    this.authService.register(this.userData).subscribe({
      next: (response) => {
        clearTimeout(timeoutId);
        console.log('Registration successful:', response);
        this.loading = false;
        // Auto login or redirect to login
        this.router.navigate(['/login']);
      },
      error: (err) => {
        clearTimeout(timeoutId);
        this.loading = false;
        console.error('Registration error:', err);
        
        let errorMessage = 'Registration failed. Please try again.';
        
        // Extract error message from backend response
        if (err.error && typeof err.error === 'object') {
          errorMessage = err.error.error || err.error.message || errorMessage;
          // If validation errors exist, show the first one
          if (err.error.errors && Array.isArray(err.error.errors) && err.error.errors.length > 0) {
            errorMessage = err.error.errors[0];
          }
        } else if (err.error && typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            errorMessage = parsed.error || parsed.message || errorMessage;
          } catch (e) {
            errorMessage = err.error;
          }
        }

        // User-friendly error messages based on status
        if (err.status === 400) {
          this.error = errorMessage || 'Invalid registration data. Please check your input.';
        } else if (err.status === 409) {
          this.error = 'Email or username already registered. Please use different credentials.';
        } else if (err.status === 0) {
          this.error = 'Cannot reach the server. Check your internet connection.';
        } else if (err.status === 403) {
          this.error = 'Registration is not allowed at this time.';
        } else if (err.status >= 500) {
          this.error = 'Server error. Please try again later.';
        } else if (err.status > 0) {
          this.error = errorMessage || `Registration error (${err.status}). Please try again.`;
        } else {
          this.error = errorMessage;
        }
      },
      complete: () => {
        clearTimeout(timeoutId);
        console.log('Registration request completed');
      }
    });
  }
}
