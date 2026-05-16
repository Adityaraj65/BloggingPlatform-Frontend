import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-box">
        <h2>Forgot Password</h2>
        <p>Enter your email address to receive a password reset link.</p>
        
        <form (ngSubmit)="onSubmit()" #forgotForm="ngForm" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" [(ngModel)]="email" required class="form-control" />
          </div>

          <button type="submit" [disabled]="!forgotForm.form.valid || loading" class="primary-btn">
            {{ loading ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </form>

        <div *ngIf="message" class="status-message success mt-3">
          {{ message }}
        </div>

        <div *ngIf="error" class="status-message error mt-3">
          {{ error }}
        </div>

        <div class="auth-links mt-3 text-center">
          <a routerLink="/login">Back to Login</a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../auth.css']
})
export class ForgotPassword {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  
  email = '';
  loading = false;
  message = '';
  error = '';

  onSubmit() {
    this.loading = true;
    this.message = '';
    this.error = '';

    this.cdr.detectChanges();

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = res || 'If an account with that email exists, a password reset link has been sent.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error || 'Failed to send reset link.';
        this.cdr.detectChanges();
      }
    });
  }
}
