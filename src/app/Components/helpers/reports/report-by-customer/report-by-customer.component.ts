import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ReportByCustomer, Loan } from '../../../reports/reports.model';
import { ApiService } from '../../../../Services/api-service.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoanInfoComponent } from '../loan-info/loan-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-report-by-customer',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    LoanInfoComponent,
  ],
  templateUrl: './report-by-customer.component.html',
  styleUrls: ['./report-by-customer.component.scss'],
})
export class ReportByCustomerComponent implements OnInit {
  form: FormGroup;
  report: ReportByCustomer | null = null;
  error: string | null = null;
  showInstallments: boolean[] = []; // Array to track which loan's installments are visible
  selectedLoan: Loan | null = null;  // Stores the currently selected loan for modal

  // Pagination properties
  page: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [1, 5, 10, 15, 20];
  paginatedLoans: Loan[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private modalService: NgbModal,
  ) {
    // Initialize the form group
    this.form = this.fb.group({
      customerNIC: [''],
    });
  }

  ngOnInit(): void {
    // Any initialization logic here
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
      // Removed showConfirmation logic
      this.getReportByCustomer(customerNIC).subscribe({
        next: (data) => {
          this.report = data;
          this.error = null;
          this.showInstallments = new Array(data.loans.length).fill(false); // Initialize the array for toggling
          this.updatePaginatedLoans();
          Swal.fire('Success', 'Report fetched successfully!', 'success');
        },
        error: (err) => {
          console.error(err);
          this.clearTable();
          this.showError('Failed to fetch the report. Please check the NIC and try again.');
        },
      });
    }
  }
// Clears the table when the search fails or no data is found
clearTable(): void {
  this.report = null;
  this.paginatedLoans = [];
  this.showInstallments = [];
  this.page = 1; // Reset to the first page
}
  // Update the loans to display based on pagination
  updatePaginatedLoans(): void {
    if (this.report?.loans) {
      //console.log("this.report?.loans: ",this.report?.loans)
      const startIndex = (this.page - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      // Ensure you're slicing the array correctly based on the current page and items per page
      this.paginatedLoans = this.report.loans.slice(startIndex, endIndex);
      console.log(" this.paginatedLoans: ", this.paginatedLoans)
    }
  }
  

  // Pagination helper methods
  getStartIndex(): number {
    return (this.page - 1) * this.itemsPerPage + 1;
  }
  getEndIndex(): number {
    const endIndex = this.page * this.itemsPerPage;
    const loansLength = this.report?.loans?.length ?? 0; // Use 0 if loans or length is undefined
    return endIndex > loansLength ? loansLength : endIndex;
  }
  

onPageChange(pageNumber: number): void {
  this.page = pageNumber;  // Update the current page
  this.updatePaginatedLoans();  // Recalculate the displayed loans
}


  onItemsPerPageChange(): void {
    // Reset to the first page whenever items per page is changed
    this.page = 1;
    this.updatePaginatedLoans();  // Recalculate the displayed loans
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

  openLoanModal(loan: Loan): void {
    this.selectedLoan = loan;

    // Open the modal using NgbModal, referencing the component
    const modalRef = this.modalService.open(LoanInfoComponent, {
      size: 'lg',  // Adjust the size of the modal
      centered: true,  // Optional: to center the modal
    });

    // Pass the loan data to the modal component
    modalRef.componentInstance.loan = loan;
  }
}
