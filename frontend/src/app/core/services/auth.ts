import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import {
  Observable,
  tap,
  BehaviorSubject
} from 'rxjs';

const API_URL =
  'http://localhost:8080/auth';

export interface UserResponse {

  id: number;

  username: string;

  email: string;

  role: string;

  fullName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http =
    inject(HttpClient);

  private currentUserSubject =
    new BehaviorSubject<UserResponse | null>(null);

  public currentUser$ =
    this.currentUserSubject.asObservable();

  constructor() {

    const token =
      localStorage.getItem(
        'inkwell_token'
      );

    if (token) {

      this.setUserFromToken(token);
    }
  }

  // ================= LOGIN =================

  login(credentials: any): Observable<any> {

    return this.http.post(
      `${API_URL}/login`,
      credentials,
      {
        responseType: 'text' as 'json'
      }
    ).pipe(

      tap((token: any) => {

        console.log(
          'JWT TOKEN:',
          token
        );

        // SAVE TOKEN

        localStorage.setItem(
          'inkwell_token',
          token
        );

        // SET USER

        this.setUserFromToken(token);
      })
    );
  }

  // ================= REGISTER =================

  register(
    userData: any
  ): Observable<UserResponse> {

    return this.http.post<UserResponse>(
      `${API_URL}/register`,
      userData
    );
  }

  // ================= PROFILE =================

  getUserProfile(
    id: number
  ): Observable<UserResponse> {

    return this.http.get<UserResponse>(
      `${API_URL}/profile/${id}`
    );
  }

  // ================= LOGOUT =================

  logout(): void {

  localStorage.removeItem(
    'inkwell_token'
  );

  localStorage.removeItem(
    'inkwell_user_id'
  );

  localStorage.removeItem(
    'inkwell_user'
  );

  this.currentUserSubject.next(null);
}

  // ================= LOGIN CHECK =================

  isLoggedIn(): boolean {

    return !!localStorage.getItem(
      'inkwell_token'
    );
  }

  // ================= TOKEN PARSER =================

  private setUserFromToken(
  token: string
): void {

  try {

    const payload =
      JSON.parse(
        atob(token.split('.')[1])
      );

    console.log(
      'JWT payload:',
      payload
    );

    const user: UserResponse = {

      id:
        payload.userId || 0,

      username:
        payload.sub || '',

      email:
        payload.email || '',

      role:
        payload.role || 'READER',

      fullName:
        payload.fullName ||
        payload.sub
    };

    // ================= STORE IN MEMORY =================

    this.currentUserSubject.next(user);

    // ================= STORE TOKEN =================

    localStorage.setItem(
      'inkwell_token',
      token
    );

    // ================= STORE USER ID =================

    localStorage.setItem(
      'inkwell_user_id',
      user.id.toString()
    );

    // ================= STORE FULL USER =================

    localStorage.setItem(
      'inkwell_user',
      JSON.stringify(user)
    );

    console.log(
      'STORED USER:',
      user
    );

  } catch (e) {

    console.error(
      'JWT parse failed:',
      e
    );

    this.logout();
  }
}
}