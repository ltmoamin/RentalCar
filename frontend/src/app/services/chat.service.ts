import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
    id?: number;
    senderId: number;
    senderName: string;
    senderAvatar?: string;
    receiverId: number;
    receiverName: string;
    conversationId: number;
    content?: string;
    mediaUrl?: string;
    messageType: 'TEXT' | 'VOICE' | 'IMAGE' | 'VIDEO';
    read: boolean;
    readAt?: string;
    createdAt: string;
}

export interface ChatConversation {
    id: number;
    userId: number;
    userName: string;
    userAvatar?: string;
    adminId: number;
    adminName: string;
    adminAvatar?: string;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
    createdAt: string;
    pinned: boolean;
    archived: boolean;
}

export interface SendMessageRequest {
    receiverId: number;
    content?: string;
    mediaUrl?: string;
    messageType: 'TEXT' | 'VOICE' | 'IMAGE' | 'VIDEO';
}

export interface ChatAdmin {
    id: number;
    name: string;
    avatar: string;
}

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = `${environment.apiUrl}/chat`;

    constructor(private http: HttpClient) { }

    getConversations(): Observable<ChatConversation[]> {
        return this.http.get<ChatConversation[]>(`${this.apiUrl}/conversations`);
    }

    getMessages(conversationId: number, page: number = 0, size: number = 50): Observable<any> {
        return this.http.get(`${this.apiUrl}/messages/${conversationId}?page=${page}&size=${size}`);
    }

    sendMessage(request: SendMessageRequest): Observable<ChatMessage> {
        return this.http.post<ChatMessage>(`${this.apiUrl}/send`, request);
    }

    uploadMedia(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData);
    }

    markAsRead(conversationId: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/read/${conversationId}`, {});
    }

    startConversation(userId: number): Observable<ChatConversation> {
        return this.http.post<ChatConversation>(`${this.apiUrl}/start`, { userId });
    }

    getAvailableAdmins(): Observable<ChatAdmin[]> {
        return this.http.get<ChatAdmin[]>(`${this.apiUrl}/admins`);
    }

    togglePin(conversationId: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/pin/${conversationId}`, {});
    }

    toggleArchive(conversationId: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/archive/${conversationId}`, {});
    }

    deleteConversation(conversationId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${conversationId}`);
    }
}
