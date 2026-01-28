import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CloudinaryService {
    private apiUrl = `${environment.apiUrl}/chat/upload`; // Reusing the chat upload endpoint

    constructor(private http: HttpClient) { }

    upload(file: File, folder: string): Observable<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        // The backend upload endpoint usually returns the URL as a plain string or in a JSON
        return this.http.post(this.apiUrl, formData, { responseType: 'text' });
    }
}
