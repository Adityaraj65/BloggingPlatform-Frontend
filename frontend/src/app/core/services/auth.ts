import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';

const API_URL = 'http://localhost:8080/auth';

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
  private http = inject(HttpClient);
  private currentUserSubject = new BehaviorSubject<UserResponse | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check if logged in on init
    const token = localStorage.getItem('inkwell_token');
    if (token) {
      // Parse token to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userId) {
          localStorage.setItem('inkwell_user_id', payload.userId.toString());
          // Fetch full user profile
          this.getUserProfile(payload.userId).subscribe({
            next: (user) => this.currentUserSubject.next(user),
            error: () => {
              // If profile fetch fails, create basic user from token
              const basicUser: UserResponse = {
                id: payload.userId,
                username: payload.sub || payload.username,
                email: payload.email || '',
                role: payload.role || 'USER',
                fullName: payload.fullName || payload.sub
              };
              this.currentUserSubject.next(basicUser);
            }
          });
        } else if (payload.sub) {
          // Create user from token info if no userId
          const basicUser: UserResponse = {
            id: 0,
            username: payload.sub,
            email: payload.email || '',
            role: payload.role || 'USER',
            fullName: payload.fullName || payload.sub
          };
          this.currentUserSubject.next(basicUser);
        }
      } catch (e) {
        console.error("Could not parse JWT on init:", e);
        this.logout();
      }
    }
  }

  login(credentials: any): Observable<string> {
    return this.http.post(`${API_URL}/login`, credentials, { responseType: 'text' }).pipe(
      tap(token => {
        localStorage.setItem('inkwell_token', token);
        
        // Parse JWT to get user information
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Login successful, token payload:', payload);
          
          // Immediately create user from token to update UI
          const user: UserResponse = {
            id: payload.userId || 0,
            username: payload.sub || payload.username,
            email: payload.email || '',
            role: payload.role || 'USER',
            fullName: payload.fullName || payload.sub
          };
          
          // Update auth state immediately
          this.currentUserSubject.next(user);
          console.log('User logged in successfully:', user);
          
          // Store user ID if available
          if (payload.userId) {
            localStorage.setItem('inkwell_user_id', payload.userId.toString());
          }
        } catch (e) {
          console.error("Could not parse JWT", e);
        }
      })
    );
  }

  register(userData: any): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${API_URL}/register`, userData);
  }

  getUserProfile(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${API_URL}/profile/${id}`);
  }

  logout() {
    localStorage.removeItem('inkwell_token');
    localStorage.removeItem('inkwell_user_id');
    this.currentUserSubject.next(null);
  }
  
  isLoggedIn(): boolean {
    return !!localStorage.getItem('inkwell_token');
  }
}
