import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
    totalRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    totalBookings: number;
    bookingsToday: number;
    bookingsThisMonth: number;
    activeBookings: number;
    completedBookings: number;
    canceledBookings: number;
    revenueTrends: RevenueTrend[];
    mostRentedCars: MostRentedCar[];
    recentBookings: any[]; // Use Booking type if available
}

export interface RevenueTrend {
    label: string;
    value: number;
}

export interface MostRentedCar {
    carName: string;
    rentalCount: number;
    totalRevenue: number;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/admin/dashboard/stats`;

    constructor(private http: HttpClient) { }

    getStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(this.apiUrl);
    }
}
