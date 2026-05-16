import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-box">
        <h2>Email Verification</h2>
        
        <div *ngIf="loading" class="status-message loading">
          <p>Verifying your email, please wait...</p>
        </div>

        <div *ngIf="success" class="status-message success">
          <p>Your email has been successfully verified!</p>
          <button class="primary-btn" routerLink="/login">Go to Login</button>
        </div>

        <div *ngIf="error" class="status-message error">
          <p>{{ errorMessage }}</p>
          <button class="primary-btn" routerLink="/login">Return to Login</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../auth.css'] // assuming shared auth styles
})
export class VerifyEmail implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  
  loading = true;
  success = false;
  error = false;
  errorMessage = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.verifyToken(token);
      } else {
        this.loading = false;
        this.error = true;
        this.errorMessage = 'Verification token is missing.';
      }
    });
  }

  verifyToken(token: string) {
    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error || 'Failed to verify email. The link may have expired.';
        this.cdr.detectChanges();
      }
    });
  }
}
