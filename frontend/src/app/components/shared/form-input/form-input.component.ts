import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl, AbstractControl } from '@angular/forms';

@Component({
    selector: 'app-form-input',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FormInputComponent),
            multi: true
        }
    ],
    template: `
    <div class="form-group" [class.has-error]="control?.invalid && control?.touched">
      <label *ngIf="label" [for]="id" class="form-label">
        {{ label }}
        <span *ngIf="required" class="required">*</span>
      </label>
      
      <div class="input-wrapper">
        <i *ngIf="icon" class="fas {{ icon }} input-icon"></i>
        
        <input
          *ngIf="type !== 'textarea'"
          [id]="id"
          [type]="type === 'password' && showPassword ? 'text' : type"
          [placeholder]="placeholder"
          [formControl]="$any(control)"
          [class.has-icon]="icon"
          [class.has-toggle]="type === 'password'"
          class="form-input"
        />
        
        <textarea
          *ngIf="type === 'textarea'"
          [id]="id"
          [placeholder]="placeholder"
          [formControl]="$any(control)"
          [rows]="rows"
          class="form-input"
        ></textarea>
        
        <button
          *ngIf="type === 'password'"
          type="button"
          class="password-toggle"
          (click)="togglePassword()"
        >
          <i class="fas" [class.fa-eye]="!showPassword" [class.fa-eye-slash]="showPassword"></i>
        </button>
      </div>
      
      <div *ngIf="control?.invalid && control?.touched" class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <span>{{ getErrorMessage() }}</span>
      </div>
      
      <p *ngIf="hint && (!control?.invalid || !control?.touched)" class="hint-text">
        {{ hint }}
      </p>
    </div>
  `,
    styles: [`
    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;

      .required {
        color: #ef4444;
        margin-left: 0.25rem;
      }
    }

    .input-wrapper {
      position: relative;
    }

    .form-input {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      font-family: inherit;
      font-size: 1rem;
      color: var(--text-primary);
      background: var(--surface-color);
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      &.has-icon {
        padding-left: 3rem;
      }

      &.has-toggle {
        padding-right: 3rem;
      }

      &::placeholder {
        color: var(--text-secondary);
        opacity: 0.6;
      }
    }

    textarea.form-input {
      resize: vertical;
      min-height: 100px;
    }

    .has-error .form-input {
      border-color: #ef4444;

      &:focus {
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary);
      pointer-events: none;
    }

    .password-toggle {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem;
      transition: color 0.2s;

      &:hover {
        color: var(--primary-color);
      }
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #ef4444;

      i {
        font-size: 0.75rem;
      }
    }

    .hint-text {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
  `]
})
export class FormInputComponent implements ControlValueAccessor {
    @Input() id: string = `input-${Math.random().toString(36).substr(2, 9)}`;
    @Input() label?: string;
    @Input() type: string = 'text';
    @Input() placeholder: string = '';
    @Input() icon?: string;
    @Input() required: boolean = false;
    @Input() hint?: string;
    @Input() rows: number = 4;
    @Input() errorMessages: { [key: string]: string } = {};
    @Input() control: AbstractControl | null = null;

    showPassword: boolean = false;

    private onChange: any = () => { };
    private onTouched: any = () => { };

    writeValue(value: any): void {
        if (this.control) {
            this.control.patchValue(value, { emitEvent: false });
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
        if (this.control) {
            this.control.valueChanges.subscribe(fn);
        }
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        if (this.control) {
            isDisabled ? this.control.disable() : this.control.enable();
        }
    }

    togglePassword(): void {
        this.showPassword = !this.showPassword;
    }

    getErrorMessage(): string {
        if (!this.control || !this.control.errors) {
            return '';
        }

        const errors = this.control.errors;
        const errorKey = Object.keys(errors)[0];

        if (this.errorMessages[errorKey]) {
            return this.errorMessages[errorKey];
        }

        const defaultMessages: { [key: string]: string } = {
            required: 'This field is required',
            email: 'Please enter a valid email address',
            invalidEmail: 'Please enter a valid email address',
            minlength: `Minimum length is ${errors['minlength']?.requiredLength} characters`,
            maxlength: `Maximum length is ${errors['maxlength']?.requiredLength} characters`,
            passwordMismatch: 'Passwords do not match',
            passwordStrength: 'Password does not meet requirements',
            invalidPhone: 'Please enter a valid phone number',
            whitespace: 'This field cannot be empty'
        };

        return defaultMessages[errorKey] || 'Invalid input';
    }
}
