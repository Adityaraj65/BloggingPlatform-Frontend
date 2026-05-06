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
}
