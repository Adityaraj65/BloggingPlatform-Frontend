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
  RouterModule
} from '@angular/router';

import {
  PostService,
  PostResponseDTO,
  PostStatus
} from '../../../core/services/post';

import {
  AuthService
} from '../../../core/services/auth';

import {
  Category,
  CategoryDTO,
  TagDTO
} from '../../../core/services/category';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private postService =
    inject(PostService);

  private authService =
    inject(AuthService);

  private categoryService =
    inject(Category);

  private cdr =
    inject(ChangeDetectorRef);

  posts: PostResponseDTO[] = [];

  loading = false;

  error = '';

  successMessage = '';

  userId: number | null = null;

  currentUser: any = null;

  accessDenied = false;

  actionInProgress:
    Record<number, boolean> = {};

  categories: CategoryDTO[] = [];

  tags: TagDTO[] = [];

  categoryForm: CategoryDTO = {
    name: '',
    slug: '',
    description: '',
    displayOrder: 0,
    isActive: true
  };

  tagForm: TagDTO = {
    name: '',
    slug: ''
  };

  adminMessage = '';

  ngOnInit(): void {

    this.authService.currentUser$
      .subscribe({

        next: (user) => {

          this.currentUser =
            user;

          if (this.isReader(user)) {

            this.accessDenied = true;

            this.loading = false;

            this.error =
              'Access denied. Readers cannot access the author dashboard.';

            this.cdr.detectChanges();

            return;
          }

          this.loadDashboard();

          if (this.isAdmin()) {

            this.loadCategories();

            this.loadTags();
          }
        },

        error: (err) => {

          console.error(
            'USER ERROR:',
            err
          );

          this.error =
            'Failed to load user';
        }
      });
  }

  // ================= LOAD =================

  loadDashboard(): void {

    const userIdStr =
      localStorage.getItem(
        'inkwell_user_id'
      );

    if (!userIdStr) {

      this.error =
        'User not logged in';

      return;
    }

    this.userId =
      parseInt(userIdStr, 10);

    this.loadPosts();
  }

  // ================= POSTS =================

  loadPosts(): void {

    if (!this.userId) {
      return;
    }

    this.loading = true;

    this.error = '';

    this.postService
      .getPostsByAuthor(this.userId)
      .subscribe({

        next: (posts) => {

          console.log(
            'DASHBOARD POSTS:',
            posts
          );

          this.posts = [...posts];

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'DASHBOARD ERROR:',
            err
          );

          this.error =
            'Failed to load posts';

          this.loading = false;

          this.cdr.detectChanges();
        }
      });
  }

  // ================= PUBLISH =================

  publishPost(id: number): void {

    this.error = '';

    this.successMessage = '';

    this.actionInProgress[id] = true;

    this.postService
      .publishPost(id)
      .subscribe({

        next: () => {

          this.updatePostStatus(
            id,
            'PUBLISHED'
          );

          this.successMessage =
            'Post published successfully';

          this.actionInProgress[id] = false;

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'PUBLISH ERROR:',
            err
          );

          this.error =
            err?.error?.message
            || 'Failed to publish post';

          this.actionInProgress[id] = false;

          this.cdr.detectChanges();
        }
      });
  }

  // ================= UNPUBLISH =================

  unpublishPost(id: number): void {

    this.error = '';

    this.successMessage = '';

    this.actionInProgress[id] = true;

    this.postService
      .unpublishPost(id)
      .subscribe({

        next: () => {

          this.updatePostStatus(
            id,
            'UNPUBLISHED'
          );

          this.successMessage =
            'Post moved to draft';

          this.actionInProgress[id] = false;

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'UNPUBLISH ERROR:',
            err
          );

          this.error =
            err?.error?.message
            || 'Failed to unpublish post';

          this.actionInProgress[id] = false;

          this.cdr.detectChanges();
        }
      });
  }

  // ================= DELETE =================

  deletePost(id: number): void {

    const confirmed =
      confirm(
        'Delete this post permanently?'
      );

    if (!confirmed) {
      return;
    }

    this.postService
      .deletePost(id)
      .subscribe({

        next: () => {

          this.posts =
            this.posts.filter(
              p => p.postId !== id
            );

          this.successMessage =
            'Post deleted successfully';

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'DELETE ERROR:',
            err
          );

          this.error =
            err?.error?.message
            || 'Failed to delete post';

          this.cdr.detectChanges();
        }
      });
  }

  // ================= STATS =================

  get stats() {

    const totalViews =
      this.posts.reduce(
        (sum, post) =>
          sum + post.viewCount,
        0
      );

    const totalLikes =
      this.posts.reduce(
        (sum, post) =>
          sum + post.likesCount,
        0
      );

    const publishedPosts =
      this.posts.filter(
        p => p.status === 'PUBLISHED'
      ).length;

    const draftPosts =
      this.posts.filter(
        p => p.status === 'DRAFT'
      ).length;

    return [

      {
        label: 'Total Posts',
        value: this.posts.length
      },

      {
        label: 'Published',
        value: publishedPosts
      },

      {
        label: 'Drafts',
        value: draftPosts
      },

      {
        label: 'Unpublished',
        value:
          this.posts.filter(
            p => p.status === 'UNPUBLISHED'
          ).length
      },

      {
        label: 'Views',
        value: totalViews
      },

      {
        label: 'Likes',
        value: totalLikes
      }
    ];
  }

  // ================= HELPERS =================

  isReader(user = this.currentUser): boolean {

    return user?.role === 'READER';
  }

  isBusy(postId: number): boolean {

    return !!this.actionInProgress[postId];
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

  updatePostStatus(
    postId: number,
    status: PostStatus
  ): void {

    this.posts =
      this.posts.map(post =>
        post.postId === postId
          ? {
              ...post,
              status,
              publishedAt:
                status === 'PUBLISHED'
                  ? new Date().toISOString()
                  : null
            }
          : post
      );
  }

  getAuthorName(post: PostResponseDTO): string {

    return post.authorName
      || post.authorUsername
      || this.currentUser?.fullName
      || this.currentUser?.username
      || 'InkWell Author';
  }

  getImageUrl(post: PostResponseDTO): string {

    return post.featuredImageUrl
      || '';
  }

  isAdmin(): boolean {

    return this.currentUser?.role === 'ADMIN';
  }

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
            'CATEGORY ADMIN LOAD ERROR:',
            err
          );

          this.adminMessage =
            'Failed to load categories';
        }
      });
  }

  loadTags(): void {

    this.categoryService
      .getAllTags()
      .subscribe({

        next: (tags) => {

          this.tags =
            [...(tags || [])];

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'TAG ADMIN LOAD ERROR:',
            err
          );

          this.adminMessage =
            'Failed to load tags';
        }
      });
  }

  createCategory(): void {

    if (!this.categoryForm.name.trim()) {

      this.adminMessage =
        'Category name is required';

      return;
    }

    const payload = {
      ...this.categoryForm,
      slug:
        this.categoryForm.slug?.trim()
        || this.toSlug(this.categoryForm.name)
    };

    this.categoryService
      .createCategory(payload)
      .subscribe({

        next: (category) => {

          this.categories = [
            category,
            ...this.categories
          ];

          this.categoryForm = {
            name: '',
            slug: '',
            description: '',
            displayOrder: 0,
            isActive: true
          };

          this.adminMessage =
            'Category created';

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'CREATE CATEGORY ERROR:',
            err
          );

          this.adminMessage =
            err?.error?.message
            || 'Failed to create category';
        }
      });
  }

  deleteCategory(id?: number): void {

    if (!id || !confirm('Delete this category?')) {
      return;
    }

    this.categoryService
      .deleteCategory(id)
      .subscribe({

        next: () => {

          this.categories =
            this.categories.filter(
              category => category.categoryId !== id
            );

          this.adminMessage =
            'Category deleted';

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'DELETE CATEGORY ERROR:',
            err
          );

          this.adminMessage =
            err?.error?.message
            || 'Failed to delete category';
        }
      });
  }

  createTag(): void {

    if (!this.tagForm.name.trim()) {

      this.adminMessage =
        'Tag name is required';

      return;
    }

    const payload = {
      ...this.tagForm,
      slug:
        this.tagForm.slug?.trim()
        || this.toSlug(this.tagForm.name)
    };

    this.categoryService
      .createTag(payload)
      .subscribe({

        next: (tag) => {

          this.tags = [
            tag,
            ...this.tags
          ];

          this.tagForm = {
            name: '',
            slug: ''
          };

          this.adminMessage =
            'Tag created';

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'CREATE TAG ERROR:',
            err
          );

          this.adminMessage =
            err?.error?.message
            || 'Failed to create tag';
        }
      });
  }

  deleteTag(id?: number): void {

    if (!id || !confirm('Delete this tag?')) {
      return;
    }

    this.categoryService
      .deleteTag(id)
      .subscribe({

        next: () => {

          this.tags =
            this.tags.filter(
              tag => tag.tagId !== id
            );

          this.adminMessage =
            'Tag deleted';

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'DELETE TAG ERROR:',
            err
          );

          this.adminMessage =
            err?.error?.message
            || 'Failed to delete tag';
        }
      });
  }

  toSlug(value: string): string {

    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
