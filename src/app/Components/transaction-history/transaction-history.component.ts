import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ApiService } from '../../Services/api-service.service'; 
import { DateService } from '../../Services/date-service.service';
import { ChangeDetectorRef } from '@angular/core';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TransactionReportDto } from '../reports/reports.model';

// Import shared components
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';


export interface ExtendedTrasactionDto extends TransactionReportDto {
  selected?: boolean;
}

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeaderComponent,
    DataTableComponent
  ],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionHistoryComponent implements OnInit {
  transactions: ExtendedTrasactionDto[] = [];
  editingIndex: number | null = null;
  page: number = 1;
  transactionsPerPage: number = 20;
  transactionsPerPageOptions: number[] = [10, 20, 50, 100];
  searchControl = new FormControl();
  transactionIds?: number[];
  transactionIds_delete?: number[];
  private readonly _currentDate = new Date();
  readonly maxDate = new Date(this._currentDate);
  from = new Date(this._currentDate);
  to = new Date(this._currentDate);
  loading: boolean = false;

  // Table configuration for the modern DataTableComponent
  tableColumns: TableColumn[] = [
    {
      key: 'createdAt',
      label: 'Date',
      type: 'date',
      sortable: true
    },
    {
      key: 'customer.customerName',
      label: 'Customer Name',
      type: 'text',
      sortable: true
    },
    {
      key: 'customer.customerNIC',
      label: 'Customer NIC',
      type: 'text',
      sortable: true
    },
    {
      key: 'subTotal',
      label: 'Sub Total (Rs.)',
      type: 'currency',
      sortable: true
    },
    {
      key: 'interestRate',
      label: 'Interest Rate (%)',
      type: 'text',
      sortable: true
    },
    {
      key: 'totalAmount',
      label: 'Total Amount (Rs.)',
      type: 'currency',
      sortable: true
    }
  ];

  tableActions: TableAction[] = [
    {
      key: 'view',
      label: 'View',
      icon: 'ri-eye-line',
      color: 'info'
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: 'ri-delete-bin-line',
      color: 'danger'
    }
  ];
  

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
  }
  

  loadTransactions(): void {
    this.loading = true;
    this.apiService.getTransactions(this.from,this.to).subscribe({
      next: (transactions: ExtendedTrasactionDto[]) => {
        this.transactions = transactions.map(transaction => ({
          ...transaction,
          createdAt: this.dateService.formatDateTime(transaction.createdAt),
          selected: false,
          customerNIC: transaction.customer.customerNIC
        }));
        this.loading = false;
        this.cdr.markForCheck(); // Trigger change detection
        console.log(this.transactions);
      },
      error: (error: any) => {
        console.error('Failed to load transactions', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Handle table actions (view, delete)
  handleTableAction(event: { action: string, item: ExtendedTrasactionDto }): void {
    const { action, item } = event;
    
    switch (action) {
      case 'view':
        this.viewTransaction(item);
        break;
      case 'delete':
        this.deleteTransaction(item.transactionId);
        break;
    }
  }

  // Handle selection changes from data table
  onSelectionChange(selectedItems: ExtendedTrasactionDto[]): void {
    // Update selected state in transactions array
    this.transactions.forEach(transaction => {
      transaction.selected = selectedItems.some(selected => selected.transactionId === transaction.transactionId);
    });
    this.cdr.markForCheck();
  }

  // View transaction details
  viewTransaction(transaction: ExtendedTrasactionDto): void {
    Swal.fire({
      title: 'Transaction Details',
      html: `
        <div class="text-start">
          <p><strong>Date:</strong> ${transaction.createdAt}</p>
          <p><strong>Customer:</strong> ${transaction.customer.customerName}</p>
          <p><strong>NIC:</strong> ${transaction.customer.customerNIC}</p>
          <p><strong>Sub Total:</strong> Rs. ${transaction.subTotal}</p>
          <p><strong>Interest Rate:</strong> ${transaction.interestRate}%</p>
          <p><strong>Total Amount:</strong> Rs. ${transaction.totalAmount}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Close'
    });
  }

  // Search functionality
  onSearch(searchTerm: string): void {
    // The search will be handled by the existing searchControl logic
    this.searchControl.setValue(searchTerm);
  }

  openCreateTransactionModal() {
    // Logic to open a modal for creating a new transaction
  }



 

  deleteSelectedTransactions() {
    const selectedTransactionIds = this.transactions.filter(transaction => transaction.selected).map(transaction => transaction.transactionId);
    this.transactionIds?.concat(selectedTransactionIds)
    console.log("this.transactionIds?",this.transactionIds);
    console.log("selectedTransactionIds",selectedTransactionIds)
    if (selectedTransactionIds.length === 0) {
      Swal.fire('No transactions selected', 'Please select at least one transaction to delete.', 'warning');
      return;
    }
    Swal.fire({
      title: 'Delete Selected Transactions',
      text: `Are you sure you want to delete the selected ${selectedTransactionIds.length} transactions?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete them',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteMultipleTransactions(selectedTransactionIds).subscribe(() => {
          this.loadTransactions();
          Swal.fire('Deleted!', 'Selected transactions have been deleted.', 'success');
        }, error => {
          console.error('Failed to delete transactions', error);
          Swal.fire('Error', 'Failed to delete transactions.', 'error');
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Selected transaction deletion cancelled.', 'info');
      }
    });
  }

  deleteTransaction(index: number) {
    const transactionId = this.transactions[index].transactionId;
    console.log("transactionId", transactionId);
  
    Swal.fire({
      title: 'Delete Transaction',
      text: 'Are you sure you want to delete this transaction?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Ensure transactionIds is initialized and add transactionId to it
        this.transactionIds_delete = this.transactionIds_delete || [];
        this.transactionIds_delete = [...this.transactionIds_delete, transactionId];
  
        this.apiService.deleteMultipleTransactions(this.transactionIds_delete).subscribe(() => {
          this.loadTransactions();
          Swal.fire('Deleted!', 'Transaction has been deleted.', 'success');
        }, error => {
          console.error('Failed to delete transaction', error);
          Swal.fire('Error', 'Failed to delete transaction.', 'error');
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Transaction deletion cancelled.', 'info');
      }
    });
  }
  
  

  toggleAllSelections(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.transactions.forEach(transaction => transaction.selected = checked);
  }

  editTransaction(index: number) {
    this.editingIndex = index;
  }


  getStartIndex(): number {
    return (this.page - 1) * this.transactionsPerPage + 1;
  }

  getEndIndex(): number {
    const endIndex = this.page * this.transactionsPerPage;
    return endIndex > this.transactions.length ? this.transactions.length : endIndex;
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
}
