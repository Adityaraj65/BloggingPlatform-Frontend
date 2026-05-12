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
  'http://localhost:8080/comments';

// ================= REQUEST DTO =================

export interface CommentRequestDTO {

  postId: number;

  authorId: number;

  authorName: string;

  authorUsername: string;

  authorAvatar?: string;

  content: string;

  parentCommentId?: number;
}

// ================= RESPONSE DTO =================

export interface CommentResponseDTO {

  commentId: number;

  postId: number;

  authorId: number;

  authorName?: string;

  authorUsername?: string;

  authorAvatar?: string;

  content: string;

  createdAt: string;

  status: string;

  likesCount: number;

  parentCommentId?: number;

  replies?: CommentResponseDTO[];
}

// ================= SERVICE =================

@Injectable({
  providedIn: 'root',
})
export class Comment {

  private http =
    inject(HttpClient);

  // ================= ADD COMMENT =================

  addComment(
    comment: CommentRequestDTO
  ): Observable<CommentResponseDTO> {

    return this.http.post<CommentResponseDTO>(
      API_URL,
      comment
    );
  }

  // ================= DELETE COMMENT =================

  deleteComment(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${API_URL}/${id}`
    );
  }

  // ================= GET COMMENTS =================

  getCommentsByPost(
    postId: number
  ): Observable<CommentResponseDTO[]> {

    return this.http.get<CommentResponseDTO[]>(
      `${API_URL}/post/${postId}`
    );
  }

  // ================= GET REPLIES =================

  getReplies(
    id: number
  ): Observable<CommentResponseDTO[]> {

    return this.http.get<CommentResponseDTO[]>(
      `${API_URL}/replies/${id}`
    );
  }

  // ================= LIKE COMMENT =================

  likeComment(
    id: number
  ): Observable<void> {

    return this.http.put<void>(
      `${API_URL}/like/${id}`,
      {}
    );
  }

  // ================= UNLIKE COMMENT =================

  unlikeComment(
    id: number
  ): Observable<void> {

    return this.http.put<void>(
      `${API_URL}/unlike/${id}`,
      {}
    );
  }

  // ================= COMMENT COUNT =================

  getCommentCount(
    postId: number
  ): Observable<number> {

    return this.http.get<number>(
      `${API_URL}/count/${postId}`
    );
  }
}