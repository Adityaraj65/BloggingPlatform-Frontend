import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, switchMap, of, catchError } from 'rxjs';
import { AuthService, UserResponse } from './auth';

const API_URL = 'http://localhost:8080/posts';

export interface PostResponseDTO {
  postId: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImageUrl: string;
  authorId: number;
  categoryId: number;
  tags?: string[];
  readTimeMin: number;
  viewCount: number;
  likesCount: number;
  commentCount: number;
  createdAt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface Post extends Omit<PostResponseDTO, 'authorId'> {
  id: string; // Map postId to id for frontend compatibility
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  categories: string[];
  readTime: number; // Map readTimeMin to readTime
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  getFeed(): Observable<Post[]> {
    return this.http.get<PostResponseDTO[]>(`${API_URL}/published`).pipe(
      switchMap(posts => {
        if (!posts || posts.length === 0) return of([]);
        
        // Fetch author details for each post
        const postObservables = posts.map(post => {
          return this.authService.getUserProfile(post.authorId).pipe(
            catchError(() => of({ id: post.authorId, username: 'Unknown Author', fullName: 'Unknown', email: '', role: '' } as UserResponse)),
            map(user => this.mapDtoToPost(post, user))
          );
        });
        
        return forkJoin(postObservables);
      })
    );
  }

  getPostBySlug(slug: string): Observable<Post | undefined> {
    return this.http.get<PostResponseDTO>(`${API_URL}/slug/${slug}`).pipe(
      switchMap(post => {
        if (!post) return of(undefined);
        return this.authService.getUserProfile(post.authorId).pipe(
          catchError(() => of({ id: post.authorId, username: 'Unknown Author', fullName: 'Unknown', email: '', role: '' } as UserResponse)),
          map(user => this.mapDtoToPost(post, user))
        );
      })
    );
  }

  createPost(postData: any): Observable<PostResponseDTO> {
    return this.http.post<PostResponseDTO>(`${API_URL}`, postData);
  }

  updatePost(id: number, postData: any): Observable<PostResponseDTO> {
    return this.http.put<PostResponseDTO>(`${API_URL}/${id}`, postData);
  }

  getPostById(id: number): Observable<PostResponseDTO> {
    return this.http.get<PostResponseDTO>(`${API_URL}/${id}`);
  }

  getPostsByAuthor(authorId: number): Observable<PostResponseDTO[]> {
    return this.http.get<PostResponseDTO[]>(`${API_URL}/author/${authorId}`);
  }

  private mapDtoToPost(dto: PostResponseDTO, user: UserResponse): Post {
    return {
      ...dto,
      id: dto.postId.toString(),
      author: {
        id: user.id.toString(),
        name: user.fullName || user.username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}` // Generate avatar
      },
      categories: ['Category ' + dto.categoryId], // Temporary until category service is integrated
      tags: dto.tags || ['Tag1', 'Tag2'],
      readTime: dto.readTimeMin,
      commentCount: 0 // Will need comment service integration later
    };
  }
}
