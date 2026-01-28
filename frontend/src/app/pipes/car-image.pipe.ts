import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

@Pipe({
    name: 'carImage',
    standalone: true
})
export class CarImagePipe implements PipeTransform {
    transform(imageUrl: string | undefined | null): string {
        if (!imageUrl) return 'assets/images/car-placeholder.jpg';
        if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) return imageUrl;

        // Ensure the relative path starts with a slash
        const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

        // Construct full URL using environment apiUrl (stripping /api if it's already in the path)
        const baseUrl = environment.apiUrl.replace('/api', '');
        return `${baseUrl}${path}`;
    }
}
