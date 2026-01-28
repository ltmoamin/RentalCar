import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CustomValidators } from '../../../utils/validators';
import { FormInputComponent } from '../../../components/shared/form-input/form-input.component';
import { LoadingSpinnerComponent } from '../../../components/shared/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        FormInputComponent,
        LoadingSpinnerComponent
    ],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
    forgotPasswordForm: FormGroup;
    isLoading = false;
    emailSent = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private toastService: ToastService
    ) {
        this.forgotPasswordForm = this.fb.group({
            email: ['', [Validators.required, CustomValidators.email()]]
        });
    }

    onSubmit(): void {
        if (this.forgotPasswordForm.valid && !this.isLoading) {
            this.isLoading = true;

            this.authService.forgotPassword(this.forgotPasswordForm.value.email).subscribe({
                next: (response) => {
                    this.isLoading = false;
                    this.emailSent = true;
                    this.toastService.success(response.message);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.toastService.error('Failed to send reset email. Please try again.');
                }
            });
        } else {
            this.forgotPasswordForm.get('email')?.markAsTouched();
        }
    }

    resendEmail(): void {
        this.emailSent = false;
        this.onSubmit();
    }
}
