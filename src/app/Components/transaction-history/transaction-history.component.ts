import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { TransactionDto } from './transaction.model';
import { ApiService } from '../../Services/api-service.service'; 
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.model';
import { DateService } from '../../Services/date-service.service';
import { ChangeDetectorRef } from '@angular/core';

export interface ExtendedTrasactionDto extends TransactionDto {
  selected?: boolean;
}

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent implements OnInit {
  transactions: ExtendedTrasactionDto[] = [];
  editingIndex: number | null = null;
  page: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [1, 5, 10, 15, 20];

  constructor(
    private modalService: NgbModal, 
    private apiService: ApiService,
    private dateService: DateService,
    private cdr: ChangeDetectorRef ) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.apiService.getTransactions().subscribe({
      next: (transactions: ExtendedTrasactionDto[]) => {
        this.transactions = transactions.map(transaction => ({
          ...transaction,
          createdAt: this.dateService.formatDateTime(transaction.createdAt),
          selected: false
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

  createTransaction(transaction: CreateTransactionDto) {
    this.apiService.createTransaction(transaction).subscribe(() => {
      this.loadTransactions();
      Swal.fire('Created!', 'Transaction has been created.', 'success');
    }, error => {
      console.error('Failed to create transaction', error);
      Swal.fire('Error', 'Failed to create transaction.', 'error');
    });
  }

  updateTransaction(index: number, transaction: UpdateTransactionDto) {
    const transactionId = this.transactions[index].transactionId;
    this.apiService.updateTransaction(transactionId, transaction).subscribe(() => {
      this.loadTransactions();
      this.editingIndex = null;
      Swal.fire('Updated!', 'Transaction has been updated.', 'success');
    }, error => {
      console.error('Failed to update transaction', error);
      Swal.fire('Error', 'Failed to update transaction.', 'error');
    });
  }

  deleteSelectedTransactions() {
    const selectedTransactionIds = this.transactions.filter(transaction => transaction.selected).map(transaction => transaction.transactionId);
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
        this.apiService.deleteTransaction(transactionId).subscribe(() => {
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

  saveTransaction(index: number) {
    const transaction = this.transactions[index];
    this.updateTransaction(index, transaction);
  }

  getStartIndex(): number {
    return (this.page - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    const endIndex = this.page * this.itemsPerPage;
    return endIndex > this.transactions.length ? this.transactions.length : endIndex;
  }

  formatDate(dateString: string): string {
    return this.dateService.formatDateTime(dateString);
  }

}
