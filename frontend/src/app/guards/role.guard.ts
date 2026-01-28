import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.getCurrentUser();
    const requiredRole = route.data['role'] as string;

    if (user && user.role === requiredRole) {
        return true;
    }

    // Redirect to home if user doesn't have required role
    router.navigate(['/']);
    return false;
};
