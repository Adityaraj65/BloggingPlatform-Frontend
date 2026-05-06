import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/notifications';

export interface NotificationDTO {
  notificationId: number;
  recipientId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class Notification {
  private http = inject(HttpClient);

  getByRecipient(id: number): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${API_URL}/recipient/${id}`);
  }

  markAllRead(recipientId: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/mark-all-read?recipientId=${recipientId}`, {});
  }

  getUnreadCount(id: number): Observable<number> {
    return this.http.get<number>(`${API_URL}/unread-count/${id}`);
  }

  sendBulk(ids: number[], title: string, msg: string): Observable<void> {
    return this.http.post<void>(`${API_URL}/send-bulk?title=${encodeURIComponent(title)}&msg=${encodeURIComponent(msg)}`, ids);
  }

  deleteRead(recipientId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/delete-read?recipientId=${recipientId}`);
  }
}
