import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/comments';

export interface CommentRequestDTO {
  postId: number;
  userId: number;
  content: string;
  parentCommentId?: number;
}

export interface CommentResponseDTO {
  commentId: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  status: string;
  parentCommentId?: number;
  likesCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class Comment {
  private http = inject(HttpClient);

  addComment(comment: CommentRequestDTO): Observable<CommentResponseDTO> {
    return this.http.post<CommentResponseDTO>(API_URL, comment);
  }

  getCommentsByPost(postId: number): Observable<CommentResponseDTO[]> {
    return this.http.get<CommentResponseDTO[]>(`${API_URL}/post/${postId}`);
  }

  getReplies(id: number): Observable<CommentResponseDTO[]> {
    return this.http.get<CommentResponseDTO[]>(`${API_URL}/replies/${id}`);
  }

  updateComment(id: number, content: string): Observable<CommentResponseDTO> {
    return this.http.put<CommentResponseDTO>(`${API_URL}/${id}?content=${encodeURIComponent(content)}`, {});
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }

  approveComment(id: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/approve/${id}`, {});
  }

  rejectComment(id: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/reject/${id}`, {});
  }

  likeComment(id: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/like/${id}`, {});
  }

  unlikeComment(id: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/unlike/${id}`, {});
  }

  getCommentCount(postId: number): Observable<number> {
    return this.http.get<number>(`${API_URL}/count/${postId}`);
  }
}
