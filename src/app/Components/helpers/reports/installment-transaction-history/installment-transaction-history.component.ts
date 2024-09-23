import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { ApiService } from '../../../../Services/api-service.service'; 
import { DateService } from '../../../../Services/date-service.service';
import { ChangeDetectorRef } from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatHint } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TransactionReportDto, TransactionType } from '../../../reports/reports.model';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  styleUrl: './installment-transaction-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstallmentTransactionHistoryComponent implements OnInit {
  @Input() from: Date = new Date(); // Take `from` as input from parent
  @Input() to: Date = new Date();   // Take `to` as input from parent
  
  transactions: TransactionReportDto[] = [];
  installmenttransactions: TransactionReportDto[] = [];
  
  transactionsPerPage: number = 5;
  installmentTransactionsPerPage: number = 5;
  installmentTransactionsPerPageOptions: number[] = [1, 2, 5, 10];
  installmentPage: number = 1;
  
  totalInstallmentAmount: number = 0; // New property to hold total installment amount

  constructor(
    private modalService: NgbModal, 
    private apiService: ApiService,
    private dateService: DateService,
    private cdr: ChangeDetectorRef ) {}

  ngOnInit() {
    this.from.setDate(this.from.getDate() - 30);
    this.to.setDate(this.to.getDate() + 1);
    this.loadTransactions();
    this.cdr.detectChanges();
  }
  
  loadTransactions(): void {
    this.apiService.getTransactions(this.from, this.to).subscribe({
      next: (transactions: TransactionReportDto[]) => {
        const filteredTransactions = transactions
          .map(transaction => ({
            ...transaction,
            createdAt: this.dateService.formatDateTime(transaction.createdAt),
            selected: false,
            customerNIC: transaction.customer.customerNIC
          }));
          
        this.addToInstallmentTransactions(filteredTransactions);
        this.transactions = filteredTransactions;
        this.totalInstallmentAmount = this.calculateTotalAmount(this.installmenttransactions); // Calculate total installment amount
        this.cdr.markForCheck(); // Trigger change detection
      },
      error: (error: any) => {
        console.error('Failed to load transactions', error);
      }
    });
    this.cdr.markForCheck();
  }

  addToInstallmentTransactions(transactions: TransactionReportDto[]): void {
    const filteredTransactions = transactions.filter(transaction => {
      return transaction.transactionType === TransactionType.InstallmentPayment;
    });
    this.installmenttransactions = [...this.installmenttransactions, ...filteredTransactions];
    this.cdr.detectChanges();
  }

  calculateTotalAmount(transactions: TransactionReportDto[]): number {
    const total = transactions.reduce((sum, transaction) => sum + (transaction.totalAmount || 0), 0);
    return Math.ceil(total); // Round up the total value
  }
  

  exportToExcel(): void {
    const year = this.from.getFullYear();
    const month = this.from.toLocaleString('default', { month: 'long' });
    
    const exportData = this.installmenttransactions.map(transaction => ({
      Date: transaction.createdAt,
      'Invoice No': transaction.invoice.invoiceNo,
      'Customer NIC': transaction.customer.customerNIC,
      'Principle Amount': transaction.subTotal,
      'Interest Amount': transaction.interestAmount,
      'Total Amount (Rs.)': transaction.totalAmount
    }));

    const titleRow = [{ Date: `Installment Transactions Report`, 'Invoice No': year, 'Customer NIC': month }];
    const headerRow = [{ Date: 'Date', 'Invoice No': 'Invoice No', 'Customer NIC': 'Customer NIC', 'Principle Amount': 'Principle Amount', 'Interest Amount': 'Interest Amount', 'Total Amount (Rs.)': 'Total Amount (Rs.)' }];
    const exportDataWithTitleAndHeader = [...titleRow, ...headerRow, ...exportData];
    
    const worksheet = XLSX.utils.json_to_sheet(exportDataWithTitleAndHeader, { skipHeader: true });
    const workbook = { Sheets: { 'Installment Transactions': worksheet }, SheetNames: ['Installment Transactions'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Installment_Transactions_${year}-${month}.xlsx`);
  }

  getInstallmentStartIndex(): number {
    return (this.installmentPage - 1) * this.installmentTransactionsPerPage + 1;
  }

  getInstallmentEndIndex(): number {
    return Math.min(this.installmentPage * this.installmentTransactionsPerPage, this.installmenttransactions.length);
  }
}
