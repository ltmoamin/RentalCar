import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter',
    standalone: true
})
export class FilterPipe implements PipeTransform {
    transform(items: any[], field: string, value: any): any {
        if (!items || !value || value === 'ALL') {
            return items ? items.length : 0;
        }
        return items.filter(item => item[field] === value).length;
    }
}
