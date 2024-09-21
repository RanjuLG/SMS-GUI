import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InitialTransactionHistoryComponent } from '../initial-transaction-history/initial-transaction-history.component';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-income-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    InitialTransactionHistoryComponent
  ],
  templateUrl: './income-report.component.html',
  styleUrls: ['./income-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeReportComponent {
  selectedYear!: number;
  selectedMonth!: number;

  from!: Date;
  to!: Date;

  showTransactionHistory = false;

  years: number[] = [];
  months = [
    { value: 0, name: 'January' },
    { value: 1, name: 'February' },
    { value: 2, name: 'March' },
    { value: 3, name: 'April' },
    { value: 4, name: 'May' },
    { value: 5, name: 'June' },
    { value: 6, name: 'July' },
    { value: 7, name: 'August' },
    { value: 8, name: 'September' },
    { value: 9, name: 'October' },
    { value: 10, name: 'November' },
    { value: 11, name: 'December' },
  ];

  constructor(private cdr: ChangeDetectorRef) {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 10; year <= currentYear; year++) {
      this.years.push(year);
    }
  }

  // Method to generate report
  generateReport(): void {
    if (this.selectedYear !== undefined && this.selectedMonth !== undefined) {
      // Start of the selected month (e.g., June 1, 2024)
      this.from = new Date(this.selectedYear, this.selectedMonth, 1);
      
      console.log(this.selectedYear)
      console.log(this.selectedMonth)
      // Last day of the selected month (e.g., June 30, 2024)
      this.to = new Date(this.selectedYear, this.from.getMonth() + 1, 0); 
      
      console.log('From:', this.from);
      console.log('To:', this.to);
  
      this.showTransactionHistory = true;

      this.cdr.detectChanges();
    } else {
      console.warn('Please select both year and month to generate the report.');
      this.showTransactionHistory = false;
      this.cdr.detectChanges();
    }
  }
  
}
