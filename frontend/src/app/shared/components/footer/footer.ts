import {
  Component,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  CommonModule
} from '@angular/common';

import {
  NewsletterService
} from '../../../core/services/newsletter';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {

  private newsletterService =
    inject(NewsletterService);

  private cdr =
    inject(ChangeDetectorRef);

  fullName = '';

  email = '';

  isSubscribing = false;

  successMessage = '';

  errorMessage = '';

  subscribeNewsletter(): void {

    // RESET

    this.successMessage = '';

    this.errorMessage = '';

    this.cdr.detectChanges();

    // VALIDATION

    if (!this.fullName.trim()) {

      this.errorMessage =
        'Please enter full name';

      this.cdr.detectChanges();

      return;
    }

    if (
      !this.email.trim() ||
      !this.email.includes('@')
    ) {

      this.errorMessage =
        'Please enter valid email';

      this.cdr.detectChanges();

      return;
    }

    // START LOADING

    this.isSubscribing = true;

    this.cdr.detectChanges();

    const payload = {

      fullName:
        this.fullName.trim(),

      email:
        this.email.trim(),

      preferences:
        'GENERAL'
    };

    console.log(
      'NEWSLETTER PAYLOAD:',
      payload
    );

    this.newsletterService
      .subscribe(payload)
      .subscribe({

        // SUCCESS

        next: (response) => {

          console.log(
            'NEWSLETTER SUCCESS:',
            response
          );

          this.successMessage =
            'Subscription successful';

          this.errorMessage = '';

          this.fullName = '';

          this.email = '';

          this.isSubscribing = false;

          this.cdr.detectChanges();
        },

        // ERROR

        error: (err) => {

          console.error(
            'Newsletter subscription error:',
            err
          );

          this.isSubscribing = false;

          // DEFAULT

          this.errorMessage =
            'Subscription failed';

          // BACKEND ERROR

          if (
            err?.error?.error
          ) {

            this.errorMessage =
              err.error.error;
          }

          else if (
            typeof err?.error === 'string'
          ) {

            this.errorMessage =
              err.error;
          }

          else if (
            err.status === 400
          ) {

            this.errorMessage =
              'Invalid subscription data';
          }

          else if (
            err.status === 409
          ) {

            this.errorMessage =
              'Email already subscribed';
          }

          else if (
            err.status === 0
          ) {

            this.errorMessage =
              'Cannot connect to server';
          }

          this.cdr.detectChanges();
        },

        complete: () => {

          this.isSubscribing = false;

          this.cdr.detectChanges();
        }
      });
  }
}