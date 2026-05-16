import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-oauth-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="oauth-processing">
      <div class="oauth-spinner"></div>
      <h2>Completing OAuth Login...</h2>
      <p>{{ status }}</p>
    </div>
  `,
  styles: [`
    .oauth-processing {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: 
        radial-gradient(circle at top left,
          rgba(168, 85, 247, 0.18),
          transparent 30%),
        radial-gradient(circle at bottom right,
          rgba(236, 72, 153, 0.18),
          transparent 30%),
        #050b1f;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    h2 {
      margin-top: 2rem;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    p {
      color: #9ca3af;
      font-size: 0.95rem;
    }

    .oauth-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top: 3px solid #8b5cf6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class OAuthSuccess implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  status = 'Please wait...';

  ngOnInit(): void {
    // Get token from URL query parameters
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const isNewUser = params['isNewUser'] === 'true';

      if (token) {
        // Check if this is a new user
        if (isNewUser) {
          // New user should not reach this page - they should have been redirected to role selection
          // This is a fallback redirect to role selection
          console.log('New user detected, redirecting to role selection');
          this.router.navigate(['/oauth-role-selection'], {
            queryParams: { tempToken: token }
          });
        } else {
          // Existing user: proceed with login
          // Store token
          localStorage.setItem('inkwell_token', token);
          
          // Set user from token
          this.authService.setUserFromToken(token);
          
          this.status = 'Login successful! Redirecting...';
          
          // Small delay to show success message
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000);
        }
      } else {
        this.status = 'OAuth login failed. No token received.';
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    });
  }
}
