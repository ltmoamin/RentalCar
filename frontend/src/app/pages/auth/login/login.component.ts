import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormInputComponent } from '../../../components/shared/form-input/form-input.component';
import { LoadingSpinnerComponent } from '../../../components/shared/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        FormInputComponent,
        LoadingSpinnerComponent
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {

    loginForm: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private toastService: ToastService
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    onSubmit(): void {
        if (this.loginForm.valid && !this.isLoading) {
            this.isLoading = true;

            this.authService.login(this.loginForm.value).subscribe({
                next: (response) => {
                    this.isLoading = false;
                    this.toastService.success('Login successful! Welcome back.');

                    setTimeout(() => {
                        if (response.user.role === 'ADMIN') {
                            this.router.navigate(['/admin/dashboard']);
                        } else {
                            this.router.navigate(['/profile']);
                        }
                    }, 1000);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.toastService.error('Invalid email or password. Please try again.');
                }
            });
        } else {
            Object.keys(this.loginForm.controls).forEach(key => {
                this.loginForm.get(key)?.markAsTouched();
            });
        }
    }

    socialLogin(provider: string): void {
        this.toastService.info(`${provider} login coming soon!`);
    }
}
