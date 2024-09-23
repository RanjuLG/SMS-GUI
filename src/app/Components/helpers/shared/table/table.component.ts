import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule, MatHint } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, 
    FormsModule, 
    NgxPaginationModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatHint,
    MatFormFieldModule,
    MatInputModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
@Input() transactions: any[] = [];
  @Input() transactionsPerPage: number = 10;
  @Input() transactionsPerPageOptions: number[] = [5, 10, 15, 20];
  @Input() page: number = 1;
  @Input() maxDate: Date = new Date();

  @Output() deleteTransaction = new EventEmitter<number>();
  @Output() deleteSelectedTransactions = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() toggleSelection = new EventEmitter<boolean>();
  @Output() dateRangeChange = new EventEmitter<{ from: Date, to: Date }>();

  searchControl = new FormControl();
  fromDate: Date = new Date();
  toDate: Date = new Date();

  toggleAllSelections(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggleSelection.emit(checked);
  }

  onDeleteTransaction(transactionId: number) {
    this.deleteTransaction.emit(transactionId);
  }

  onDateRangeChange(event: any): void {
    const { start, end } = event.value;
    this.fromDate = start;
    this.toDate = end;
    this.dateRangeChange.emit({ from: start, to: end });
  }

  onItemsPerPageChange(event: Event) {
    this.transactionsPerPage = +(event.target as HTMLSelectElement).value;
    this.pageChange.emit(this.page);
  }

  getStartIndex(): number {
    return (this.page - 1) * this.transactionsPerPage + 1;
  }

  getEndIndex(): number {
    const endIndex = this.page * this.transactionsPerPage;
    return endIndex > this.transactions.length ? this.transactions.length : endIndex;
  }
}
