import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
    SupportTicket,
    SupportTicketRequest,
    SupportTicketResponse,
    SupportMessage,
    SupportMessageRequest,
    SupportTicketStatus
} from '../models/support-ticket.model';

@Injectable({
    providedIn: 'root'
})
export class SupportService {
    private apiUrl = `${environment.apiUrl}/support`;

    constructor(private http: HttpClient) { }

    createTicket(request: SupportTicketRequest): Observable<SupportTicket> {
        return this.http.post<SupportTicket>(this.apiUrl, request);
    }

    getMyTickets(): Observable<SupportTicket[]> {
        return this.http.get<SupportTicket[]>(`${this.apiUrl}/my-tickets`);
    }

    getTicketById(id: number): Observable<SupportTicket> {
        return this.http.get<SupportTicket>(`${this.apiUrl}/${id}`);
    }

    addMessage(ticketId: number, message: SupportMessageRequest): Observable<SupportMessage> {
        return this.http.post<SupportMessage>(`${this.apiUrl}/${ticketId}/messages`, message);
    }

    // Admin methods
    getAllTickets(): Observable<SupportTicket[]> {
        return this.http.get<SupportTicket[]>(`${this.apiUrl}/admin/all`);
    }

    updateTicketStatus(ticketId: number, status: SupportTicketStatus): Observable<SupportTicket> {
        return this.http.patch<SupportTicket>(`${this.apiUrl}/admin/${ticketId}/status?status=${status}`, {});
    }
}
