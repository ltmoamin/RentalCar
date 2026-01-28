import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { ToastComponent } from './components/shared/toast/toast.component';
import { AuthService } from './services/auth.service';
import { WebSocketService } from './services/websocket.service';
import { ToastService } from './services/toast.service';
import { NotificationService } from './services/notification.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'RentalCar';
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private toastService: ToastService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.webSocketService.connect(user.email);
        } else {
          this.webSocketService.disconnect();
        }
      });

    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notif: any) => {
        // Only show toast if it's not a CHAT notification (already handled or redundant)
        // Actually, let's show all notifications as toasts except if they are redundant with messages
        if (notif.type !== 'CHAT') {
          this.toastService.info(`${notif.title}: ${notif.message}`);
        }
      });

    this.webSocketService.onMessage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        // Show notification if user is not on the chat page
        const isChatPage = this.router.url.includes('/chat') || this.router.url.includes('/admin/chat');
        if (!isChatPage && message.senderId.toString() !== this.authService.getCurrentUser()?.id) {
          this.toastService.info(
            `New message from ${message.senderName}: ${message.content || 'Sent an attachment'}`
          );
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.webSocketService.disconnect();
  }
}
