import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { Notification } from '../../../models/notification.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-notification-bell',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './notification-bell.component.html',
    styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
    notifications: Notification[] = [];
    groupedNotifications: any[] = [];
    unreadCount = 0;
    showDropdown = false;
    loading = false;
    viewAllLink = '/profile/notifications';
    private unreadSub?: Subscription;

    constructor(
        private notificationService: NotificationService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            if (user?.role === 'ADMIN') {
                this.viewAllLink = '/admin/notifications';
            } else {
                this.viewAllLink = '/profile/notifications';
            }
        });

        this.unreadSub = this.notificationService.unreadCount$.subscribe(count => {
            this.unreadCount = count;
        });

        // Listen for real-time notifications to update the local list immediately
        this.notificationService.notifications$.subscribe(notification => {
            this.notifications = [notification, ...this.notifications];
            this.groupNotifications();
        });

        this.loadRecentNotifications();
    }

    ngOnDestroy(): void {
        this.unreadSub?.unsubscribe();
    }

    loadRecentNotifications(): void {
        this.loading = true;
        this.notificationService.getNotifications().subscribe({
            next: (data) => {
                this.notifications = data; // Keep all loaded notifications for grouping
                this.groupNotifications();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading notifications', err);
                this.loading = false;
            }
        });
    }

    groupNotifications(): void {
        const groups: any[] = [];
        // Key: "SenderName|ReadStatus" -> Group
        const chatGroups = new Map<string, { count: number, latest: Notification }>();

        // Process notifications
        for (const notif of this.notifications) {
            // Group ALL CHAT or MESSAGE notifications
            if (notif.type === 'CHAT' || notif.type === 'MESSAGE') {
                // Determine sender name from title "New Message from [Name]"
                const senderName = notif.title.replace('New Message from ', '').trim();
                const key = `${senderName}|${notif.read ? 'READ' : 'UNREAD'}`;

                if (chatGroups.has(key)) {
                    const group = chatGroups.get(key)!;
                    group.count++;
                } else {
                    chatGroups.set(key, {
                        count: 1,
                        latest: notif
                    });
                }
            } else {
                // Add non-chat notifications directly
                groups.push(notif);
            }
        }

        // Reconstruct list with aggregated chat items
        const aggregatedChats: any[] = [];
        chatGroups.forEach((val, key) => {
            const [senderName, status] = key.split('|');
            const isRead = status === 'READ';

            aggregatedChats.push({
                ...val.latest,
                title: val.count > 1 ? `${val.count} ${isRead ? '' : 'new '}messages from ${senderName}` : val.latest.title,
                message: val.count > 1 ? (isRead ? 'View conversation history' : 'Tap to view new messages') : val.latest.message,
                read: isRead,
                isGrouped: val.count > 1,
                count: val.count,
                senderName: senderName
            });
        });

        // Merge and Sort by createdAt, slice to top 5
        this.groupedNotifications = [...aggregatedChats, ...groups].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }).slice(0, 5);
    }

    toggleDropdown(event: Event): void {
        event.stopPropagation();
        this.showDropdown = !this.showDropdown;
        if (this.showDropdown) {
            this.loadRecentNotifications();
        }
    }

    @HostListener('document:click')
    closeDropdown(): void {
        this.showDropdown = false;
    }

    markAsRead(event: Event, notification: any): void {
        event.stopPropagation();
        if (!notification.read) {
            // Optimistic update
            notification.read = true;

            if (notification.isGrouped && notification.senderName) {
                this.notificationService.markChatAsRead(notification.senderName).subscribe({
                    next: () => {
                        this.loadRecentNotifications();
                    },
                    error: () => {
                        notification.read = false;
                    }
                });
            } else {
                this.notificationService.markAsRead(notification.id).subscribe({
                    error: () => {
                        notification.read = false;
                    }
                });
            }
        }
    }

    markAllAsRead(event: Event): void {
        event.stopPropagation();
        this.notificationService.markAllAsRead().subscribe(() => {
            this.notifications.forEach(n => n.read = true);
        });
    }

    getIconClass(type: string): string {
        switch (type) {
            case 'MESSAGE': return 'fas fa-comment-dots';
            case 'SUPPORT': return 'fas fa-headset';
            case 'PAYMENT': return 'fas fa-credit-card';
            case 'REVIEW': return 'fas fa-star';
            case 'ACCOUNT': return 'fas fa-user-shield';
            case 'BOOKING': return 'fas fa-calendar-check';
            case 'CHAT': return 'fas fa-comments';
            case 'CAR_UPDATE': return 'fas fa-car-side';
            default: return 'fas fa-bell';
        }
    }
}
