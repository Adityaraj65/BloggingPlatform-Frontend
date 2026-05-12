import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import {
  PostService,
  PostRequestDTO,
  PostStatus
} from '../../../core/services/post';

import {
  Category,
  CategoryDTO
} from '../../../core/services/category';

import {
  AuthService,
  UserResponse
} from '../../../core/services/auth';

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './post-editor.html',
  styleUrl: './post-editor.css'
})
export class PostEditor implements OnInit {

  private postService =
    inject(PostService);

  private categoryService =
    inject(Category);

  private authService =
    inject(AuthService);

  private route =
    inject(ActivatedRoute);

  private router =
    inject(Router);

  private cdr =
    inject(ChangeDetectorRef);

  // ================= STATE =================

  post: PostRequestDTO = this.createEmptyPost();

  categories: CategoryDTO[] = [];

  loading = false;

  saving = false;

  error = '';

  successMessage = '';

  accessDenied = false;

  isEditMode = false;

  postId: number | null = null;

  currentUser: UserResponse | null = null;

  originalStatus: PostStatus = 'DRAFT';

  imagePreviewError = false;

  readonly fallbackPostImage =
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643';

  // ================= INIT =================

  ngOnInit(): void {

    this.currentUser =
      this.getStoredUser();

    this.applyCurrentUser();

    if (this.isReader()) {

      this.denyReaderAccess();

      return;
    }

    this.loadCurrentUser();

    this.loadCategories();

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {

      this.isEditMode = true;

      this.postId = Number(id);

      this.loadPost(this.postId);
    }
  }

  // ================= CURRENT USER =================

