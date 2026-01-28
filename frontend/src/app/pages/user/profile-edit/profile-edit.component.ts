import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService, UserProfile } from '../../../services/user.service';
import { CustomValidators } from '../../../utils/validators';
import { FormInputComponent } from '../../../components/shared/form-input/form-input.component';
import { LoadingSpinnerComponent } from '../../../components/shared/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-profile-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, FormInputComponent, LoadingSpinnerComponent],
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
    profileForm: FormGroup;
    isLoading = false;
    avatarPreview: string | null = null;
    selectedFile: File | null = null;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private router: Router,
        private toastService: ToastService
    ) {
        this.profileForm = this.fb.group({
            firstName: ['', [Validators.required, CustomValidators.noWhitespace()]],
            lastName: ['', [Validators.required, CustomValidators.noWhitespace()]],
            email: ['', [Validators.required, CustomValidators.email()]],
            phone: ['', [CustomValidators.phoneNumber()]],
            address: [''],
            dateOfBirth: [''],
            drivingLicenseNumber: ['']
        });
    }

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        this.isLoading = true;
        this.userService.getProfile().subscribe({
            next: (profile) => {
                this.profileForm.patchValue(profile);
                this.avatarPreview = this.getAvatarUrl(profile.avatar);
                this.isLoading = false;
            },
            error: (error) => {
                this.isLoading = false;
                this.toastService.error('Failed to load profile');
            }
        });
    }

    getAvatarUrl(avatar: string | undefined): string | null {
        if (!avatar) return null;
        if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
        return `http://localhost:8082${avatar}`;
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.avatarPreview = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    onSubmit(): void {
        if (this.profileForm.valid && !this.isLoading) {
            this.isLoading = true;

            // Upload avatar if selected
            if (this.selectedFile) {
                this.userService.uploadAvatar(this.selectedFile).subscribe({
                    next: (response) => {
                        this.updateProfile({ ...this.profileForm.value, avatar: response.avatarUrl });
                    },
                    error: (error) => {
                        this.isLoading = false;
                        this.toastService.error('Failed to upload avatar');
                    }
                });
            } else {
                this.updateProfile(this.profileForm.value);
            }
        } else {
            Object.keys(this.profileForm.controls).forEach(key => {
                this.profileForm.get(key)?.markAsTouched();
            });
        }
    }

    private updateProfile(data: Partial<UserProfile>): void {
        this.userService.updateProfile(data).subscribe({
            next: (profile) => {
                this.isLoading = false;
                this.toastService.success('Profile updated successfully');
                setTimeout(() => {
                    this.router.navigate(['/profile']);
                }, 1000);
            },
            error: (error) => {
                this.isLoading = false;
                this.toastService.error('Failed to update profile');
            }
        });
    }
}
