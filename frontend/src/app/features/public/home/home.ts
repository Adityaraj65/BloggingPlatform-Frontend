import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService, Post } from '../../../core/services/post';
import { PostCard } from '../../../shared/components/post-card/post-card';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private postService = inject(PostService);
  
  posts$!: Observable<Post[]>;
  filters = ['For You', 'Following', 'Programming', 'Design'];
  activeFilter = 'For You';
  newsletterEmail = '';
  newsletterMessage = '';
  
  ngOnInit(): void {
    this.posts$ = this.postService.getFeed();
  }

  scrollToFeed(): void {
    document.getElementById('latest-articles')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  selectFilter(filter: string): void {
    this.activeFilter = filter;
  }

  subscribe(): void {
    const email = this.newsletterEmail.trim();

    if (!email) {
      this.newsletterMessage = 'Enter an email address to subscribe.';
      return;
    }

    this.newsletterMessage = `Thanks, ${email}. You are on the list.`;
    this.newsletterEmail = '';
  }
}
