import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { TransactionDto } from './transaction.model';
import { ApiService } from '../../Services/api-service.service'; 
import { DateService } from '../../Services/date-service.service';
import { ChangeDetectorRef } from '@angular/core';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface ExtendedTrasactionDto extends TransactionDto {
  selected?: boolean;
}

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule,ReactiveFormsModule],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionHistoryComponent implements OnInit {
  transactions: ExtendedTrasactionDto[] = [];
  editingIndex: number | null = null;
  page: number = 1;
  transactionsPerPage: number = 10;
  transactionsPerPageOptions: number[] = [1, 5, 10, 15, 20];
  searchControl = new FormControl();
  transactionIds?: number[];
  transactionIds_delete?: number[];

  constructor(
    private modalService: NgbModal, 
    private apiService: ApiService,
    private dateService: DateService,
    private cdr: ChangeDetectorRef ) {}

  ngOnInit() {
    this.loadTransactions();
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((nic: string) => {
        if (!nic) {
          return this.apiService.getTransactions(); // Return all transactions if NIC is empty
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
    this.apiService.getTransactions().subscribe({
      next: (transactions: ExtendedTrasactionDto[]) => {
        this.transactions = transactions.map(transaction => ({
          ...transaction,
          createdAt: this.dateService.formatDateTime(transaction.createdAt),
          selected: false,
          customerNIC: transaction.customer.customerNIC
        }));
        this.cdr.markForCheck(); // Trigger change detection
        console.log(this.transactions);
      },
      error: (error: any) => {
        console.error('Failed to load transactions', error);
      }
    });
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

}
