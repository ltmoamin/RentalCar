import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserListItem } from '../../../services/user.service';
import { LoadingSpinnerComponent } from '../../../components/shared/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-role-management',
    standalone: true,
    imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
    templateUrl: './role-management.component.html',
    styleUrls: ['./role-management.component.scss']
})
export class RoleManagementComponent implements OnInit {

    users: UserListItem[] = [];
    filteredUsers: UserListItem[] = [];
    isLoading = true;
    searchTerm = '';
    filterRole: 'all' | 'USER' | 'ADMIN' = 'all';
    filterStatus: 'all' | 'active' | 'inactive' = 'all';

    constructor(
        private userService: UserService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.isLoading = true;
        this.userService.getAllUsers().subscribe({
            next: (users) => {
                this.users = users;
                this.applyFilters();
                this.isLoading = false;
            },
            error: (error) => {
                this.isLoading = false;
                this.toastService.error('Failed to load users');
            }
        });
    }

    applyFilters(): void {
        this.filteredUsers = this.users.filter(user => {
            const matchesSearch = user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesRole = this.filterRole === 'all' || user.role === this.filterRole;

            let matchesStatus = true;
            if (this.filterStatus === 'active') matchesStatus = user.enabled;
            else if (this.filterStatus === 'inactive') matchesStatus = !user.enabled;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }

    onSearchChange(): void {
        this.applyFilters();
    }

    onRoleFilterChange(): void {
        this.applyFilters();
    }

    onStatusFilterChange(): void {
        this.applyFilters();
    }

    updateUserRole(user: UserListItem, newRole: 'USER' | 'ADMIN'): void {
        this.userService.updateUserRole(user.id, newRole).subscribe({
            next: (updatedUser) => {
                user.role = newRole;
                this.toastService.success(`User role updated to ${newRole}`);
            },
            error: (error) => {
                this.toastService.error('Failed to update user role');
            }
        });
    }

    toggleUserStatus(user: UserListItem): void {
        const newEnabled = !user.enabled;
        this.userService.updateUserStatus(user.id, newEnabled).subscribe({
            next: (updatedUser) => {
                user.enabled = newEnabled;
                this.toastService.success(`User ${newEnabled ? 'activated' : 'deactivated'}`);
            },
            error: (error) => {
                this.toastService.error('Failed to update user status');
            }
        });
    }
}
