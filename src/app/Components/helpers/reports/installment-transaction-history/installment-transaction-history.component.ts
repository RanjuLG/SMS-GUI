import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
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
  selector: 'app-installment-transaction-history',
  standalone: true,
  imports: [CommonModule, 
    FormsModule, 
    NgxPaginationModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatHint,
    MatFormFieldModule,
    MatInputModule],
  templateUrl: './installment-transaction-history.component.html',
  styleUrl: './installment-transaction-history.component.scss'
})
export class InstallmentTransactionHistoryComponent {
  @Input() from: Date = new Date(); // Take `from` as input from parent
  @Input() to: Date = new Date();   // Take `to` as input from parent
  transactions: TransactionReportDto[] = [];
  installmenttransactions: TransactionReportDto[] = [];

/// Separate items per page for each table
transactionsPerPage: number = 5;
installmentTransactionsPerPage: number = 5;
installmentTransactionsPerPageOptions: number[] = [1,2,5,10]; // Modify as per your requirements
loanPage:number = 1;
installmentPage: number = 1;
principlePage: number = 1;
interestPage: number = 1;
  
  searchControl = new FormControl();
  transactionIds?: number[];
  transactionIds_delete?: number[];
  private readonly _currentDate = new Date();
  readonly maxDate = new Date(this._currentDate);
  

  constructor(
    private modalService: NgbModal, 
    private apiService: ApiService,
    private dateService: DateService,
    private cdr: ChangeDetectorRef ) {}

  ngOnInit() {
    this.from.setDate(this.from.getDate() - 30);
    this.to.setDate(this.to.getDate() + 1);
    this.loadTransactions();
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
        this.transactions = filteredTransactions;
        this.cdr.markForCheck(); // Trigger change detection
      },
      error: (error: any) => {
        console.error('Failed to load transactions', error);
      }
    });
    this.cdr.markForCheck();
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

getInstallmentStartIndex(): number {
  return (this.installmentPage - 1) * this.installmentTransactionsPerPage + 1;
}

getInstallmentEndIndex(): number {
  return Math.min(this.installmentPage * this.installmentTransactionsPerPage, this.installmenttransactions.length);
}

}
