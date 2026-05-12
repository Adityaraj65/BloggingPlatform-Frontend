import { Component, inject, OnInit, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AuthService
} from '../../../core/services/auth';

import {
  Notification,
  NotificationDTO
} from '../../../core/services/notification';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    AsyncPipe,
    CommonModule,
    FormsModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {

  private authService = inject(AuthService);

  private router = inject(Router);

  private notificationService =
    inject(Notification);

  currentUser$ =
    this.authService.currentUser$;

  notifications: NotificationDTO[] = [];

  unreadCount = 0;

  showNotifications = false;

  showProfileMenu = false;

  searchQuery = '';

  ngOnInit(): void {

    this.currentUser$.subscribe({

      next: (user) => {

        if (user?.id) {

          this.loadNotifications(user.id);

        } else {

          this.notifications = [];

          this.unreadCount = 0;
        }
      },

      error: (err) => {

        console.error(
          'Navbar user load failed',
          err
        );
      }
    });
  }

  loadNotifications(userId: number): void {

    this.notificationService
      .getByRecipient(userId)
      .subscribe({

        next: (data) => {

          this.notifications = data || [];

          this.unreadCount =
            this.notifications.filter(
              n => !n.isRead
            ).length;
        },

        error: (err) => {

          console.error(
            'Notification load failed',
            err
          );
        }
      });
  }

  toggleNotifications(event: MouseEvent): void {

    event.stopPropagation();

    this.showNotifications =
      !this.showNotifications;

    this.showProfileMenu = false;

    if (
      this.showNotifications &&
      this.unreadCount > 0
    ) {

      this.currentUser$.subscribe({

        next: (user) => {

          if (user?.id) {

            this.notificationService
              .markAllRead(user.id)
              .subscribe({

                next: () => {

                  this.notifications.forEach(
                    n => n.isRead = true
                  );

                  this.unreadCount = 0;
                },

                error: (err) => {

                  console.error(
                    'Mark read failed',
                    err
                  );
                }
              });
          }
        }
      });
    }
  }

  toggleProfileMenu(event: MouseEvent): void {

    event.stopPropagation();

    this.showProfileMenu =
      !this.showProfileMenu;

    this.showNotifications = false;
  }

  @HostListener('document:click')
  closeMenus(): void {

    this.showNotifications = false;

    this.showProfileMenu = false;
  }

  logout(): void {

    this.authService.logout();

    window.location.href = '/login';
  }

  searchPosts(): void {

    const query =
      this.searchQuery.trim();

    this.router.navigate(
      ['/'],
      {
        queryParams: query
          ? { search: query }
          : {}
      }
    );
  }

  canWrite(role: string): boolean {

    return role === 'AUTHOR'
      || role === 'ADMIN';
  }
}
