import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PostService, Post } from '../../../core/services/post';
import { Comment, CommentResponseDTO } from '../../../core/services/comment';
import { AuthService } from '../../../core/services/auth';
import { Observable, switchMap, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css'
})
export class PostDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private commentService = inject(Comment);
  public authService = inject(AuthService);
  
  post$!: Observable<Post | undefined>;
  comments: CommentResponseDTO[] = [];
  newCommentContent = '';
  isSubmittingComment = false;
  currentPostId: number | null = null;
  
  ngOnInit(): void {
    this.post$ = this.route.paramMap.pipe(
      switchMap(params => {
        const slug = params.get('slug') || '';
        return this.postService.getPostBySlug(slug).pipe(
          tap(post => {
            if (post && post.postId) {
              this.currentPostId = post.postId;
              this.loadComments(post.postId);
            }
          })
        );
      })
    );
  }

  loadComments(postId: number) {
    this.commentService.getCommentsByPost(postId).subscribe({
      next: (comments) => this.comments = comments,
      error: (err) => console.error('Failed to load comments', err)
    });
  }

  submitComment() {
    if (!this.newCommentContent.trim() || !this.currentPostId) return;

    const user = JSON.parse(localStorage.getItem('inkwell_user_id') || '0');
    if (!user) return; // ensure logged in

    this.isSubmittingComment = true;
    this.commentService.addComment({
      postId: this.currentPostId,
      userId: user,
      content: this.newCommentContent
    }).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.newCommentContent = '';
        this.isSubmittingComment = false;
      },
      error: (err) => {
        console.error('Failed to submit comment', err);
        this.isSubmittingComment = false;
      }
    });
  }
}
