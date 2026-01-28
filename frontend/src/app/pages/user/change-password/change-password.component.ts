import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CustomValidators } from '../../../utils/validators';
import { FormInputComponent } from '../../../components/shared/form-input/form-input.component';
import { PasswordStrengthComponent } from '../../../components/shared/password-strength/password-strength.component';
import { LoadingSpinnerComponent } from '../../../components/shared/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, FormInputComponent, PasswordStrengthComponent, LoadingSpinnerComponent],
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
    changePasswordForm: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private router: Router,
        private toastService: ToastService
    ) {
        this.changePasswordForm = this.fb.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(8), CustomValidators.passwordStrength()]],
            confirmPassword: ['', [Validators.required, CustomValidators.matchPassword('newPassword')]]
        });
    }

    get newPasswordControl(): FormControl {
        return this.changePasswordForm.get('newPassword') as FormControl;
    }

    onSubmit(): void {
        if (this.changePasswordForm.valid && !this.isLoading) {
            this.isLoading = true;

            const { currentPassword, newPassword } = this.changePasswordForm.value;

            this.userService.changePassword({ currentPassword, newPassword }).subscribe({
                next: (response) => {
                    this.isLoading = false;
                    this.toastService.success(response.message);
                    setTimeout(() => {
                        this.router.navigate(['/profile']);
                    }, 1500);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.toastService.error('Failed to change password. Current password may be incorrect.');
                }
            });
        } else {
            Object.keys(this.changePasswordForm.controls).forEach(key => {
                this.changePasswordForm.get(key)?.markAsTouched();
            });
        }
    }
}
