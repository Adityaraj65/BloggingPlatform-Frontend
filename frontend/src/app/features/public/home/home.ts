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
  FormsModule
} from '@angular/forms';

import {
  RouterModule
} from '@angular/router';

import {
  ActivatedRoute
} from '@angular/router';

import {
  PostService,
  Post
} from '../../../core/services/post';

import {
  Category,
  CategoryDTO,
  TagDTO
} from '../../../core/services/category';

import {
  PostCard
} from '../../../shared/components/post-card/post-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PostCard
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  private postService =
    inject(PostService);

  private categoryService =
    inject(Category);

  private route =
    inject(ActivatedRoute);

  private cdr =
    inject(ChangeDetectorRef);

  posts: Post[] = [];

  allPosts: Post[] = [];

  featuredPost:
    Post | null = null;

  categories:
    CategoryDTO[] = [];

  tags:
    TagDTO[] = [];

  searchQuery = '';

  selectedCategoryId:
    number | null = null;

  loading = false;

  error = '';

  newsletterEmail = '';

  newsletterMessage = '';

  readonly fallbackPostImage =
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643';

  readonly fallbackAvatarBase =
    'https://ui-avatars.com/api/?background=1e293b&color=ffffff&name=';

  ngOnInit(): void {

    this.loadPosts();

    this.loadCategories();

    this.loadTrendingTags();

    this.route.queryParamMap
      .subscribe(params => {

        const query =
          params.get('search') || '';

        this.searchQuery = query;

        this.applyFilters();
      });
  }

  // ================= POSTS =================

  loadPosts(): void {

    this.loading = true;

    this.error = '';

    this.cdr.detectChanges();

    this.postService.getFeed()
      .subscribe({

        next: (posts) => {

          console.log(
            'HOME POSTS:',
            posts
          );

          this.allPosts =
            this.onlyPublished(posts);

          this.applyFilters();

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'HOME ERROR:',
            err
          );

          this.error =
            'Failed to load posts';

          this.loading = false;

          this.cdr.detectChanges();
        }
      });
  }

  // ================= SEARCH =================

  searchPosts(): void {

    if (
      !this.searchQuery.trim()
    ) {

      this.loadPosts();

      return;
    }

    this.loading = true;

    this.cdr.detectChanges();

    this.postService
      .searchPosts(this.searchQuery)
      .subscribe({

        next: (posts) => {

          this.allPosts =
            this.onlyPublished(posts);

          this.applyFilters();

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(err);

          this.error =
            'Search failed';

          this.loading = false;

          this.cdr.detectChanges();
        }
      });
  }

  // ================= CATEGORIES =================

  loadCategories(): void {

    this.categoryService
      .getAllCategories()
      .subscribe({

        next: (categories) => {

          this.categories =
            [...categories];

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(err);
        }
      });
  }

  loadTrendingTags(): void {

    this.categoryService
      .getTrendingTags()
      .subscribe({

        next: (tags) => {

          this.tags =
            [...(tags || [])];

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'TAGS ERROR:',
            err
          );
        }
      });
  }

  // ================= SCROLL =================

  scrollToFeed(): void {

    document
      .getElementById(
        'latest-posts'
      )
      ?.scrollIntoView({

        behavior: 'smooth'
      });
  }

  // ================= NEWSLETTER =================

  subscribe(): void {

    if (
      !this.newsletterEmail.trim()
    ) {

      this.newsletterMessage =
        'Please enter email';

      return;
    }

    this.newsletterMessage =
      'Subscribed successfully';

    this.newsletterEmail = '';

    this.cdr.detectChanges();
  }

  // ================= HELPERS =================

  applyFilters(): void {

    const query =
      this.searchQuery.trim().toLowerCase();

    this.posts =
      this.allPosts.filter(post => {

        const matchesCategory =
          !this.selectedCategoryId
          || post.categoryId === this.selectedCategoryId;

        const matchesSearch =
          !query
          || post.title?.toLowerCase().includes(query)
          || post.excerpt?.toLowerCase().includes(query)
          || post.content?.toLowerCase().includes(query)
          || post.authorName?.toLowerCase().includes(query)
          || post.authorUsername?.toLowerCase().includes(query);

        return matchesCategory
          && matchesSearch;
      });

    this.featuredPost =
      this.posts[0] || null;

    this.cdr.detectChanges();
  }

  filterByCategory(
    categoryId: number | null
  ): void {

    this.selectedCategoryId =
      categoryId;

    this.applyFilters();
  }

  isCategoryActive(
    categoryId: number | null
  ): boolean {

    return this.selectedCategoryId === categoryId;
  }

  onlyPublished(posts: Post[]): Post[] {

    return (posts || [])
      .filter(
        post => post.status === 'PUBLISHED'
      );
  }

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

  onImageError(event: Event): void {

    const image =
      event.target as HTMLImageElement;

    image.src =
      this.fallbackPostImage;
  }

  onAvatarError(event: Event, post: Post): void {

    const image =
      event.target as HTMLImageElement;

    image.src =
      `${this.fallbackAvatarBase}${encodeURIComponent(
        this.getAuthorName(post)
      )}`;
  }
}
