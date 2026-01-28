import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED'
}

export interface PaymentRequest {
    bookingId: number;
    currency?: string;
}

export interface PaymentResponse {
    id: number;
    bookingId: number;
    clientSecret: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    receiptUrl?: string;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = `${environment.apiUrl}/payments`;

    constructor(private http: HttpClient) { }

    createPaymentIntent(request: PaymentRequest): Observable<PaymentResponse> {
        return this.http.post<PaymentResponse>(`${this.apiUrl}/create-payment-intent`, request);
    }

    confirmPaymentSuccess(paymentIntentId: string): Observable<string> {
        return this.http.post(`${this.apiUrl}/confirm-success/${paymentIntentId}`, {}, { responseType: 'text' });
    }
}
