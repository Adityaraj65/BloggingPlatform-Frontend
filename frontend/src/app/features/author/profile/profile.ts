import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService, UserResponse } from '../../../core/services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  user: UserResponse | null = null;
  
  editMode = false;
  loading = false;
  error = '';
  success = '';

  editData = {
    fullName: '',
    email: '',
    password: ''
  };

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.editData.fullName = user.fullName || '';
        this.editData.email = user.email || '';
        this.editData.password = ''; // Don't populate password
      }
    });
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    this.error = '';
    this.success = '';
    if (!this.editMode && this.user) {
      // Reset data if canceled
      this.editData.fullName = this.user.fullName || '';
      this.editData.email = this.user.email || '';
      this.editData.password = '';
    }
  }

  onSubmit() {
    if (!this.user) return;
    
    this.loading = true;
    this.error = '';
    this.success = '';

    const payload: any = {};
    if (this.editData.fullName !== this.user.fullName) payload.fullName = this.editData.fullName;
    if (this.editData.email !== this.user.email) payload.email = this.editData.email;
    if (this.editData.password) payload.password = this.editData.password;

    if (Object.keys(payload).length === 0) {
      this.loading = false;
      this.toggleEditMode();
      return;
    }

    this.http.put<UserResponse>(`http://localhost:8080/auth/profile/${this.user.id}`, payload)
      .subscribe({
        next: (updatedUser) => {
          this.loading = false;
          this.success = 'Profile updated successfully!';
          this.editMode = false;
          // In a real app we'd update the auth state, here we can just update the local user
          this.user = updatedUser;
          // Keep password field empty
          this.editData.password = '';
        },
        error: (err) => {
          this.loading = false;
          let errorMessage = 'Failed to update profile.';
          if (err.error) {
              if (typeof err.error === 'string') {
                  try {
                      const parsed = JSON.parse(err.error);
                      errorMessage = parsed.error || parsed.message || err.error;
                  } catch(e) {}
              } else {
                  errorMessage = err.error.error || err.error.message || errorMessage;
              }
          }
          this.error = errorMessage;
        }
      });
  }
}
