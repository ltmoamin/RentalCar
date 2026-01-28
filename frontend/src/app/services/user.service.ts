import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from './auth.service';
import { environment } from '../../environments/environment';

export interface UserProfile extends User {
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    drivingLicenseNumber?: string;
    createdAt?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface UserListItem {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'USER' | 'ADMIN';
    enabled: boolean;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private userApiUrl = `${environment.apiUrl}/user`;
    private adminApiUrl = `${environment.apiUrl}/admin`;

    constructor(private http: HttpClient) { }

    getProfile(): Observable<UserProfile> {
        return this.http.get<UserProfile>(`${this.userApiUrl}/profile`);
    }

    updateProfile(data: Partial<UserProfile>): Observable<UserProfile> {
        return this.http.put<UserProfile>(`${this.userApiUrl}/profile`, data).pipe(
            tap(profile => {
                // Update local storage if it's the current user
                const user: User = {
                    id: profile.id,
                    email: profile.email,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    role: profile.role,
                    avatar: profile.avatar
                };
                localStorage.setItem('user', JSON.stringify(user));
            })
        );
    }

    uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
        const formData = new FormData();
        formData.append('avatar', file);
        return this.http.post<{ avatarUrl: string }>(`${this.userApiUrl}/avatar`, formData);
    }

    changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.userApiUrl}/change-password`, data);
    }

    // Admin functions
    getAllUsers(): Observable<UserListItem[]> {
        return this.http.get<UserListItem[]>(`${this.adminApiUrl}/users`);
    }

    updateUserRole(userId: string, role: 'USER' | 'ADMIN'): Observable<UserListItem> {
        return this.http.put<UserListItem>(`${this.adminApiUrl}/users/${userId}/role`, { role });
    }

    updateUserStatus(userId: string, enabled: boolean): Observable<UserListItem> {
        return this.http.put<UserListItem>(`${this.adminApiUrl}/users/${userId}/status`, { enabled });
    }
}
