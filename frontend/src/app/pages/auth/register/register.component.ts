import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CustomValidators } from '../../../utils/validators';
import { FormInputComponent } from '../../../components/shared/form-input/form-input.component';
import { PasswordStrengthComponent } from '../../../components/shared/password-strength/password-strength.component';
import { LoadingSpinnerComponent } from '../../../components/shared/loading-spinner/loading-spinner.component';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        FormInputComponent,
        PasswordStrengthComponent,
        LoadingSpinnerComponent
    ],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    currentStep = 1;
    registerForm: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private toastService: ToastService
    ) {
        this.registerForm = this.fb.group({
            // Step 1: Personal Info
            firstName: ['', [Validators.required, CustomValidators.noWhitespace()]],
            lastName: ['', [Validators.required, CustomValidators.noWhitespace()]],
            email: ['', [Validators.required, CustomValidators.email()]],

            // Step 2: Account Details
            password: ['', [Validators.required, Validators.minLength(8), CustomValidators.passwordStrength()]],
            confirmPassword: ['', [Validators.required, CustomValidators.matchPassword('password')]],

            // Step 3: Additional Info
            phone: ['', [CustomValidators.phoneNumber()]],
            acceptTerms: [false, [Validators.requiredTrue]]
        });
    }

    get passwordControl(): FormControl {
        return this.registerForm.get('password') as FormControl;
    }

    nextStep(): void {
        const currentStepFields = this.getStepFields(this.currentStep);
        let isValid = true;

        currentStepFields.forEach(field => {
            const control = this.registerForm.get(field);
            control?.markAsTouched();
            if (control?.invalid) {
                isValid = false;
            }
        });

        if (isValid && this.currentStep < 3) {
            this.currentStep++;
        }
    }

    previousStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    getStepFields(step: number): string[] {
        const fields = {
            1: ['firstName', 'lastName', 'email'],
            2: ['password', 'confirmPassword'],
            3: ['phone', 'acceptTerms']
        };
        return fields[step as keyof typeof fields] || [];
    }

    onSubmit(): void {
        if (this.registerForm.valid && !this.isLoading) {
            this.isLoading = true;

            const { confirmPassword, acceptTerms, ...registerData } = this.registerForm.value;

            this.authService.register(registerData).subscribe({
                next: (response) => {
                    this.isLoading = false;
                    this.toastService.success('Registration successful! Welcome to RentalCar.');

                    setTimeout(() => {
                        this.router.navigate(['/profile']);
                    }, 1500);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.toastService.error('Registration failed. Email may already be in use.');
                }
            });
        } else {
            Object.keys(this.registerForm.controls).forEach(key => {
                this.registerForm.get(key)?.markAsTouched();
            });
        }
    }

    socialRegister(provider: string): void {
        this.toastService.info(`${provider} registration coming soon!`);
    }
}
