import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService, PostResponseDTO } from '../../../core/services/post';
import { AuthService } from '../../../core/services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './post-editor.html',
  styleUrl: './post-editor.css',
})
export class PostEditor implements OnInit {
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);

  postId: string | null = null;
  isEditMode = false;
  categories: any[] = [];
  
  post = {
    title: '',
    content: '',
    excerpt: '',
    featuredImageUrl: '',
    categoryId: null as number | null
  };
  
  loading = false;
  saving = false;
  uploadingImage = false;
  error = '';

  ngOnInit() {
    this.postId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.postId;
    
    // Set default categories for now
    this.categories = [
      { id: 1, name: 'Technology' },
      { id: 2, name: 'Business' },
      { id: 3, name: 'Lifestyle' }
    ];

    if (this.isEditMode && this.postId) {
      this.loadPost();
    }
  }

  loadPost() {
    if (!this.postId) return;
    
    this.loading = true;
    this.postService.getPostById(Number(this.postId)).subscribe({
      next: (post) => {
        this.post.title = post.title;
        this.post.content = post.content;
        this.post.excerpt = post.excerpt;
        this.post.featuredImageUrl = post.featuredImageUrl;
        this.post.categoryId = post.categoryId;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load post';
        this.loading = false;
      }
    });
  }

  async onSubmit() {
    if (!this.validateForm()) return;
    
    this.saving = true;
    this.error = '';
    
    try {
      const currentUser = await this.authService.currentUser$.toPromise();
      if (!currentUser) {
        this.error = 'You must be logged in to create posts';
        this.saving = false;
        return;
      }

      const postData = {
        title: this.post.title,
        content: this.post.content,
        excerpt: this.post.excerpt || '',
        featuredImageUrl: this.post.featuredImageUrl || '',
        categoryId: this.post.categoryId || 1,
        authorId: currentUser.id,
        slug: this.generateSlug(this.post.title),
        status: 'DRAFT'
      };

      console.log('Submitting post data:', postData);

      if (this.isEditMode && this.postId) {
        // Update existing post
        this.postService.updatePost(Number(this.postId), postData).subscribe({
          next: (response: PostResponseDTO) => {
            console.log('Post updated successfully:', response);
            this.saving = false;
            alert('Post updated successfully!');
            this.router.navigate(['/author/dashboard']);
          },
          error: (err: any) => {
            console.error('Update post error:', err);
            let errorMsg = 'Failed to update post. Please try again.';
            if (err.error && err.error.error) {
              errorMsg = err.error.error;
            } else if (err.status === 401) {
              errorMsg = 'You must be logged in to update posts';
            } else if (err.status === 403) {
              errorMsg = 'You do not have permission to update this post';
            } else if (err.status === 404) {
              errorMsg = 'Post not found';
            }
            this.error = errorMsg;
            this.saving = false;
          }
        });
      } else {
        // Create new post
        this.postService.createPost(postData).subscribe({
          next: (response: PostResponseDTO) => {
            console.log('Post created successfully:', response);
            this.saving = false;
            alert('Post created successfully!');
            this.router.navigate(['/author/dashboard']);
          },
          error: (err: any) => {
            console.error('Create post error:', err);
            let errorMsg = 'Failed to create post. Please try again.';
            if (err.error && err.error.error) {
              errorMsg = err.error.error;
            } else if (err.status === 401) {
              errorMsg = 'You must be logged in to create posts';
            } else if (err.status === 400) {
              errorMsg = 'Invalid post data. Please check all required fields.';
            } else if (err.status === 0) {
              errorMsg = 'Cannot connect to server. Please check your connection.';
            }
            this.error = errorMsg;
            this.saving = false;
          }
        });
      }
    } catch (err) {
      this.error = 'An unexpected error occurred';
      console.error('Submit error:', err);
      this.saving = false;
    }
  }

  validateForm(): boolean {
    if (!this.post.title.trim()) {
      this.error = 'Title is required';
      return false;
    }
    
    if (!this.post.content.trim()) {
      this.error = 'Content is required';
      return false;
    }
    
    if (this.post.content.length < 50) {
      this.error = 'Content must be at least 50 characters';
      return false;
    }
    
    return true;
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async onImageUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.uploadingImage = true;
    this.error = '';

    // For now, just use a placeholder URL
    setTimeout(() => {
      this.post.featuredImageUrl = 'https://via.placeholder.com/600x400';
      this.uploadingImage = false;
    }, 1000);
  }

  get currentUser() {
    return this.authService.currentUser$;
  }
}