  loadCurrentUser(): void {

    this.authService.currentUser$
      .subscribe({

        next: (user) => {

          if (!user) {
            return;
          }

          this.currentUser = user;

          if (this.isReader()) {

            this.denyReaderAccess();

            return;
          }

          this.applyCurrentUser();

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'USER ERROR:',
            err
          );

          this.error =
            'Failed to load user';

          this.loading = false;

          this.cdr.detectChanges();
        }
      });
  }

  applyCurrentUser(): void {

    if (!this.currentUser) {
      return;
    }

    this.post.authorId =
      this.currentUser.id;

    this.post.authorName =
      this.currentUser.fullName
      || this.currentUser.username;

    this.post.authorUsername =
      this.currentUser.username;

    this.post.authorAvatar =
      `https://ui-avatars.com/api/?background=1e293b&color=ffffff&name=${encodeURIComponent(
        this.post.authorName || this.post.authorUsername || 'Author'
      )}`;
  }

  getStoredUser(): UserResponse | null {

    const stored =
      localStorage.getItem(
        'inkwell_user'
      );

    if (!stored) {
      return null;
    }

    try {

      return JSON.parse(stored);

    } catch {

      return null;
    }
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

        error: (err) => {

          console.error(
            'CATEGORY ERROR:',
            err
          );
        }
      });
  }

  // ================= LOAD POST =================

  loadPost(id: number): void {

    this.loading = true;

    this.error = '';

    this.postService
      .getPostById(id)
      .subscribe({

        next: (post) => {

          if (
            this.currentUser?.role !== 'ADMIN'
            && post.authorId !== this.currentUser?.id
          ) {

            this.accessDenied = true;

            this.error =
              'Access denied. You cannot edit this post.';

            this.loading = false;

            this.cdr.detectChanges();

            return;
          }

          this.post = {

            title: post.title || '',

            content: post.content || '',

            excerpt: post.excerpt || '',

            featuredImageUrl:
              post.featuredImageUrl || '',

            categoryId:
              post.categoryId ?? null,

            authorId:
              post.authorId,

            authorName:
              post.authorName
              || this.currentUser?.fullName
              || this.currentUser?.username,

            authorUsername:
              post.authorUsername
              || this.currentUser?.username,

            authorAvatar:
              post.authorAvatar
              || this.post.authorAvatar,

            status:
              this.normalizeStatus(post.status)
          };

          this.originalStatus =
            this.post.status || 'DRAFT';

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'LOAD POST ERROR:',
            err
          );

          this.error =
            err?.error?.message
            || 'Failed to load post';

          this.loading = false;

          this.cdr.detectChanges();
        }
      });
  }

  // ================= VALIDATION =================

  validatePost(status: PostStatus): boolean {

    this.error = '';

    if (!this.currentUser) {

      this.error =
        'Please login first';

      return false;
    }

    if (this.isReader()) {

      this.denyReaderAccess();

      return false;
    }

    const imageUrl =
      this.post.featuredImageUrl?.trim();

    if (
      imageUrl
      && !/^https?:\/\/.+/i.test(imageUrl)
    ) {

      this.error =
        'Featured image must be a valid http or https URL';

      return false;
    }

    if (imageUrl && this.imagePreviewError) {

      this.error =
        'Featured image URL could not be loaded. Use a working image URL or clear the field.';

      return false;
    }

    if (status === 'DRAFT') {
      return true;
    }

    if (!this.post.title?.trim()) {

      this.error =
        'Title is required';

      return false;
    }

    if (!this.post.content?.trim()) {

      this.error =
        'Content is required';

      return false;
    }

    return true;
  }

  // ================= PUBLISH =================

  publishStory(): void {

    this.submitPost('PUBLISHED');
  }

  // ================= SAVE DRAFT =================

  saveDraft(): void {

    this.submitPost('DRAFT');
  }

  // ================= SUBMIT HELPERS =================

  submitPost(status: PostStatus): void {

    if (!this.validatePost(status)) {
      return;
    }

    this.successMessage = '';

    this.saving = true;

    this.post = {
      ...this.post,
      status,
      title: this.post.title?.trim() || '',
      content: this.post.content?.trim() || '',
      excerpt: this.post.excerpt?.trim() || '',
      featuredImageUrl:
        this.post.featuredImageUrl?.trim() || ''
    };

    if (this.isEditMode) {

      this.updatePost(status);

    } else {

      this.createPost(status);
    }
  }

  // ================= CREATE =================

  createPost(status: PostStatus): void {

    this.postService
      .createPost(
        this.post,
        status === 'PUBLISHED'
      )
      .subscribe({

        next: () => {

          this.saving = false;

          this.successMessage =
            status === 'PUBLISHED'
              ? 'Post published successfully'
              : 'Draft saved successfully';

          this.cdr.detectChanges();

          this.navigateToDashboardSoon();
        },

        error: (err) => {

          console.error(
            'CREATE ERROR:',
            err
          );

          this.handleSaveError(
            err,
            'Failed to create post'
          );
        }
      });
  }

  // ================= UPDATE =================

  updatePost(status: PostStatus): void {

    if (!this.postId) {

      this.saving = false;

      this.error =
        'Invalid post';

      return;
    }

    this.postService
      .updatePost(
        this.postId,
        this.post
      )
      .subscribe({

        next: () => {

          if (status === 'PUBLISHED') {

            this.publishExistingPost();

          } else {

            this.unpublishExistingPost();
          }
        },

        error: (err) => {

          console.error(
            'UPDATE ERROR:',
            err
          );

          this.handleSaveError(
            err,
            'Failed to update post'
          );
        }
      });
  }

  publishExistingPost(): void {

    if (!this.postId) {
      return;
    }

    this.postService
      .publishPost(this.postId)
      .subscribe({

        next: () => {

          this.finishSave(
            'Post published successfully'
          );
        },

        error: (err) => {

          console.error(
            'PUBLISH ERROR:',
            err
          );

          this.handleSaveError(
            err,
            'Failed to publish post'
          );
        }
      });
  }

  unpublishExistingPost(): void {

    if (!this.postId) {
      return;
    }

    if (this.originalStatus !== 'PUBLISHED') {

      this.finishSave(
        'Draft saved successfully'
      );

      return;
    }

    this.postService
      .unpublishPost(this.postId)
      .subscribe({

        next: () => {

          this.finishSave(
            'Draft saved successfully'
          );
        },

        error: () => {

          this.finishSave(
            'Draft updated successfully'
          );
        }
      });
  }

  finishSave(message: string): void {

    this.saving = false;

    this.successMessage =
      message;

    this.cdr.detectChanges();

    this.navigateToDashboardSoon();
  }

  handleSaveError(
    err: any,
    fallbackMessage: string
  ): void {

    this.saving = false;

    if (err?.status === 403) {

      this.error =
        'Access denied. Readers cannot create posts.';

    } else {

      this.error =
        err?.error?.message
        || err?.error?.error
        || fallbackMessage;
    }

    this.cdr.detectChanges();
  }

  // ================= SUBMIT =================

  onSubmit(): void {

    this.publishStory();
  }

  // ================= HELPERS =================

  createEmptyPost(): PostRequestDTO {

    return {

      title: '',

      content: '',

      excerpt: '',

      featuredImageUrl: '',

      categoryId: null,

      authorId: 0,

      authorName: '',

      authorUsername: '',

      authorAvatar: '',

      status: 'DRAFT'
    };
  }

  normalizeStatus(status: string): PostStatus {

    if (
      status === 'PUBLISHED'
      || status === 'UNPUBLISHED'
      || status === 'ARCHIVED'
      || status === 'DRAFT'
    ) {
      return status;
    }

    return 'DRAFT';
  }

  isReader(): boolean {

    return this.currentUser?.role === 'READER';
  }

  denyReaderAccess(): void {

    this.accessDenied = true;

    this.loading = false;

    this.saving = false;

    this.error =
      'Access denied. Readers cannot create posts.';

    this.cdr.detectChanges();
  }

  onImageError(event: Event): void {

    const image =
      event.target as HTMLImageElement;

    this.imagePreviewError = true;

    image.style.display = 'none';

    this.cdr.detectChanges();
  }

  onImageLoad(event: Event): void {

    const image =
      event.target as HTMLImageElement;

    this.imagePreviewError = false;

    image.style.display = 'block';
  }

  onFeaturedImageChange(): void {

    this.imagePreviewError = false;
  }

  navigateToDashboardSoon(): void {

    setTimeout(() => {

      this.router.navigate([
        '/author/dashboard'
      ]);

    }, 700);
  }

  // ================= BACK =================

  goBack(): void {

    this.router.navigate([
      '/author/dashboard'
    ]);
  }
}
