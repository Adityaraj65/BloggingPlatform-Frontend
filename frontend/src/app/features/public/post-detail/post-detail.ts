import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  RouterModule
} from '@angular/router';

import {
  FormsModule
} from '@angular/forms';

import {
  switchMap
} from 'rxjs';

import {
  PostService,
  Post
} from '../../../core/services/post';

import {
  Category,
  CategoryDTO
} from '../../../core/services/category';

import {
  Comment,
  CommentResponseDTO
} from '../../../core/services/comment';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css'
})
export class PostDetail
implements OnInit {

  private route =
    inject(ActivatedRoute);

  private postService =
    inject(PostService);

  private commentService =
    inject(Comment);

  private categoryService =
    inject(Category);

  private cdr =
    inject(ChangeDetectorRef);

  // ================= DATA =================

  post: Post | null = null;

  comments:
    CommentResponseDTO[] = [];

  categories:
    CategoryDTO[] = [];

  currentPostId:
    number | null = null;

  currentUserId:
    number | null = null;

  currentUserRole = 'GUEST';

  // ================= UI =================

  loading = true;

  error = '';

  commentError = '';

  isSubmittingComment = false;

  newCommentContent = '';

  replyInputs: {
    [commentId: number]: string;
  } = {};

  showReplyBox: {
    [commentId: number]: boolean;
  } = {};

  likedPostIds =
    new Set<number>();

  likedCommentIds =
    new Set<number>();

  readonly fallbackPostImage =
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643';

  readonly fallbackAvatarBase =
    'https://ui-avatars.com/api/?background=1e293b&color=ffffff&name=';

  // ================= INIT =================

  ngOnInit(): void {

    const currentUser =
      this.getCurrentUser();

    this.currentUserId =
      currentUser?.id || null;

    this.currentUserRole =
      currentUser?.role || 'GUEST';

    this.loadLikedPosts();

    this.loadLikedComments();

    this.loadCategories();

    this.loadPost();
  }

  // ================= LOAD POST =================

  loadPost(): void {

    this.loading = true;

    this.error = '';

    this.route.paramMap.pipe(

      switchMap((params) => {

        const slug =
          params.get('slug') || '';

        return this.postService
          .getPostBySlug(slug);
      })

    ).subscribe({

      next: (post) => {

        this.post = {
          ...post
        };

        this.currentPostId =
          post.postId;

        this.loadComments(
          post.postId
        );

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err: any) => {

        console.error(
          'POST DETAIL ERROR:',
          err
        );

        this.error =
          'Failed to load post';

        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }

  // ================= LOAD COMMENTS =================

  loadComments(
    postId: number
  ): void {

    this.commentService
      .getCommentsByPost(postId)
      .subscribe({

        next: (comments) => {

          this.comments =
            this.visibleComments(
              [...(comments || [])]
            );

          this.comments.forEach(comment =>
            this.loadRepliesRecursive(comment)
          );

          this.cdr.detectChanges();
        },

        error: (err: any) => {

          console.error(
            'COMMENTS ERROR:',
            err
          );
        }
      });
  }

  // ================= LOAD CATEGORIES =================

  loadCategories(): void {

    this.categoryService
      .getAllCategories()
      .subscribe({

        next: (categories) => {

          this.categories =
            [...(categories || [])];

          this.cdr.detectChanges();
        },

        error: (err: any) => {

          console.error(
            'CATEGORY LOAD ERROR:',
            err
          );
        }
      });
  }

  // ================= CURRENT USER =================

  getCurrentUser() {

    const token =
      localStorage.getItem(
        'inkwell_token'
      );

    if (!token) {
      return null;
    }

    try {

      const payload =
        JSON.parse(
          atob(token.split('.')[1])
        );

      return {

        id:
          payload.userId || 0,

        username:
          payload.sub || '',

        fullName:
          payload.fullName ||
          payload.sub,

        role:
          payload.role || 'READER'
      };

    } catch (e) {

      console.error(
        'JWT parse failed',
        e
      );

      return null;
    }
  }

  // ================= SUBMIT COMMENT =================

  submitComment(): void {

    this.commentError = '';

    if (
      !this.newCommentContent.trim()
    ) {

      this.commentError =
        'Comment cannot be empty';

      return;
    }

    if (!this.currentPostId) {

      this.commentError =
        'Invalid post';

      return;
    }

    const currentUser =
      this.getCurrentUser();

    if (!currentUser) {

      this.commentError =
        'Please login first';

      return;
    }

    this.isSubmittingComment =
      true;

    this.commentService.addComment({

      postId:
        this.currentPostId,

      authorId:
        currentUser.id,

      authorName:
        currentUser.fullName,

      authorUsername:
        currentUser.username,

      authorAvatar:
        `https://ui-avatars.com/api/?name=${currentUser.fullName}`,

      content:
        this.newCommentContent

    }).subscribe({

      next: (comment) => {

        comment.replies = [];

        this.comments = [
          comment,
          ...this.comments
        ];

        this.newCommentContent =
          '';

        this.isSubmittingComment =
          false;

        if (this.post) {

          this.post.commentCount =
            (this.post.commentCount || 0) + 1;
        }

        this.cdr.detectChanges();
      },

      error: (err: any) => {

        console.error(
          'COMMENT SUBMIT ERROR:',
          err
        );

        console.error(
          'BACKEND ERROR:',
          err?.error
        );

        this.commentError =
          err?.error?.error ||
          'Failed to submit comment';

        this.isSubmittingComment =
          false;

        this.cdr.detectChanges();
      }
    });
  }

  // ================= TOGGLE REPLY =================

  toggleReplyBox(
    commentId: number
  ): void {

    this.showReplyBox[
      commentId
    ] = !this.showReplyBox[
      commentId
    ];
  }

  // ================= SUBMIT REPLY =================

  submitReply(
    parentComment:
    CommentResponseDTO
  ): void {

    const content =
      this.replyInputs[
        parentComment.commentId
      ]?.trim();

    if (!content) {
      return;
    }

    const currentUser =
      this.getCurrentUser();

    if (!currentUser) {

      this.commentError =
        'Please login first';

      return;
    }

    this.commentService
      .addComment({

        postId:
          parentComment.postId,

        authorId:
          currentUser.id,

        authorName:
          currentUser.fullName,

        authorUsername:
          currentUser.username,

        authorAvatar:
          `https://ui-avatars.com/api/?name=${currentUser.fullName}`,

        parentCommentId:
          parentComment.commentId,

        content:
          content

      })

      .subscribe({

        next: (reply) => {

          if (
            !parentComment.replies
          ) {

          parentComment.replies = [];
          }

          parentComment.replies.unshift(
            reply
          );

          this.replyInputs[
            parentComment.commentId
          ] = '';

          this.showReplyBox[
            parentComment.commentId
          ] = false;

          if (this.post) {

            this.post.commentCount =
              (this.post.commentCount || 0) + 1;
          }

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'Reply failed',
            err
          );
        }
      });
  }

  // ================= LIKE POST =================

  togglePostLike(
    postId: number
  ): void {

    if (!this.canInteract()) {

      this.error =
        'Please sign in as a reader, author, or admin to like posts.';

      this.cdr.detectChanges();

      return;
    }

    const liked =
      this.isPostLiked(postId);

    const request =
      liked
        ? this.postService.unlikePost(postId)
        : this.postService.likePost(postId);

    request
      .subscribe({

        next: () => {

          if (this.post) {

            this.post.likesCount =
              Math.max(
                0,
                (this.post.likesCount || 0) + (liked ? -1 : 1)
              );
          }

          if (liked) {

            this.likedPostIds.delete(postId);

          } else {

            this.likedPostIds.add(postId);
          }

          this.saveLikedPosts();

          this.cdr.detectChanges();
        },

        error: (err: any) => {

          console.error(
            liked
              ? 'Unlike failed'
              : 'Like failed',
            err
          );
        }
      });
  }

  isPostLiked(postId: number): boolean {

    return this.likedPostIds.has(postId);
  }

  // ================= LIKE COMMENT =================

  likeComment(
    comment:
    CommentResponseDTO
  ): void {

    if (!this.canInteract()) {

      this.commentError =
        'Please sign in to like comments.';

      return;
    }

    const liked =
      this.isCommentLiked(comment.commentId);

    const request =
      liked
        ? this.commentService.unlikeComment(comment.commentId)
        : this.commentService.likeComment(comment.commentId);

    request
      .subscribe({

        next: () => {

          comment.likesCount =
            Math.max(
              0,
              (comment.likesCount || 0) + (liked ? -1 : 1)
            );

          if (liked) {

            this.likedCommentIds.delete(
              comment.commentId
            );

          } else {

            this.likedCommentIds.add(
              comment.commentId
            );
          }

          this.saveLikedComments();

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'Comment like failed',
            err
          );
        }
      });
  }

  // ================= DELETE COMMENT =================

  deleteComment(
    commentId: number
  ): void {

    const confirmed =
      confirm(
        'Delete this comment?'
      );

    if (!confirmed) {
      return;
    }

    this.commentService
      .deleteComment(commentId)
      .subscribe({

        next: () => {

          this.comments =
            this.removeCommentById(
              this.comments,
              commentId
            );

          if (this.post) {

            this.post.commentCount =
              Math.max(
                0,
                (this.post.commentCount || 1) - 1
              );
          }

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'Delete failed',
            err
          );
        }
      });
  }

  // ================= HELPERS =================

  getAuthorName(post: Post): string {

    return post.authorName
      || post.authorUsername
      || 'InkWell Author';
  }

  getAvatarUrl(post: Post): string {

    return post.authorAvatar
      || `${this.fallbackAvatarBase}${encodeURIComponent(
        this.getAuthorName(post)
      )}`;
  }

  getCategoryName(categoryId: number | null): string {

    if (!categoryId) {
      return 'Uncategorized';
    }

    const category =
      this.categories.find(
        item => item.categoryId === categoryId
      );

    return category?.name
      || `Category ${categoryId}`;
  }

  onPostImageError(event: Event): void {

    const image =
      event.target as HTMLImageElement;

    image.src =
      this.fallbackPostImage;
  }

  onAvatarError(event: Event, name: string): void {

    const image =
      event.target as HTMLImageElement;

    image.src =
      `${this.fallbackAvatarBase}${encodeURIComponent(name)}`;
  }

  private loadLikedPosts(): void {

    const saved =
      localStorage.getItem(
        'inkwell_liked_posts'
      );

    if (!saved) {
      return;
    }

    try {

      this.likedPostIds =
        new Set<number>(
          JSON.parse(saved)
        );

    } catch {

      this.likedPostIds =
        new Set<number>();
    }
  }

  private saveLikedPosts(): void {

    localStorage.setItem(
      'inkwell_liked_posts',
      JSON.stringify([
        ...this.likedPostIds
      ])
    );
  }

  private loadLikedComments(): void {

    const saved =
      localStorage.getItem(
        'inkwell_liked_comments'
      );

    if (!saved) {
      return;
    }

    try {

      this.likedCommentIds =
        new Set<number>(
          JSON.parse(saved)
        );

    } catch {

      this.likedCommentIds =
        new Set<number>();
    }
  }

  private saveLikedComments(): void {

    localStorage.setItem(
      'inkwell_liked_comments',
      JSON.stringify([
        ...this.likedCommentIds
      ])
    );
  }

  isCommentLiked(commentId: number): boolean {

    return this.likedCommentIds.has(commentId);
  }

  canInteract(): boolean {

    return !!this.currentUserId
      && this.currentUserRole !== 'GUEST';
  }

  canDeleteComment(comment: CommentResponseDTO): boolean {

    if (!this.currentUserId) {
      return false;
    }

    if (this.currentUserRole === 'ADMIN') {
      return true;
    }

    if (comment.authorId === this.currentUserId) {
      return true;
    }

    return this.currentUserRole === 'AUTHOR'
      && this.post?.authorId === this.currentUserId;
  }

  visibleComments(
    comments: CommentResponseDTO[]
  ): CommentResponseDTO[] {

    return comments
      .filter(comment => comment.status !== 'DELETED')
      .map(comment => ({
        ...comment,
        replies:
          this.visibleComments(
            comment.replies || []
          )
      }));
  }

  loadRepliesRecursive(
    comment: CommentResponseDTO
  ): void {

    this.commentService
      .getReplies(comment.commentId)
      .subscribe({

        next: (replies) => {

          const visibleReplies =
            this.visibleComments(
              replies || []
            );

          comment.replies =
            visibleReplies;

          visibleReplies.forEach(reply =>
            this.loadRepliesRecursive(reply)
          );

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'REPLIES ERROR:',
            err
          );
        }
      });
  }

  removeCommentById(
    comments: CommentResponseDTO[],
    commentId: number
  ): CommentResponseDTO[] {

    return comments
      .filter(comment =>
        comment.commentId !== commentId
      )
      .map(comment => ({
        ...comment,
        replies:
          this.removeCommentById(
            comment.replies || [],
            commentId
          )
      }));
  }
}
