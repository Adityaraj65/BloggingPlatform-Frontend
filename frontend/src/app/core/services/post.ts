import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

const API_URL =
  'http://localhost:8080/posts';

export type PostStatus =
  'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';

// ================= POST MODEL =================

export interface Post {

  postId: number;

  title: string;

  slug: string;

  content: string;

  excerpt: string;

  featuredImageUrl: string;

  status: PostStatus;

  readTimeMin: number;

  viewCount: number;

  likesCount: number;

  commentCount?: number;

  createdAt: string;

  publishedAt: string | null;

  categoryId: number | null;

  authorId: number;

  // ================= AUTHOR =================

  authorName?: string;

  authorUsername?: string;

  authorAvatar?: string;
}

// ================= REQUEST DTO =================

export interface PostRequestDTO {

  title?: string;

  content?: string;

  excerpt?: string;

  featuredImageUrl?: string;

  categoryId?: number | null;

  authorId: number;

  // ================= NEW =================

  authorName?: string;

  authorUsername?: string;

  authorAvatar?: string;

  // ================= IMPORTANT =================

  status?: PostStatus;
}

// ================= RESPONSE DTO =================

export interface PostResponseDTO {

  postId: number;

  title: string;

  slug: string;

  content: string;

  excerpt: string;

  featuredImageUrl: string;

  status: PostStatus;

  readTimeMin: number;

  viewCount: number;

  likesCount: number;

  commentCount?: number;

  createdAt: string;

  publishedAt: string | null;

  categoryId: number | null;

  authorId: number;

  // ================= AUTHOR =================

  authorName?: string;

  authorUsername?: string;

  authorAvatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private http =
    inject(HttpClient);

  // ================= FEED =================

  getFeed():
    Observable<Post[]> {

    return this.http.get<Post[]>(

      `${API_URL}/published`
    );
  }

  // ================= CREATE =================

  createPost(
    post: PostRequestDTO,
    publish = false
  ): Observable<PostResponseDTO> {

    return this.http.post<PostResponseDTO>(

      `${API_URL}?publish=${publish}`,

      post
    );
  }

  // ================= UPDATE =================

  updatePost(
    id: number,
    post: PostRequestDTO
  ): Observable<PostResponseDTO> {

    return this.http.put<PostResponseDTO>(

      `${API_URL}/${id}`,

      post
    );
  }

  // ================= GET BY ID =================

  getPostById(
    id: number
  ): Observable<PostResponseDTO> {

    return this.http.get<PostResponseDTO>(

      `${API_URL}/${id}`
    );
  }

  // ================= GET BY SLUG =================

  getPostBySlug(
    slug: string
  ): Observable<Post> {

    return this.http.get<Post>(

      `${API_URL}/slug/${slug}`
    );
  }

  // ================= PUBLISHED =================

  getPublishedPosts():
    Observable<Post[]> {

    return this.http.get<Post[]>(

      `${API_URL}/published`
    );
  }

  // ================= SEARCH =================

  searchPosts(
    query: string
  ): Observable<Post[]> {

    return this.http.get<Post[]>(

      `${API_URL}/search?query=${encodeURIComponent(query)}`
    );
  }

  // ================= AUTHOR POSTS =================

  getPostsByAuthor(
    authorId: number
  ): Observable<PostResponseDTO[]> {

    return this.http.get<PostResponseDTO[]>(

      `${API_URL}/author/${authorId}`
    );
  }

  // ================= DELETE =================

  deletePost(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(

      `${API_URL}/${id}`
    );
  }

  // ================= PUBLISH =================

  publishPost(
    id: number
  ): Observable<void> {

    return this.http.post<void>(

      `${API_URL}/publish/${id}`,

      {}
    );
  }

  // ================= UNPUBLISH =================

  unpublishPost(
    id: number
  ): Observable<void> {

    return this.http.post<void>(

      `${API_URL}/unpublish/${id}`,

      {}
    );
  }

  // ================= LIKE =================

  likePost(
    id: number
  ): Observable<void> {

    return this.http.post<void>(

      `${API_URL}/like/${id}`,

      {}
    );
  }

  // ================= UNLIKE =================

  unlikePost(
    id: number
  ): Observable<void> {

    return this.http.post<void>(

      `${API_URL}/unlike/${id}`,

      {}
    );
  }

  // ================= COUNT =================

  getPostCount(
    authorId: number
  ): Observable<number> {

    return this.http.get<number>(

      `${API_URL}/count/${authorId}`
    );
  }
}
