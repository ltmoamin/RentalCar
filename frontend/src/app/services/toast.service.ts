import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
    id: number;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastSubject = new Subject<Toast>();
    toast$ = this.toastSubject.asObservable();
    private nextId = 1;

    success(message: string, duration: number = 5000): void {
        this.show('success', message, duration);
    }

    error(message: string, duration: number = 5000): void {
        this.show('error', message, duration);
    }

    warning(message: string, duration: number = 5000): void {
        this.show('warning', message, duration);
    }

    info(message: string, duration: number = 5000): void {
        this.show('info', message, duration);
    }

    private show(type: Toast['type'], message: string, duration: number): void {
        this.toastSubject.next({
            id: this.nextId++,
            type,
            message,
            duration
        });
    }
}
