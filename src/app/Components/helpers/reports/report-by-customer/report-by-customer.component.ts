import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ReportByCustomer, Loan } from '../../../reports/reports.model';
import { ApiService } from '../../../../Services/api-service.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { LoanInfoComponent } from '../loan-info/loan-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';

export interface ExtendedLoan extends Omit<Loan, 'isSettled'> {
  isSettled: string; // For display purposes in the table
}

@Component({
  selector: 'app-report-by-customer',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    DataTableComponent,
    LoanInfoComponent
  ],
  templateUrl: './report-by-customer.component.html',
  styleUrls: ['./report-by-customer.component.scss'],
})
export class ReportByCustomerComponent implements OnInit {
  form: FormGroup;
  report: ReportByCustomer | null = null;
  error: string | null = null;
  selectedLoan: Loan | null = null;
  isReportsLoaded: boolean = false;
  searchInvoiceNo: string = ''; 
  customerNIC: string = '';
  processedLoans: ExtendedLoan[] = [];

  tableColumns = [
    { key: 'invoiceNo', label: 'Invoice No', sortable: true, type: 'text' as const },
    { key: 'transaction.totalAmount', label: 'Total Loan Amount', sortable: true, type: 'currency' as const },
    { key: 'amountPaid', label: 'Amount Paid', sortable: true, type: 'currency' as const },
    { key: 'outstandingAmount', label: 'Outstanding Amount', sortable: true, type: 'currency' as const },
    { key: 'startDate', label: 'Start Date', sortable: true, type: 'date' as const },
    { key: 'endDate', label: 'End Date', sortable: true, type: 'date' as const },
    { key: 'isSettled', label: 'Status', sortable: true, type: 'badge' as const }
  ];

  tableActions = [
    { key: 'moreInfo', label: 'More Info', icon: 'ri-menu-line', color: 'primary' }
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private modalService: NgbModal,
  ) {
    this.form = this.fb.group({
      customerNIC: [''],
    });
  }

  ngOnInit(): void {
    this.form.get('customerNIC')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((nic) => {
        if (nic) {
          this.getReportByCustomer(nic).subscribe({
            next: (data) => {
              this.report = data;
              this.error = null;
              this.isReportsLoaded = true;
              this.customerNIC = nic;
              this.processLoansForTable();
            },
            error: (err) => {
              this.clearTable();
            },
          });
        } else {
          this.clearTable();
        }
      });
  }

  processLoansForTable(): void {
    if (this.report?.loans) {
      this.processedLoans = this.report.loans.map(loan => ({
        ...loan,
        isSettled: loan.isSettled ? 'Settled' : 'Not Settled'
      }));
    }
  }

  getReportByCustomer(customerNIC: string): Observable<ReportByCustomer> {
    return this.apiService.getReportByCustomer(customerNIC).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  clearTable(): void {
    this.report = null;
    this.isReportsLoaded = false;
    this.processedLoans = [];
  }

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

  showError(errorMessage: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage,
    });
  }

  onTableAction(event: { action: string, item: any }) {
    switch (event.action) {
      case 'moreInfo':
        const originalLoan = this.report?.loans.find(loan => loan.invoiceNo === event.item.invoiceNo);
        if (originalLoan) {
          this.openLoanModal(originalLoan);
        }
        break;
    }
  }

  openLoanModal(loan: Loan): void {
    this.selectedLoan = loan;
    
    const modalRef = this.modalService.open(LoanInfoComponent, {
      size: 'lg',
      centered: true,
    });

    modalRef.componentInstance.loan = loan;
    if(this.customerNIC != ''){
      modalRef.componentInstance.customerNIC = this.customerNIC;
    }
  }

  filterLoansByInvoiceNo(): void {
    // This is now handled by the DataTable component's built-in search
  }

  get filteredLoans() {
    if (!this.processedLoans) return [];
    
    if (!this.searchInvoiceNo) return this.processedLoans;
    
    return this.processedLoans.filter((loan) =>
      loan.invoiceNo.toLowerCase().includes(this.searchInvoiceNo.toLowerCase())
    );
  }
}
