import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { ApiService } from '../../../../Services/api-service.service'; 
import { DateService } from '../../../../Services/date-service.service';
import { ChangeDetectorRef } from '@angular/core';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatHint } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {TransactionReportDto,TransactionType } from '../../../reports/reports.model';

@Component({
  selector: 'app-income-report',
  standalone: true,
  imports: [CommonModule, 
    FormsModule, 
    NgxPaginationModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatHint,
    MatFormFieldModule,
    MatInputModule],
  templateUrl: './income-report.component.html',
  styleUrl: './income-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeReportComponent {
  transactions: TransactionReportDto[] = [];
  installmenttransactions: TransactionReportDto[] = [];
  interestInstallmenttransactions: TransactionReportDto[] = [];
  principleInstallmenttransactions: TransactionReportDto[] = [];
  loanIssuetransactions: TransactionReportDto[] = [];

/// Separate items per page for each table
transactionsPerPage: number = 5;
installmentTransactionsPerPage: number = 5;
principleTransactionsPerPage: number = 5;
interestTransactionsPerPage: number = 5;
loanTransactionsPerPage: number = 5;

transactionsPerPageOptions: number[] = [1,2,5,10]; // Modify as per your requirements
loanTransactionsPerPageOptions: number[] = [1,2,5,10];

loanPage:number = 1;
installmentPage: number = 1;
principlePage: number = 1;
interestPage: number = 1;
  
  searchControl = new FormControl();
  transactionIds?: number[];
  transactionIds_delete?: number[];
  private readonly _currentDate = new Date();
  readonly maxDate = new Date(this._currentDate);
  from = new Date(this._currentDate);
  to = new Date(this._currentDate)
  

  constructor(
    private modalService: NgbModal, 
    private apiService: ApiService,
    private dateService: DateService,
    private cdr: ChangeDetectorRef ) {}

  ngOnInit() {
    this.from.setDate(this.from.getDate() - 30);
    this.to.setDate(this.to.getDate() + 1);
    this.loadTransactions();
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((nic: string) => {
        if (!nic) {
          return this.apiService.getTransactions(this.from,this.to); // Return all transactions if NIC is empty
        }
        console.log(nic)
        return this.apiService.getTransactionsByCustomerNIC(nic).pipe(
          catchError(() => of([])) // Handle errors and return an empty array
        );
      })
    ).subscribe({
      next: (result: any[]) => { // Use 'any' type here if your API response does not have a consistent type
        this.transactions = result.map(transaction => ({
          ...transaction,
          createdAt: this.dateService.formatDateTime(transaction.createdAt),
          selected: false,
          customerNIC: transaction.customerNIC // Ensure this property is available in the response
        }));
        this.cdr.markForCheck(); // Trigger change detection
      },
      error: (error: any) => {
        console.error('Failed to fetch transactions', error);
      }
    });
    this.cdr.detectChanges()
  }
  

  loadTransactions(): void {
    this.apiService.getTransactions(this.from, this.to).subscribe({
      next: (transactions: TransactionReportDto[]) => {
        // Apply filtering based on a condition before mapping
        const filteredTransactions = transactions
          .map(transaction => ({
            ...transaction,
            createdAt: this.dateService.formatDateTime(transaction.createdAt),
            selected: false,
            customerNIC: transaction.customer.customerNIC
          }));
          this.addToInstallmentTransactions(filteredTransactions);
          this.addToPrincipleInstallmentTransactions(filteredTransactions);
          this.addToInteresInstallmentTransactions(filteredTransactions);
          this.addToLoanIssueTransactions(filteredTransactions);
        this.transactions = filteredTransactions;
        this.cdr.markForCheck(); // Trigger change detection
      },
      error: (error: any) => {
        console.error('Failed to load transactions', error);
      }
    });
    this.cdr.markForCheck();
  }

  addToLoanIssueTransactions(transactions: TransactionReportDto[]): void {
    // Filter based on a condition after loading
    const filteredTransactions = transactions.filter(transaction => {
      // Return the condition to filter only installment payments
      return transaction.transactionType === TransactionType.LoanIssuance;
    });

    // Add filtered transactions to the installment transactions list
    this.loanIssuetransactions = [...this.loanIssuetransactions, ...filteredTransactions];
    this.cdr.detectChanges()
}

  addToInstallmentTransactions(transactions: TransactionReportDto[]): void {
    // Filter based on a condition after loading
    const filteredTransactions = transactions.filter(transaction => {
      // Return the condition to filter only installment payments
      return transaction.transactionType === TransactionType.InstallmentPayment;
    });

    // Add filtered transactions to the installment transactions list
    this.installmenttransactions = [...this.installmenttransactions, ...filteredTransactions];
    this.cdr.detectChanges()
}


addToPrincipleInstallmentTransactions(transactions: TransactionReportDto[]): void {
  // Filter based on a condition after loading
  const filteredTransactions = transactions.filter(transaction => {
    // Filter for principle installment payments
    return transaction.transactionType === TransactionType.InstallmentPayment 
      && transaction.interestAmount == 0 
      && transaction.subTotal > 0;
  });

  // Add filtered transactions to the principleInstallmenttransactions list
  this.principleInstallmenttransactions = [...this.principleInstallmenttransactions, ...filteredTransactions];
  this.cdr.detectChanges()
}

addToInteresInstallmentTransactions(transactions: TransactionReportDto[]): void {
  // Filter based on a condition after loading
  const filteredTransactions = transactions.filter(transaction => {
    // Filter for interest installment payments
    return transaction.transactionType === TransactionType.InstallmentPayment 
      && transaction.interestAmount > 0 
      && transaction.subTotal == 0;
  });

  // Add filtered transactions to the interestInstallmenttransactions list
  this.interestInstallmenttransactions = [...this.interestInstallmenttransactions, ...filteredTransactions];
  this.cdr.detectChanges()
}

  

  formatDate(dateString: string): string {
    return this.dateService.formatDateTime(dateString);
  }

  
  onStartDateChange(event: any): void{
    this.from = new Date(event.value)
    console.log("this.from: ", this.from);


  }
  onDateRangeChange(event: any): void {
   
    if (event && event.value) 
    {
      const {end } = event.value;
      
        this.to = new Date(event.value);
        this.to.setDate(this.to.getDate() + 1);
        
        console.log("this.to: ", this.to);
        this.loadTransactions();
  
    } 
    else {
      console.error('Event or event value is null');
    }
    this.cdr.markForCheck();
  }

// Pagination Index Helpers
getLoanStartIndex(): number {
  return (this.loanPage - 1) * this.loanTransactionsPerPage + 1;
  
  
}

getLoanEndIndex(): number {
  return Math.min(this.loanPage * this.loanTransactionsPerPage, this.loanIssuetransactions.length);
}

getInstallmentStartIndex(): number {
  return (this.installmentPage - 1) * this.installmentTransactionsPerPage + 1;
}

getInstallmentEndIndex(): number {
  return Math.min(this.installmentPage * this.installmentTransactionsPerPage, this.installmenttransactions.length);
}



getInterestInstallmentEndIndex(): number {
  return Math.min(this.interestPage * this.interestPage, this.interestInstallmenttransactions.length);
}
  
getInterestInstallmentStartIndex(): number {
  return (this.interestPage - 1) * this.interestTransactionsPerPage + 1;


}

getPrincipleInstallmentEndIndex(): number {
  return Math.min(this.principlePage * this.interestPage, this.principleInstallmenttransactions.length);
}
  
getPrincipleInstallmentStartIndex(): number {
  return (this.principlePage - 1) * this.interestTransactionsPerPage + 1;


}

}
