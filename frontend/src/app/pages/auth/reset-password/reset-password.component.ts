import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CustomValidators } from '../../../utils/validators';
import { FormInputComponent } from '../../../components/shared/form-input/form-input.component';
import { PasswordStrengthComponent } from '../../../components/shared/password-strength/password-strength.component';
import { LoadingSpinnerComponent } from '../../../components/shared/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        FormInputComponent,
        PasswordStrengthComponent,
        LoadingSpinnerComponent
    ],
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
    resetPasswordForm: FormGroup;
    isLoading = false;
    resetToken: string = '';
    resetSuccess = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private toastService: ToastService
    ) {
        this.resetPasswordForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(8), CustomValidators.passwordStrength()]],
            confirmPassword: ['', [Validators.required, CustomValidators.matchPassword('password')]]
        });
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.resetToken = params['token'] || '';
        });
    }

    get passwordControl(): FormControl {
        return this.resetPasswordForm.get('password') as FormControl;
    }

    onSubmit(): void {
        if (this.resetPasswordForm.valid && !this.isLoading) {
            this.isLoading = true;

            this.authService.resetPassword(
                this.resetToken,
                this.resetPasswordForm.value.password
            ).subscribe({
                next: (response) => {
                    this.isLoading = false;
                    this.resetSuccess = true;
                    this.toastService.success(response.message);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.toastService.error('Failed to reset password. Link may be invalid or expired.');
                }
            });
        } else {
            Object.keys(this.resetPasswordForm.controls).forEach(key => {
                this.resetPasswordForm.get(key)?.markAsTouched();
            });
        }
    }

    goToLogin(): void {
        this.router.navigate(['/login']);
    }
}
