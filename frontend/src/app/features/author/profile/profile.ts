import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  RouterModule
} from '@angular/router';

import {
  HttpClient
} from '@angular/common/http';

import {
  AuthService,
  UserResponse
} from '../../../core/services/auth';

import {
  PostService,
  PostResponseDTO
} from '../../../core/services/post';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  private authService =
    inject(AuthService);

  private postService =
    inject(PostService);

  private http =
    inject(HttpClient);

  user:
    UserResponse | null = null;

  posts:
    PostResponseDTO[] = [];

  editMode = false;

  loading = false;

  error = '';

  success = '';

  editData = {

    fullName: '',

    email: '',

    password: ''
  };

  ngOnInit(): void {

    this.authService.currentUser$
      .subscribe({

        next: (user) => {

          this.user = user;

          if (user) {

            this.editData.fullName =
              user.fullName || '';

            this.editData.email =
              user.email || '';

            this.loadPosts(
              user.id
            );
          }
        }
      });
  }

  // ================= POSTS =================

  loadPosts(
    userId: number
  ): void {

    this.postService
      .getPostsByAuthor(userId)
      .subscribe({

        next: (posts) => {

          this.posts = posts;
        },

        error: (err) => {

          console.error(err);
        }
      });
  }

  // ================= EDIT =================

  toggleEditMode(): void {

    this.editMode =
      !this.editMode;

    this.error = '';

    this.success = '';
  }

  // ================= UPDATE =================

  onSubmit(): void {

    if (!this.user) {

      return;
    }

    this.loading = true;

    const payload: any = {

      fullName:
        this.editData.fullName,

      email:
        this.editData.email
    };

    if (
      this.editData.password.trim()
    ) {

      payload.password =
        this.editData.password;
    }

    this.http.put<UserResponse>(

      `http://localhost:8080/auth/profile/${this.user.id}`,

      payload

    ).subscribe({

      next: (updatedUser) => {

        this.user = updatedUser;

        this.success =
          'Profile updated successfully';

        this.loading = false;

        this.editMode = false;
      },

      error: (err) => {

        console.error(err);

        this.error =
          'Failed to update profile';

        this.loading = false;
      }
    });
  }

  // ================= STATS =================

  get totalViews(): number {

    return this.posts.reduce(

      (sum, post) =>

        sum + post.viewCount,

      0
    );
  }

  get totalLikes(): number {

    return this.posts.reduce(

      (sum, post) =>

        sum + post.likesCount,

      0
    );
  }

  get publishedPosts(): number {

    return this.posts.filter(

      p => p.status === 'PUBLISHED'

    ).length;
  }
}