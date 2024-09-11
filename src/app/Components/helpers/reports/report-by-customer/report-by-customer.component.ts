import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ReportByCustomer } from '../../../reports/reports.model';
import { ApiService } from '../../../../Services/api-service.service';
import Swal from 'sweetalert2';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatHint } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, JsonPipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-report-by-customer',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    JsonPipe,
    MatDatepickerModule,
    MatHint,
    MatFormFieldModule, // Import Material Form Field Module
    MatInputModule,
  ],
  templateUrl: './report-by-customer.component.html',
  styleUrl: './report-by-customer.component.scss'
})
export class ReportByCustomerComponent {
  form: FormGroup;
  report: ReportByCustomer | null = null;
  error: string | null = null;
  showInstallments: boolean[] = []; // Array to track which loan's installments are visible

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    // Initialize the form group
    this.form = this.fb.group({
      customerNIC: [''],
    });
  }

  // Fetch report by customer NIC
  getReportByCustomer(customerNIC: string): Observable<ReportByCustomer> {
    return this.apiService.getReportByCustomer(customerNIC).pipe(
      catchError((error) => {
        this.showError('Failed to fetch report. Please check the NIC or try again later.');
        return throwError(() => error);
      })
    );
  }

  // On form submission
  onSubmit(): void {
    const customerNIC = this.form.get('customerNIC')?.value;
    if (customerNIC) {
      this.showConfirmation().then((result) => {
        if (result.isConfirmed) {
          this.getReportByCustomer(customerNIC).subscribe({
            next: (data) => {
              this.report = data;
              this.error = null;
              this.showInstallments = new Array(data.loans.length).fill(false); // Initialize the array for toggling
              Swal.fire('Success', 'Report fetched successfully!', 'success');
            },
            error: (err) => {
              console.error(err);
              this.showError('Failed to fetch the report. Please try again later.');
            },
          });
        }
      });
    }
  }

  // Toggle the installment visibility for a specific loan
  toggleInstallments(index: number): void {
    this.showInstallments[index] = !this.showInstallments[index];
  }

  // SweetAlert2 confirmation
  showConfirmation() {
    return Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to fetch the report for this customer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, fetch it!',
      cancelButtonText: 'No, cancel!',
    });
  }

  // SweetAlert2 error handling
  showError(errorMessage: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage,
    });
  }
}
