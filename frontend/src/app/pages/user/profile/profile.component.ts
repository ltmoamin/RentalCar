import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService, UserProfile } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { LoadingSpinnerComponent } from '../../../components/shared/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    profile: UserProfile | null = null;
    isLoading = true;

    constructor(
        private userService: UserService,
        private authService: AuthService,
        private router: Router,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        this.isLoading = true;
        this.userService.getProfile().subscribe({
            next: (profile) => {
                this.profile = profile;
                this.isLoading = false;
            },
            error: (error) => {
                this.isLoading = false;
                this.toastService.error('Failed to load profile');
            }
        });
    }

    logout(): void {
        this.authService.logout();
        this.toastService.success('Logged out successfully');
        setTimeout(() => {
            this.router.navigate(['/login']);
        }, 1000);
    }

    getAvatarUrl(): string {
        if (!this.profile?.avatar) return '';
        if (this.profile.avatar.startsWith('http')) return this.profile.avatar;
        return `http://localhost:8082${this.profile.avatar}`;
    }

    getInitials(): string {
        if (!this.profile) return '';
        return `${this.profile.firstName.charAt(0)}${this.profile.lastName.charAt(0)}`.toUpperCase();
    }
}
