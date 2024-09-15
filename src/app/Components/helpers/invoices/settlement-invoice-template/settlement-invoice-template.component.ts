import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../Services/api-service.service';
import { InvoiceDto } from '../../../invoice-form/invoice.model';
import { GetCustomerDTO, TransactionDto } from '../../../transaction-history/transaction.model';
import html2pdf from 'html2pdf.js';
import { DateService } from '../../../../Services/date-service.service';

@Component({
  selector: 'app-settlement-invoice-template',
  standalone: true,
  templateUrl: './settlement-invoice-template.component.html',
  styleUrls: ['./settlement-invoice-template.component.scss'],
})
export class SettlementInvoiceTemplateComponent implements OnInit {
  settlementInvoiceId: number = 0;
  settlementInvoice: InvoiceDto | null = null;
  customer: GetCustomerDTO | null = null;
  transaction: TransactionDto | null = null;
  dateGenerated: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private dateService: DateService
  ) {}

  ngOnInit(): void {
   
      this.settlementInvoiceId = +this.route.snapshot.paramMap.get('invoiceId')!;
    
    console.log("this.settlementInvoiceId: ", this.settlementInvoiceId)
    this.loadInvoiceDetails();
  }

  loadInvoiceDetails(): void {
    if (this.settlementInvoiceId) {
      this.apiService.getInvoiceDetails(this.settlementInvoiceId).subscribe({
        next: (data) => {
          this.settlementInvoice = data.invoice;
          this.customer = data.customer;
          this.transaction = data.transactions[0];
          this.dateGenerated = this.formatDate(this.settlementInvoice?.dateGenerated || new Date().toString());
        },
        error: (error) => {
          console.error('Error loading settlement invoice:', error);
        }
      });
    }
  }

  formatDate(dateString: string): string {
    return this.dateService.formatDateTime(dateString);
  }

  downloadTemplate(): void {
    const element = document.getElementById('printable-template');
    if (element) {
      const options = {
        margin: 2,
        filename: `${this.settlementInvoice?.invoiceNo}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 1 },
        jsPDF: { format: 'a4', orientation: 'portrait' }
      };
      html2pdf().from(element).set(options).save();
    }
  }

  printTemplate(): void {
    const printContents = document.getElementById('printable-template')?.innerHTML;
    if (printContents) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
    }
  }
}
