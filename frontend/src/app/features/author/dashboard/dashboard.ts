import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService, PostResponseDTO } from '../../../core/services/post';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private postService = inject(PostService);
  private authService = inject(AuthService);

  posts: PostResponseDTO[] = [];
  loading = false;
  error = '';
  currentUser: any = null;

  get stats() {
    return this.getStats();
  }

  ngOnInit() {
    this.loadUserData();
    this.loadPosts();
  }

  loadUserData() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadPosts() {
    if (!this.currentUser) return;
    
    this.loading = true;
    this.postService.getPostsByAuthor(this.currentUser.id).subscribe({
      next: (posts: PostResponseDTO[]) => {
        this.posts = posts;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load posts';
        console.error('Load posts error:', err);
        this.loading = false;
      }
    });
  }

  getStats() {
    const totalViews = this.posts.reduce((sum, post) => sum + post.viewCount, 0);
    const totalLikes = this.posts.reduce((sum, post) => sum + post.likesCount, 0);
    const publishedCount = this.posts.filter(post => post.status === 'PUBLISHED').length;
    const draftCount = this.posts.filter(post => post.status === 'DRAFT').length;

    return [
      { label: 'Total Posts', value: this.posts.length.toString(), icon: 'file-text' },
      { label: 'Published', value: publishedCount.toString(), icon: 'check-circle' },
      { label: 'Total Views', value: totalViews.toString(), icon: 'eye' },
      { label: 'Total Likes', value: totalLikes.toString(), icon: 'heart' }
    ];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PUBLISHED': return 'bg-success/10 text-success';
      case 'DRAFT': return 'bg-warning/10 text-warning';
      case 'ARCHIVED': return 'bg-muted text-muted';
      default: return 'bg-muted text-muted';
    }
  }
}
