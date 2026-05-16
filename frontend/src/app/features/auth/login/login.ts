import {
  Component,
  inject,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  RouterModule,
  Router,
  ActivatedRoute
} from '@angular/router';

import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {

  private authService =
    inject(AuthService);

  private router =
    inject(Router);

  private cdr =
    inject(ChangeDetectorRef);

  private route =
    inject(ActivatedRoute);

  credentials = {

    identifier: '',

    password: ''
  };

  error = '';
  message = '';

  loading = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['registered']) {
        this.message = 'Registration successful. Please verify your email before logging in.';
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {

    // RESET

    this.error = '';

    // FORCE UI UPDATE

    this.cdr.detectChanges();

    // VALIDATION

    if (
      !this.credentials.identifier?.trim() ||
      !this.credentials.password?.trim()
    ) {

      this.error =
        'Please enter username/email and password';

      this.cdr.detectChanges();

      return;
    }

    // START LOADING

    this.loading = true;

    this.cdr.detectChanges();

    console.log(
      'Attempting login...'
    );

    console.log(this.credentials);

    this.authService
      .login(this.credentials)
      .subscribe({

        // SUCCESS

        next: () => {

          console.log(
            'Login success'
          );

          this.loading = false;

          this.cdr.detectChanges();

          this.router.navigate(['/']);
        },

        // ERROR

        error: (err) => {

          console.error(
            'Login error:',
            err
          );

          // STOP LOADING

          this.loading = false;

          // DEFAULT MESSAGE

          this.error =
            'Login failed';

          // STRING ERROR

          if (
            typeof err?.error === 'string'
          ) {

            try {

              const parsed =
                JSON.parse(err.error);

              this.error =

                parsed.error ||

                parsed.message ||

                this.error;

            } catch {

              this.error =
                err.error ||
                this.error;
            }
          }

          // OBJECT ERROR

          else if (
            err?.error
          ) {

            this.error =

              err.error.error ||

              err.error.message ||

              this.error;
          }

          // STATUS FALLBACKS

          if (err.status === 401) {

            this.error =
              'Invalid password';
          }

          else if (err.status === 404) {

            this.error =
              'User account not found';
          }

          else if (err.status === 400) {

            this.error =
              'Please enter valid credentials';
          }

          else if (err.status === 0) {

            this.error =
              'Cannot connect to server';
          }

          else if (err.status >= 500) {

            this.error =
              'Server error occurred';
          }

          // FORCE UI REFRESH

          this.cdr.detectChanges();
        },

        complete: () => {

          this.loading = false;

          this.cdr.detectChanges();
        }
      });
  }

  // ================= GOOGLE OAUTH LOGIN =================

  loginWithGoogle(): void {
    // Redirect to OAuth2 authorization endpoint
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  // ================= RESEND VERIFICATION =================
  resendVerification(): void {
    this.error = '';
    this.message = '';
    this.loading = true;
    this.cdr.detectChanges();

    this.authService.resendVerification(this.credentials.identifier).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = res || 'Verification email resent successfully.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error || 'Failed to resend verification email.';
        this.cdr.detectChanges();
      }
    });
  }
}