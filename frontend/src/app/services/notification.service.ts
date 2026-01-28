import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { WebSocketService } from './websocket.service';
import { environment } from '../../environments/environment';
import { Notification } from '../models/notification.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private apiUrl = `${environment.apiUrl}/notifications`;
    private unreadCountSubject = new BehaviorSubject<number>(0);
    unreadCount$ = this.unreadCountSubject.asObservable();

    private notificationsSubject = new Subject<Notification>();
    notifications$ = this.notificationsSubject.asObservable();

    private notificationStateChanged = new Subject<void>();
    notificationStateChanged$ = this.notificationStateChanged.asObservable();

    constructor(
        private http: HttpClient,
        private webSocketService: WebSocketService
    ) {
        // Initial count
        this.getUnreadCount().subscribe();

        // Listen for real-time notifications
        this.webSocketService.onNotification$.subscribe((notification: any) => {
            this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
            this.notificationsSubject.next(notification);
            this.notificationStateChanged.next();
        });
    }

    getNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(this.apiUrl);
    }

    getUnreadCount(): Observable<number> {
        return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`).pipe(
            tap(res => this.unreadCountSubject.next(res.count)),
            switchMap(res => new Observable<number>(obs => obs.next(res.count)))
        );
    }

    markAsRead(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
            tap(() => {
                const currentCount = this.unreadCountSubject.value;
                if (currentCount > 0) {
                    this.unreadCountSubject.next(currentCount - 1);
                }
                this.notificationStateChanged.next();
            })
        );
    }

    markAllAsRead(): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/read-all`, {}).pipe(
            tap(() => {
                this.unreadCountSubject.next(0);
                this.notificationStateChanged.next();
            })
        );
    }

    markChatAsRead(senderName: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/read-chat`, {}, { params: { senderName } }).pipe(
            tap(() => {
                // We can't easily know exactly how many were read, but we can refresh the list/count
                this.getUnreadCount().subscribe();
                this.notificationStateChanged.next();
            })
        );
    }
}
