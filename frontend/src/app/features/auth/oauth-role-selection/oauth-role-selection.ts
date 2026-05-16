import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-oauth-role-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './oauth-role-selection.html',
  styleUrl: './oauth-role-selection.css'
})
export class OAuthRoleSelection implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  tempToken = '';
  selectedRole = '';
  loading = false;
  error = '';

  roles = [
    {
      id: 'READER',
      name: 'Reader',
      icon: '📖',
      description: 'Read and engage with content',
      features: [
        '📖 Read all published posts',
        '💬 Comment on posts',
        '⭐ Save favorite posts',
        '🔔 Follow authors'
      ]
    },
    {
      id: 'AUTHOR',
      name: 'Author',
      icon: '✍️',
      description: 'Create and publish your content',
      features: [
        '✍️ Create and publish posts',
        '📊 Analyze post performance',
        '💬 Engage with readers',
        '🎨 Customize your profile'
      ]
    }
  ];

  ngOnInit(): void {
    // Get temporary token from URL
    this.route.queryParams.subscribe(params => {
      this.tempToken = params['tempToken'];
      
      if (!this.tempToken) {
        this.error = 'Invalid or missing token. Redirecting to signup...';
        setTimeout(() => {
          this.router.navigate(['/register']);
        }, 2000);
      }
    });
  }

  selectRole(roleId: string): void {
    if (this.loading) return;

    this.selectedRole = roleId;
    this.loading = true;
    this.error = '';

    console.log('Completing OAuth2 onboarding with role:', roleId);

    // Call backend to complete onboarding
    this.http.post(
      'http://localhost:8080/auth/oauth/complete-onboarding',
      {
        role: roleId,
        tempToken: this.tempToken
      },
      {
        responseType: 'text' as 'json'
      }
    ).subscribe({
      next: (token: any) => {
        console.log('Onboarding complete, received JWT');
        
        // Store token
        localStorage.setItem('inkwell_token', token);
        
        // Parse and store user info from token
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const user = {
            id: payload.userId || 0,
            username: payload.sub || '',
            email: payload.email || '',
            role: payload.role || roleId,
            fullName: payload.fullName || payload.sub
          };
          
          localStorage.setItem('inkwell_user_id', user.id.toString());
          localStorage.setItem('inkwell_user', JSON.stringify(user));
          
          console.log('User stored:', user);
        } catch (e) {
          console.error('Failed to parse user from token:', e);
        }
        
        // Redirect to home
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 500);
      },

      error: (err) => {
        console.error('Onboarding error:', err);
        this.loading = false;

        // Default error message
        this.error = 'Failed to complete signup. Please try again.';

        // Parse specific error messages
        if (typeof err?.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            this.error = parsed.error || parsed.message || this.error;
          } catch {
            this.error = err.error || this.error;
          }
        } else if (err?.error?.error) {
          this.error = err.error.error;
        }

        // Handle specific HTTP status codes
        if (err.status === 400) {
          this.error = 'Invalid role selection. Please try again.';
        } else if (err.status === 404) {
          this.error = 'User not found. Please sign up again.';
        } else if (err.status === 401) {
          this.error = 'Token expired. Please sign up again.';
          setTimeout(() => {
            this.router.navigate(['/register']);
          }, 2000);
        } else if (err.status === 0) {
          this.error = 'Cannot connect to server.';
        }
      }
    });
  }
}
