import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InitialTransactionHistoryComponent } from '../initial-transaction-history/initial-transaction-history.component';
import { ChangeDetectorRef } from '@angular/core';
import { InstallmentTransactionHistoryComponent } from '../installment-transaction-history/installment-transaction-history.component';
import { RouterLink } from '@angular/router';

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
    InitialTransactionHistoryComponent,
    InstallmentTransactionHistoryComponent,
    RouterLink
  ],
  templateUrl: './income-report.component.html',
  styleUrls: ['./income-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeReportComponent {
  selectedYear: string = ''; // Default as empty string
  selectedMonth: string = ''; // Default as empty string
  selectedReportType: string = ''; // Default as empty string

  from!: Date;
  to!: Date;

  showTransactionHistory = false; // Only becomes true when Generate Report is clicked

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

  reportTypes = [
    { value: 'disbursement', name: 'Loan Disbursement Transactions' },
    { value: 'Installment', name: 'Loan Installment Transactions' },
  ];
   
  
  constructor(private cdr: ChangeDetectorRef) {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 10; year <= currentYear; year++) {
      this.years.push(year);
    }
  }

  // Method to generate report
  generateReport(): void {
    if (this.selectedYear !== '' && this.selectedMonth !== '' && this.selectedReportType !== '') {
      // Set the date range based on selected month and year
      this.from = new Date(Date.UTC(+this.selectedYear, +this.selectedMonth, 1, 0, 0, 0));
      this.to = new Date(Date.UTC(+this.selectedYear, +this.selectedMonth + 1, 1, 0, 0, 0));
      
  
      // Hide the transaction history first to reset components
      this.showTransactionHistory = false;
  
      // Trigger Angular change detection to hide the component
      this.cdr.detectChanges();
  
      // Show transaction history again after a short timeout (or next cycle)
      setTimeout(() => {
        this.showTransactionHistory = true;
        // Trigger change detection again after showing the new data
        this.cdr.detectChanges();
      }, 0);
  
      console.log('From:', this.from);
      console.log('To:', this.to);
    } else {
      console.warn('Please select both year, month, and report type to generate the report.');
      this.showTransactionHistory = false;
      this.cdr.detectChanges();
    }
  }
  
}
