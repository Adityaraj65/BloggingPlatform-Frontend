import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AuthService, UserResponse } from '../../../core/services/auth';
import { Notification, NotificationDTO } from '../../../core/services/notification';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, AsyncPipe, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private authService = inject(AuthService);
  private notificationService = inject(Notification);
  
  currentUser$ = this.authService.currentUser$;
  notifications: NotificationDTO[] = [];
  unreadCount = 0;
  showNotifications = false;

  ngOnInit() {
    this.currentUser$.subscribe(user => {
      if (user) {
        this.loadNotifications(user.id);
      } else {
        this.notifications = [];
        this.unreadCount = 0;
      }
    });
  }

  loadNotifications(userId: number) {
    this.notificationService.getByRecipient(userId).subscribe({
      next: (notifs) => {
        this.notifications = notifs;
        this.unreadCount = notifs.filter(n => !n.isRead).length;
      },
      error: (err) => console.error('Failed to load notifications', err)
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications && this.unreadCount > 0) {
      this.currentUser$.subscribe(user => {
        if (user) {
          this.notificationService.markAllRead(user.id).subscribe(() => {
            this.unreadCount = 0;
            this.notifications.forEach(n => n.isRead = true);
          });
        }
      }).unsubscribe();
    }
  }
  
  logout() {
    console.log('Logout clicked');
    this.authService.logout();
    // Force redirect to login page after logout
    window.location.href = '/login';
  }
  
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
