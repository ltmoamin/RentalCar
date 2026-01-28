import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
    static passwordStrength(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;

            if (!value) {
                return null;
            }

            const hasUpperCase = /[A-Z]/.test(value);
            const hasLowerCase = /[a-z]/.test(value);
            const hasNumeric = /[0-9]/.test(value);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
            const isLengthValid = value.length >= 8;

            const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && isLengthValid;

            return !passwordValid ? {
                passwordStrength: {
                    hasUpperCase,
                    hasLowerCase,
                    hasNumeric,
                    hasSpecialChar,
                    isLengthValid
                }
            } : null;
        };
    }

    static matchPassword(passwordField: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.parent) {
                return null;
            }

            const password = control.parent.get(passwordField);
            const confirmPassword = control;

            if (!password || !confirmPassword) {
                return null;
            }

            if (confirmPassword.value === '') {
                return null;
            }

            if (password.value === confirmPassword.value) {
                return null;
            }

            return { passwordMismatch: true };
        };
    }

    static phoneNumber(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }

            const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
            const valid = phoneRegex.test(control.value);

            return valid ? null : { invalidPhone: true };
        };
    }

    static email(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            const valid = emailRegex.test(control.value);

            return valid ? null : { invalidEmail: true };
        };
    }

    static noWhitespace(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }

            const isWhitespace = (control.value || '').trim().length === 0;
            return isWhitespace ? { whitespace: true } : null;
        };
    }
}

export function calculatePasswordStrength(password: string): {
    score: number;
    label: string;
    color: string;
} {
    let score = 0;

    if (!password) {
        return { score: 0, label: 'No Password', color: '#cbd5e1' };
    }

    // Length check
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Character variety
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

    // Score to label and color
    if (score < 40) {
        return { score, label: 'Weak', color: '#ef4444' };
    } else if (score < 70) {
        return { score, label: 'Medium', color: '#f59e0b' };
    } else {
        return { score, label: 'Strong', color: '#10b981' };
    }
}
