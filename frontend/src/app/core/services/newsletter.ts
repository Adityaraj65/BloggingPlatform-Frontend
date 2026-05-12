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
  'http://localhost:8080/newsletter';

// ================= REQUEST DTO =================

export interface SubscriptionRequest {

  email: string;

  fullName: string;

  preferences?: string;
}

// ================= RESPONSE DTO =================

export interface SubscriberDTO {

  subscriberId: number;

  email: string;

  fullName: string;

  status: string;

  preferences?: string;
}

// ================= SERVICE =================

@Injectable({
  providedIn: 'root',
})
export class NewsletterService {

  private http =
    inject(HttpClient);

  subscribe(
    request: SubscriptionRequest
  ): Observable<SubscriberDTO> {

    console.log(
      'SUBSCRIBE REQUEST:',
      request
    );

    return this.http.post<SubscriberDTO>(
      `${API_URL}/subscribe`,
      request
    );
  }

  confirmSubscription(
    token: string
  ): Observable<string> {

    return this.http.get(
      `${API_URL}/confirm?token=${encodeURIComponent(token)}`,
      {
        responseType: 'text'
      }
    );
  }

  sendNewsletter(
    subject: string,
    content: string
  ): Observable<string> {

    return this.http.post(
      `${API_URL}/send`,
      {
        subject,
        content
      },
      {
        responseType: 'text'
      }
    );
  }

  updatePreferences(
    id: number,
    prefs: string
  ): Observable<void> {

    return this.http.put<void>(
      `${API_URL}/preferences/${id}?prefs=${encodeURIComponent(prefs)}`,
      {}
    );
  }

  getSubscriberCount(): Observable<number> {

    return this.http.get<number>(
      `${API_URL}/count`
    );
  }
}