import {
  Component,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import {
  RouterModule,
  Router
} from '@angular/router';

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
  private cdr = inject(ChangeDetectorRef);

  userData = {
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'AUTHOR'
  };

  error = '';
  loading = false;

  onSubmit(): void {

    this.error = '';

    // VALIDATION
    if (
      !this.userData.username ||
      !this.userData.email ||
      !this.userData.fullName ||
      !this.userData.password
    ) {

      this.error =
        'Please fill all required fields';

      return;
    }

    this.loading = true;

    // FORCE UI UPDATE
    this.cdr.detectChanges();

    console.log(
      'Attempting registration with:',
      this.userData
    );

    this.authService
      .register(this.userData)
      .subscribe({

        next: (response) => {

          console.log(
            'Registration successful:',
            response
          );

          this.loading = false;

          this.cdr.detectChanges();

          this.router.navigate(['/login']);
        },

        error: (err) => {

          console.error(
            'Registration error:',
            err
          );

          this.loading = false;

          // DEFAULT
          this.error =
            'Registration failed';

          // STRING JSON RESPONSE
          if (typeof err.error === 'string') {

            try {

              const parsed =
                JSON.parse(err.error);

              this.error =
                parsed.error ||
                'Registration failed';

            } catch {

              this.error = err.error;
            }
          }

          // JSON OBJECT RESPONSE
          else if (err?.error?.error) {

            this.error = err.error.error;
          }

          // VALIDATION ARRAY
          else if (
            err?.error?.errors &&
            Array.isArray(err.error.errors)
          ) {

            this.error =
              err.error.errors[0];
          }

          // STATUS FALLBACKS
          else if (err.status === 409) {

            this.error =
              'Username or email already exists.';
          }

          else if (err.status === 400) {

            this.error =
              'Invalid registration data.';
          }

          else if (err.status === 0) {

            this.error =
              'Cannot connect to server.';
          }

          else if (err.status >= 500) {

            this.error =
              'Server error occurred.';
          }

          // FORCE UI UPDATE
          this.cdr.detectChanges();
        }
      });
  }
}