import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
  isReportsLoaded: boolean = false;
  // Pagination properties
  page: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [1, 5, 10, 15, 20];
  paginatedLoans: Loan[] = [];
  searchInvoiceNo: string = ''; 
  customerNIC: string = '';
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
    // Automatically trigger report fetching when NIC is entered
    this.form.get('customerNIC')?.valueChanges
      .pipe(
        debounceTime(500), // Add debounce to avoid triggering the API on every keystroke
        distinctUntilChanged() // Only trigger when the value actually changes
      )
      .subscribe((nic) => {
        if (nic) {
          this.getReportByCustomer(nic).subscribe({
            next: (data) => {
              this.report = data;
              this.error = null;
              this.isReportsLoaded = true;
              this.showInstallments = new Array(data.loans.length).fill(false);
              this.updatePaginatedLoans();
              this.customerNIC = nic;
            },
            error: (err) => {
              this.clearTable();
              //this.showError('Failed to fetch the report. Please check the NIC and try again.');
            },
          });
        } else {
          // Clear the table if NIC is empty
          this.clearTable();
        }
      });
  }

  // Fetch report by customer NIC
  getReportByCustomer(customerNIC: string): Observable<ReportByCustomer> {
    return this.apiService.getReportByCustomer(customerNIC).pipe(
      catchError((error) => {
        //this.showError('Failed to fetch report. Please check the NIC or try again later.');
        return throwError(() => error);
      })
    );
  }
// Clears the table when the search fails or no data is found
clearTable(): void {
  this.report = null;
  this.paginatedLoans = [];
  this.showInstallments = [];
  this.page = 1;
  this.isReportsLoaded = false;
}
  // Update the loans to display based on pagination
  updatePaginatedLoans(): void {
    if (this.report?.loans) {
      this.paginatedLoans = this.report.loans.slice(
        (this.page - 1) * this.itemsPerPage,
        this.page * this.itemsPerPage
      );
      // Apply filter
      this.filterLoansByInvoiceNo();
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
    if(this.customerNIC != ''){
      modalRef.componentInstance.customerNIC = this.customerNIC;
    }
    
  }

  // Filter loans by invoice number
  filterLoansByInvoiceNo(): void {
    if (this.report?.loans) {
      const filteredLoans = this.report.loans.filter((loan) =>
        loan.invoiceNo.toLowerCase().includes(this.searchInvoiceNo.toLowerCase())
      );
      this.paginatedLoans = filteredLoans.slice(
        (this.page - 1) * this.itemsPerPage,
        this.page * this.itemsPerPage
      );
    }
  }

  
}
