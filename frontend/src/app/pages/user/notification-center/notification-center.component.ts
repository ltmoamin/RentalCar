import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { Notification, NotificationType } from '../../../models/notification.model';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-notification-center',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './notification-center.component.html',
    styleUrls: ['./notification-center.component.scss']
})
export class NotificationCenterComponent implements OnInit {
    notifications: Notification[] = [];
    filteredNotifications: Notification[] = [];
    groupedNotifications: any[] = [];
    loading = true;
    activeFilter: 'ALL' | 'UNREAD' | 'PAYMENT' | 'SUPPORT' | 'MESSAGE' = 'ALL';

    constructor(private notificationService: NotificationService) { }

    ngOnInit(): void {
        this.loadNotifications();

        // Refresh list when notification state changes (read/unread)
        this.notificationService.notificationStateChanged$.subscribe(() => {
            this.loadNotifications();
        });
    }

    loadNotifications(): void {
        this.loading = true;
        this.notificationService.getNotifications().subscribe({
            next: (data) => {
                this.notifications = data;
                this.applyFilter();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading notifications', err);
                this.loading = false;
            }
        });
    }

    applyFilter(): void {
        switch (this.activeFilter) {
            case 'UNREAD':
                this.filteredNotifications = this.notifications.filter(n => !n.read);
                break;
            case 'PAYMENT':
                this.filteredNotifications = this.notifications.filter(n => n.type === NotificationType.PAYMENT);
                break;
            case 'SUPPORT':
                this.filteredNotifications = this.notifications.filter(n => n.type === NotificationType.SUPPORT);
                break;
            case 'MESSAGE':
                this.filteredNotifications = this.notifications.filter(n => n.type === NotificationType.MESSAGE || n.type === NotificationType.CHAT);
                break;
            default:
                this.filteredNotifications = this.notifications;
        }
        this.groupNotifications();
    }

    groupNotifications(): void {
        const groups: any[] = [];
        // Key: "SenderName|ReadStatus" -> Group
        const chatGroups = new Map<string, { count: number, latest: Notification }>();

        // Process filtered notifications
        for (const notif of this.filteredNotifications) {
            // Group ALL CHAT or MESSAGE notifications
            if (notif.type === 'CHAT' || notif.type === 'MESSAGE') {
                // Determine sender name from title "New Message from [Name]"
                const senderName = notif.title.replace('New Message from ', '').trim();
                const key = `${senderName}|${notif.read ? 'READ' : 'UNREAD'}`;

                if (chatGroups.has(key)) {
                    const group = chatGroups.get(key)!;
                    group.count++;
                    // Update latest if the current notif is newer (though list is usually sorted, we iterate)
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

        // Merge and Sort by createdAt
        this.groupedNotifications = [...aggregatedChats, ...groups].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }

    setFilter(filter: any): void {
        this.activeFilter = filter;
        this.applyFilter();
    }

    markAsRead(notification: any): void {
        if (!notification.read) {
            // Optimistic update
            notification.read = true;

            if (notification.isGrouped && notification.senderName) {
                this.notificationService.markChatAsRead(notification.senderName).subscribe({
                    next: () => {
                        this.loadNotifications();
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

    markAllAsRead(): void {
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
