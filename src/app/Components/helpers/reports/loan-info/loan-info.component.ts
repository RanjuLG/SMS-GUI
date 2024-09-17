import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-loan-info',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule,  
  ],
  templateUrl: './loan-info.component.html',
  styleUrl: './loan-info.component.scss'
})
export class LoanInfoComponent implements OnInit {
  @Input() loan: any;
  @Input() customerNIC:any;
    // Loan data passed from the parent component
  private datePipe = new DatePipe('en-US');
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    // Any initialization logic
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }

  exportToExcel(): void {
    // Loan Details Section
    const loanDetails = [
      ['Loan Details'],  // Section Title
      ['Invoice Number', this.loan.invoiceNo],
      ['Loan Amount', this.loan.transaction.totalAmount],
      ['Subtotal', this.loan.transaction.subTotal],
      ['Interest Rate (%)', this.loan.transaction.interestRate],
      ['Interest Amount', this.loan.transaction.interestAmount],
      ['Total Amount Paid', this.loan.amountPaid],
      ['Total Outstanding Amount', this.loan.outstandingAmount],
      ['Start Date', this.datePipe.transform(this.loan.startDate, 'yyyy-MM-dd')],
      ['End Date', this.datePipe.transform(this.loan.endDate, 'yyyy-MM-dd')],
      ['Loan Status', this.loan.isSettled ? 'Settled' : 'Not Settled']
    ];

    // Installments Section
    const installmentHeader = ['Invoice No', 'Principle Amount Paid', 'Interest Amount Paid', 'Total Amount Paid', 'Date Paid'];
    const installmentRows = this.loan.installments.map((installment: any) => [
      installment.invoiceNo,
      installment.principleAmountPaid,
      installment.interestAmountPaid,
      installment.totalAmountPaid,
      this.datePipe.transform(installment.datePaid, 'yyyy-MM-dd')  // Format date
    ]);

    const installments = [
      ['Installments'],  // Section Title
      installmentHeader,  // Header Row
      ...installmentRows  // Data Rows
    ];

    // Combine Loan Details and Installments
    const data = [...loanDetails, [], ...installments];  // Blank row for spacing

    // Create a new worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

    // Create a new workbook and add the worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Loan Info');

    // Export to Excel file
    XLSX.writeFile(wb, `loan-info-${this.customerNIC}-${this.loan.invoiceNo}.xlsx`);
  }
}