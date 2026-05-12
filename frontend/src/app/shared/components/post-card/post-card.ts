import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Post } from '../../../core/services/post';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css'
})
export class PostCard {
  @Input({ required: true }) post!: Post;

  @Input() categoryName = '';

  readonly fallbackPostImage =
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643';

  readonly fallbackAvatarBase =
    'https://ui-avatars.com/api/?background=1e293b&color=ffffff&name=';

  get authorName(): string {

    return this.post.authorName
      || this.post.authorUsername
      || 'InkWell Author';
  }

  get avatarUrl(): string {

    return this.post.authorAvatar
      || `${this.fallbackAvatarBase}${encodeURIComponent(
        this.authorName
      )}`;
  }

  get displayCategory(): string {

    return this.categoryName
      || (
        this.post.categoryId
          ? `Category ${this.post.categoryId}`
          : 'Uncategorized'
      );
  }

  onImageError(event: Event): void {

    const image =
      event.target as HTMLImageElement;

    image.src =
      this.fallbackPostImage;
  }

  onAvatarError(event: Event): void {

    const image =
      event.target as HTMLImageElement;

    image.src =
      `${this.fallbackAvatarBase}${encodeURIComponent(
        this.authorName
      )}`;
  }
}
