import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { calculatePasswordStrength } from '../../../utils/validators';

@Component({
    selector: 'app-password-strength',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="password-strength" *ngIf="password">
      <div class="strength-meter">
        <div class="strength-bar" 
             [style.width.%]="strength.score" 
             [style.background-color]="strength.color"></div>
      </div>
      <div class="strength-label" [style.color]="strength.color">
        {{ strength.label }}
      </div>
      
      <div class="requirements" *ngIf="showRequirements">
        <p class="requirements-title">Password must contain:</p>
        <ul>
          <li [class.valid]="hasMinLength">
            <i class="fas" [class.fa-check]="hasMinLength" [class.fa-times]="!hasMinLength"></i>
            At least 8 characters
          </li>
          <li [class.valid]="hasUpperCase">
            <i class="fas" [class.fa-check]="hasUpperCase" [class.fa-times]="!hasUpperCase"></i>
            One uppercase letter
          </li>
          <li [class.valid]="hasLowerCase">
            <i class="fas" [class.fa-check]="hasLowerCase" [class.fa-times]="!hasLowerCase"></i>
            One lowercase letter
          </li>
          <li [class.valid]="hasNumber">
            <i class="fas" [class.fa-check]="hasNumber" [class.fa-times]="!hasNumber"></i>
            One number
          </li>
          <li [class.valid]="hasSpecialChar">
            <i class="fas" [class.fa-check]="hasSpecialChar" [class.fa-times]="!hasSpecialChar"></i>
            One special character
          </li>
        </ul>
      </div>
    </div>
  `,
    styles: [`
    .password-strength {
      margin-top: 0.5rem;
    }

    .strength-meter {
      height: 4px;
      background: var(--border-color);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .strength-bar {
      height: 100%;
      transition: all 0.3s ease;
      border-radius: 2px;
    }

    .strength-label {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }

    .requirements {
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(59, 130, 246, 0.05);
      border-radius: var(--radius-md);
    }

    .requirements-title {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    .requirements ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .requirements li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
      padding: 0.25rem 0;

      i {
        width: 16px;
        color: #ef4444;
      }

      &.valid {
        color: #10b981;

        i {
          color: #10b981;
        }
      }
    }
  `]
})
export class PasswordStrengthComponent implements OnInit, OnDestroy {
    @Input() passwordControl!: FormControl;
    @Input() showRequirements: boolean = true;

    password: string = '';
    strength = { score: 0, label: '', color: '' };

    hasMinLength = false;
    hasUpperCase = false;
    hasLowerCase = false;
    hasNumber = false;
    hasSpecialChar = false;

    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        if (this.passwordControl) {
            this.passwordControl.valueChanges
                .pipe(takeUntil(this.destroy$))
                .subscribe(value => {
                    this.password = value || '';
                    this.updateStrength();
                    this.updateRequirements();
                });
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private updateStrength(): void {
        this.strength = calculatePasswordStrength(this.password);
    }

    private updateRequirements(): void {
        this.hasMinLength = this.password.length >= 8;
        this.hasUpperCase = /[A-Z]/.test(this.password);
        this.hasLowerCase = /[a-z]/.test(this.password);
        this.hasNumber = /[0-9]/.test(this.password);
        this.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);
    }
}
