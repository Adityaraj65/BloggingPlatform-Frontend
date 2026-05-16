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
  'http://localhost:8085/notifications';

// ================= DTO =================

export interface NotificationDTO {

  notificationId: number;

  recipientId: number;

  actorId: number;

  type: string;

  title: string;

  message: string;

  relatedId: number;

  relatedType: string;

  isRead: boolean;

  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class Notification {

  private http =
    inject(HttpClient);

  // ================= GET =================

  getByRecipient(
    userId: number
  ): Observable<NotificationDTO[]> {

    return this.http.get<
      NotificationDTO[]
    >(
      `${API_URL}/recipient/${userId}`
    );
  }

  // ================= UNREAD =================

  getUnreadCount(
    userId: number
  ): Observable<number> {

    return this.http.get<number>(
      `${API_URL}/unread-count/${userId}`
    );
  }

  // ================= MARK ALL READ =================

  markAllRead(
    userId: number
  ): Observable<void> {

    return this.http.put<void>(
      `${API_URL}/mark-all-read?recipientId=${userId}`,
      {}
    );
  }

  // ================= MARK READ =================

  markRead(
    id: number
  ): Observable<void> {

    return this.http.put<void>(
      `${API_URL}/mark-read/${id}`,
      {}
    );
  }

  // ================= DELETE =================

  deleteNotification(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${API_URL}/${id}`
    );
  }
}