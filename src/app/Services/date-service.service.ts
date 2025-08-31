import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }

  formatDateTime(datetimeString: string): string {
    // Since backend sends local time, treat the string as local time
    // Remove 'Z' if present and parse as local time
    const cleanDateString = datetimeString.replace('Z', '');
    const date = new Date(cleanDateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  formatDate(datetimeString: string): string {
    // Since backend sends local time, treat the string as local time
    // Remove 'Z' if present and parse as local time
    const cleanDateString = datetimeString.replace('Z', '');
    const date = new Date(cleanDateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
