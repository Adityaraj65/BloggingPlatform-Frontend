import {
  Component,
  inject,
  OnInit,
  HostListener,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AsyncPipe,
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  interval,
  Subscription
} from 'rxjs';

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
export class Navbar
  implements OnInit, OnDestroy {

  // ================= INJECT =================

  private authService =
    inject(AuthService);

  private router =
    inject(Router);

  private notificationService =
    inject(Notification);

  private cdr =
    inject(ChangeDetectorRef);

  // ================= USER =================

  currentUser$ =
    this.authService.currentUser$;

  // ================= NOTIFICATIONS =================

  notifications:
    NotificationDTO[] = [];

  unreadCount = 0;

  showNotifications = false;

  // ================= PROFILE =================

  showProfileMenu = false;

  // ================= SEARCH =================

  searchQuery = '';

  // ================= POLLING =================

  private pollingSubscription?:
    Subscription;

  // ================= INIT =================

  ngOnInit(): void {

    this.currentUser$
      .subscribe({

        next: (user) => {

          if (user?.id) {

            // ================= INITIAL LOAD =================

            this.loadNotifications(
              user.id
            );

            // ================= CLEAR OLD POLLING =================

            this.pollingSubscription
              ?.unsubscribe();

            // ================= AUTO REFRESH =================

            this.pollingSubscription =
              interval(10000)
                .subscribe(() => {

                  this.loadNotifications(
                    user.id
                  );
                });

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

  // ================= DESTROY =================

  ngOnDestroy(): void {

    this.pollingSubscription
      ?.unsubscribe();
  }

  // ================= LOAD =================

  loadNotifications(
    userId: number
  ): void {

    this.notificationService
      .getByRecipient(userId)
      .subscribe({

        next: (data) => {

          // ================= SORT LATEST FIRST =================

          this.notifications =
            (data || []).sort(

              (a, b) =>

                new Date(
                  b.createdAt
                ).getTime()

                -

                new Date(
                  a.createdAt
                ).getTime()
            );

          // ================= UNREAD COUNT =================

          this.unreadCount =
            this.notifications.filter(
              n => !n.isRead
            ).length;

          // ================= FIX NG0100 =================

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'Notification load failed',
            err
          );
        }
      });
  }

  // ================= TOGGLE NOTIFICATIONS =================

  toggleNotifications(
    event: MouseEvent
  ): void {

    event.stopPropagation();

    this.showNotifications =
      !this.showNotifications;

    this.showProfileMenu = false;

    if (
      this.showNotifications &&
      this.unreadCount > 0
    ) {

      this.currentUser$
        .subscribe({

          next: (user) => {

            if (user?.id) {

              this.notificationService
                .markAllRead(user.id)
                .subscribe({

                  next: () => {

                    this.notifications
                      .forEach(n => {

                        n.isRead = true;
                      });

                    this.unreadCount = 0;

                    this.cdr.detectChanges();
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

  // ================= DELETE =================

  deleteNotification(
    id: number,
    event: MouseEvent
  ): void {

    event.stopPropagation();

    this.notificationService
      .deleteNotification(id)
      .subscribe({

        next: () => {

          this.notifications =
            this.notifications.filter(
              n =>
                n.notificationId !== id
            );

          this.unreadCount =
            this.notifications.filter(
              n => !n.isRead
            ).length;

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'Delete notification failed',
            err
          );
        }
      });
  }

  // ================= PROFILE MENU =================

  toggleProfileMenu(
    event: MouseEvent
  ): void {

    event.stopPropagation();

    this.showProfileMenu =
      !this.showProfileMenu;

    this.showNotifications = false;
  }

  // ================= CLOSE =================

  @HostListener('document:click')
  closeMenus(): void {

    this.showNotifications = false;

    this.showProfileMenu = false;
  }

  // ================= LOGOUT =================

  logout(): void {

    this.authService.logout();

    window.location.href =
      '/login';
  }

  // ================= SEARCH =================

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

  // ================= ROLE =================

  canWrite(
    role: string
  ): boolean {

    return role === 'AUTHOR'
      || role === 'ADMIN';
  }
}