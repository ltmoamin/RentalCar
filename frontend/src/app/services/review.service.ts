import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Review {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    userFullName: string;
    carName: string;
    carId: number;
    status: 'PENDING' | 'APPROVED' | 'HIDDEN';
}

export interface ReviewRequest {
    bookingId: number;
    rating: number;
    comment: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private apiUrl = `${environment.apiUrl}/reviews`;

    constructor(private http: HttpClient) { }

    getCarReviews(carId: number): Observable<Review[]> {
        return this.http.get<Review[]>(`${this.apiUrl}/car/${carId}`);
    }

    submitReview(request: ReviewRequest): Observable<Review> {
        return this.http.post<Review>(this.apiUrl, request);
    }

    // Admin endpoints
    getAllReviews(): Observable<Review[]> {
        return this.http.get<Review[]>(`${this.apiUrl}/admin/all`);
    }

    updateStatus(id: number, status: string): Observable<Review> {
        const params = new HttpParams().set('status', status);
        return this.http.put<Review>(`${this.apiUrl}/admin/${id}/status`, {}, { params });
    }

    deleteReview(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/admin/${id}`);
    }
}
