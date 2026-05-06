import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/newsletter';

export interface SubscriptionRequest {
  email: string;
  preferences?: string;
}

export interface SubscriberDTO {
  id: number;
  email: string;
  isConfirmed: boolean;
  preferences: string;
}

@Injectable({
  providedIn: 'root',
})
export class NewsletterService {
  private http = inject(HttpClient);

  subscribe(request: SubscriptionRequest): Observable<SubscriberDTO> {
    return this.http.post<SubscriberDTO>(`${API_URL}/subscribe`, request);
  }

  confirmSubscription(token: string): Observable<string> {
    return this.http.get(`${API_URL}/confirm?token=${encodeURIComponent(token)}`, { responseType: 'text' });
  }

  sendNewsletter(subject: string, content: string): Observable<string> {
    return this.http.post(`${API_URL}/send`, { subject, content }, { responseType: 'text' });
  }

  updatePreferences(id: number, prefs: string): Observable<void> {
    return this.http.put<void>(`${API_URL}/preferences/${id}?prefs=${encodeURIComponent(prefs)}`, {});
  }

  getSubscriberCount(): Observable<number> {
    return this.http.get<number>(`${API_URL}/count`);
  }
}

// Maintain backward compatibility
export const Newsletter = NewsletterService;
