import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED'
}

export interface Booking {
    id?: number;
    userId?: number;
    userFullName?: string;
    carId: number;
    carName?: string;
    carImageUrl?: string;
    startDate: string; // ISO string
    endDate: string; // ISO string
    totalPrice?: number;
    status?: BookingStatus;
    reviewed?: boolean;
    createdAt?: string;
}

export interface BookingRequest {
    carId: number;
    startDate: string;
    endDate: string;
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private apiUrl = `${environment.apiUrl}/bookings`;

    constructor(private http: HttpClient) { }

    createBooking(request: BookingRequest): Observable<Booking> {
        return this.http.post<Booking>(this.apiUrl, request);
    }

    getMyBookings(): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.apiUrl}/my`);
    }

    getAllBookings(): Observable<Booking[]> {
        return this.http.get<Booking[]>(this.apiUrl);
    }

    updateStatus(id: number, status: BookingStatus): Observable<Booking> {
        return this.http.put<Booking>(`${this.apiUrl}/${id}/status`, { status });
    }
    checkAvailability(carId: number, startDate: string, endDate: string): Observable<{ available: boolean }> {
        const params = new HttpParams()
            .set('carId', carId.toString())
            .set('startDate', startDate)
            .set('endDate', endDate);
        return this.http.get<{ available: boolean }>(`${this.apiUrl}/check-availability`, { params });
    }

    getBusyDates(carId: number): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.apiUrl}/car/${carId}/busy-dates`);
    }
}
