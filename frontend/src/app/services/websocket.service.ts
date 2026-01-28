import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ChatMessage } from './chat.service';

import { environment } from '../../environments/environment';

export interface TypingIndicator {
    conversationId: number;
    userId: number;
    userName: string;
    isTyping: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
    private client: Client | null = null;
    private connected$ = new BehaviorSubject<boolean>(false);
    private messages$ = new Subject<ChatMessage>();
    private readReceipts$ = new Subject<number>();
    private typing$ = new Subject<TypingIndicator>();
    private notifications$ = new Subject<any>();

    get isConnected$(): Observable<boolean> {
        return this.connected$.asObservable();
    }

    get onMessage$(): Observable<ChatMessage> {
        return this.messages$.asObservable();
    }

    get onReadReceipt$(): Observable<number> {
        return this.readReceipts$.asObservable();
    }

    get onTyping$(): Observable<TypingIndicator> {
        return this.typing$.asObservable();
    }
    get onNotification$(): Observable<any> {
        return this.notifications$.asObservable();
    }

    connect(userEmail: string): void {
        if (this.client?.active) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) return;

        this.client = new Client({
            webSocketFactory: () => new SockJS(environment.wsUrl),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: (str) => {
                console.log('STOMP Debug:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        this.client.onConnect = () => {
            console.log('WebSocket connected');
            this.connected$.next(true);

            // Subscribe to personal message queue
            this.client?.subscribe(`/user/queue/messages`, (message: IMessage) => {
                const chatMessage: ChatMessage = JSON.parse(message.body);
                this.messages$.next(chatMessage);
            });

            // Subscribe to read receipts
            this.client?.subscribe(`/user/queue/read-receipts`, (message: IMessage) => {
                const conversationId: number = JSON.parse(message.body);
                this.readReceipts$.next(conversationId);
            });

            // Subscribe to typing indicators
            this.client?.subscribe(`/user/queue/typing`, (message: IMessage) => {
                const typing: TypingIndicator = JSON.parse(message.body);
                this.typing$.next(typing);
            });

            // Subscribe to notifications
            this.client?.subscribe(`/user/queue/notifications`, (message: IMessage) => {
                const notification = JSON.parse(message.body);
                this.notifications$.next(notification);
            });
        };

        this.client.onDisconnect = () => {
            console.log('WebSocket disconnected');
            this.connected$.next(false);
        };

        this.client.onStompError = (frame) => {
            console.error('STOMP error:', frame);
        };

        this.client.activate();
    }

    disconnect(): void {
        if (this.client?.connected) {
            this.client.deactivate();
        }
    }

    sendTypingIndicator(conversationId: number, isTyping: boolean): void {
        if (this.client?.connected) {
            this.client.publish({
                destination: '/app/chat.typing',
                body: JSON.stringify({ conversationId, isTyping })
            });
        }
    }

    markAsRead(conversationId: number): void {
        if (this.client?.connected) {
            this.client.publish({
                destination: '/app/chat.markRead',
                body: JSON.stringify({ conversationId })
            });
        }
    }

    ngOnDestroy(): void {
        this.disconnect();
        this.messages$.complete();
        this.readReceipts$.complete();
        this.typing$.complete();
        this.connected$.complete();
    }
}
