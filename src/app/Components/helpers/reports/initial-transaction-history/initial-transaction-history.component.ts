import { ChangeDetectionStrategy, Component, OnInit, Input, SimpleChanges } from '@angular/core';
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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-initial-transaction-history',
  standalone: true,
  imports: [CommonModule, 
    FormsModule, 
    NgxPaginationModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatHint,
    MatFormFieldModule,
    MatInputModule],
  templateUrl: './initial-transaction-history.component.html',
  styleUrl: './initial-transaction-history.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush 
})
export class InitialTransactionHistoryComponent {

  @Input() from: Date = new Date(); // Take `from` as input from parent
  @Input() to: Date = new Date();   // Take `to` as input from parent
  
 
  transactions: TransactionReportDto[] = [];
  loanIssuetransactions: TransactionReportDto[] = [];
  transactionsPerPageOptions: number[] = [1,2,5,10];
/// Separate items per page for each table
transactionsPerPage: number = 5;
loanTransactionsPerPage: number = 5;


loanPage:number = 1;
  
  searchControl = new FormControl();
  transactionIds?: number[];
  transactionIds_delete?: number[];
  private readonly _currentDate = new Date();
  readonly maxDate = new Date(this._currentDate);
    // Add these properties to hold the calculated sums
    totalTransactionAmount: number = 0;
    totalLoanIssuanceAmount: number = 0;

  constructor(
    private modalService: NgbModal, 
    private apiService: ApiService,
    private dateService: DateService,
    private cdr: ChangeDetectorRef ) {}
// Detect changes in the inputs (from and to) and reload data
ngOnChanges(changes: SimpleChanges): void {
  if (changes['from'] || changes['to']) {
    console.log('Date range changed:', this.from, this.to);
    this.loadTransactions();
    this.cdr.detectChanges();
  }
}
  ngOnInit() {
    console.log(this.from," : ",this.to)
    this.loadTransactions();
  }
  

  loadTransactions(): void {
    // Clear existing data before loading new transactions
    this.transactions = [];
    this.loanIssuetransactions = [];
    this.cdr.markForCheck();  // Trigger change detection
  
    // Fetch transactions based on the updated 'from' and 'to' values
    this.apiService.getTransactions(this.from, this.to).subscribe({
      next: (transactions: TransactionReportDto[]) => {
        // Map through the transactions and format the data
        this.transactions = transactions.map(transaction => ({
          ...transaction,
          createdAt: new Date(transaction.createdAt).toISOString(),  // Convert Date to string
        }));
  
        // Filter and add only Loan Issuance transactions
        this.addToLoanIssueTransactions(this.transactions);
  
        console.log('Loaded Transactions:', this.transactions);
  
        // Update total loan issuance amount
        this.totalLoanIssuanceAmount = this.calculateTotalAmount(this.loanIssuetransactions);
        this.cdr.markForCheck();  // Trigger change detection to refresh the table
      },
      error: (error: any) => {
        console.error('Failed to load transactions', error);
        this.cdr.markForCheck();
      },
      complete: () => {
        // Handle no data case
        if (this.transactions.length === 0) {
          this.transactions = [];
          this.loanIssuetransactions = [];
        }
        this.cdr.markForCheck();
      }
    });
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


calculateTotalAmount(transactions: TransactionReportDto[]): number {

  return transactions.reduce((sum, transaction) => sum + (transaction.subTotal || 0), 0);
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

exportToExcel(): void {
  console.log("export trans: ",this.loanIssuetransactions)
  // Extract year and month from the 'from' date
  const year = this.from.getFullYear();
  const month = this.from.toLocaleString('default', { month: 'long' }); // Full month name (e.g., 'September')

  // Prepare the data to be exported
  const exportData = this.loanIssuetransactions.map(transaction => ({
    Date: transaction.createdAt,
    'Invoice No': transaction.invoice.invoiceNo,
    'Customer NIC': transaction.customer.customerNIC,
    'Principle Amount': transaction.subTotal,
    'Interest Amount': transaction.interestAmount,
    'Total Amount (Rs.)': transaction.totalAmount
  }));

  // Add a title row with year and month in separate columns
  const titleRow = [{ Date: `Loan Transactions Report`, 'Invoice No': year, 'Customer NIC': month, 'Principle Amount': '', 'Interest Amount': '', 'Total Amount (Rs.)': '' }];
  
  // Add table header row
  const headerRow = [{
    Date: 'Date', 
    'Invoice No': 'Invoice No', 
    'Customer NIC': 'Customer NIC', 
    'Principle Amount': 'Principle Amount', 
    'Interest Amount': 'Interest Amount', 
    'Total Amount (Rs.)': 'Total Amount (Rs.)'
  }];

  // Merge title row, header row, and actual data
  const exportDataWithTitleAndHeader = [...titleRow, ...headerRow, ...exportData];

  // Create a new worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportDataWithTitleAndHeader, { skipHeader: true });
  const workbook = { Sheets: { 'Loan Disbursement Transactions': worksheet }, SheetNames: ['Loan Disbursement Transactions'] };
  

  // Generate a buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Save the file using file-saver
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `Loan_Transactions_${year}-${month}.xlsx`);
}


}
