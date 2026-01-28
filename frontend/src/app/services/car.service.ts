import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export enum Transmission {
    MANUAL = 'MANUAL',
    AUTOMATIC = 'AUTOMATIC'
}

export enum FuelType {
    GASOLINE = 'GASOLINE',
    DIESEL = 'DIESEL',
    ELECTRIC = 'ELECTRIC',
    HYBRID = 'HYBRID'
}

export interface Car {
    id?: number;
    brand: string;
    model: string;
    year: number;
    pricePerDay: number;
    transmission: Transmission;
    fuelType: FuelType;
    available: boolean;
    imageUrl?: string;
    description?: string;
    seats: number;
    category: string;
    averageRating: number;
    reviewCount: number;
    createdAt?: string;
}

export interface CarFilters {
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
    category?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CarService {
    private apiUrl = `${environment.apiUrl}/cars`;

    constructor(private http: HttpClient) { }

    getCars(filters: CarFilters = {}): Observable<Car[]> {
        let params = new HttpParams();
        if (filters.brand) params = params.set('brand', filters.brand);
        if (filters.minPrice !== undefined) params = params.set('minPrice', filters.minPrice.toString());
        if (filters.maxPrice !== undefined) params = params.set('maxPrice', filters.maxPrice.toString());
        if (filters.available !== undefined) params = params.set('available', filters.available.toString());
        if (filters.category) params = params.set('category', filters.category);

        return this.http.get<Car[]>(this.apiUrl, { params });
    }

    getCar(id: number): Observable<Car> {
        return this.http.get<Car>(`${this.apiUrl}/${id}`);
    }

    // Admin Methods
    createCar(car: Car): Observable<Car> {
        return this.http.post<Car>(this.apiUrl, car);
    }

    updateCar(id: number, car: Car): Observable<Car> {
        return this.http.put<Car>(`${this.apiUrl}/${id}`, car);
    }

    deleteCar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    uploadCarImage(id: number, file: File): Observable<{ imageUrl: string }> {
        const formData = new FormData();
        formData.append('image', file);
        return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/${id}/image`, formData);
    }
}
