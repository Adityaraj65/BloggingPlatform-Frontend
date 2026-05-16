import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-box">
        <h2>Reset Password</h2>
        
        <div *ngIf="invalidToken" class="status-message error">
          <p>Invalid or missing token.</p>
          <a routerLink="/forgot-password">Request a new reset link</a>
        </div>

        <form *ngIf="!invalidToken && !success" (ngSubmit)="onSubmit()" #resetForm="ngForm" class="auth-form">
          <div class="form-group">
            <label for="password">New Password</label>
            <input type="password" id="password" name="password" [(ngModel)]="newPassword" required minlength="6" class="form-control" />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" [(ngModel)]="confirmPassword" required class="form-control" />
            <div *ngIf="newPassword !== confirmPassword && confirmPassword" class="text-danger small mt-1">Passwords do not match.</div>
          </div>

          <button type="submit" [disabled]="!resetForm.form.valid || loading || newPassword !== confirmPassword" class="primary-btn">
            {{ loading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>

        <div *ngIf="success" class="status-message success mt-3">
          <p>Your password has been successfully reset.</p>
          <button class="primary-btn mt-2" routerLink="/login">Go to Login</button>
        </div>

        <div *ngIf="error" class="status-message error mt-3">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../auth.css']
})
export class ResetPassword implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  
  token = '';
  newPassword = '';
  confirmPassword = '';
  
  loading = false;
  success = false;
  error = '';
  invalidToken = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.invalidToken = true;
      }
    });
  }

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      return;
    }
    
    this.loading = true;
    this.error = '';

    this.cdr.detectChanges();

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error || 'Failed to reset password. The token may have expired.';
        this.cdr.detectChanges();
      }
    });
  }
}
