import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewsletterService } from '../../../core/services/newsletter';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  private newsletterService = inject(NewsletterService);
  
  email = '';
  isSubscribing = false;
  successMessage = '';
  errorMessage = '';

  subscribeNewsletter() {
    if (!this.email || !this.email.includes('@')) {
      this.errorMessage = 'Please enter a valid email address';
      this.successMessage = '';
      return;
    }

    this.isSubscribing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.newsletterService.subscribe({ email: this.email }).subscribe({
      next: (response) => {
        console.log('Newsletter subscription successful:', response);
        this.successMessage = 'Thanks for subscribing! Check your email to confirm.';
        this.email = '';
        this.isSubscribing = false;
        // Clear success message after 5 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (err) => {
        console.error('Newsletter subscription error:', err);
        
        let errorMsg = 'Subscription failed. Please try again.';
        if (err.status === 409) {
          errorMsg = 'This email is already subscribed.';
        } else if (err.status === 400) {
          errorMsg = 'Invalid email format.';
        } else if (err.status === 0) {
          errorMsg = 'Cannot connect to server. Please check your connection.';
        } else if (err.error && err.error.error) {
          errorMsg = err.error.error;
        }
        
        this.errorMessage = errorMsg;
        this.isSubscribing = false;
      }
    });
  }
}
