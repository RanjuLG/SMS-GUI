import { Component, OnInit,ViewEncapsulation  } from '@angular/core';
import { ApiService } from '../../../../Services/api-service.service';
import { ActivatedRoute } from '@angular/router';
import { InvoiceDto } from '../../../invoice-form/invoice.model';
import { GetCustomerDTO, GetItemDTO, TransactionDto } from '../../../transaction-history/transaction.model';
import html2pdf from 'html2pdf.js';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateService } from '../../../../Services/date-service.service';

@Component({
  selector: 'app-invoice-template',
  standalone: true,
  templateUrl: './invoice-template.component.html',
  styleUrls: ['./invoice-template.component.scss'],
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.Emulated
})
export class InvoiceTemplateComponent implements OnInit {
  invoiceId: number = 0;
  invoice: InvoiceDto | null = null;
  transaction: TransactionDto | null = null;
  customer: GetCustomerDTO | null = null;
  items: GetItemDTO[] | null = null;
  dateGenerated: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private dateService: DateService,
  ) {}

  ngOnInit(): void {
    this.invoiceId = +this.route.snapshot.paramMap.get('invoiceId')!;
    this.getInvoiceDetails();
  }

  getInvoiceDetails(): void {
    this.apiService.getInvoiceDetails(this.invoiceId).subscribe({
      next: (data) => {
        this.invoice = data.invoice;
        this.transaction = data.transactions[0];
        this.customer = data.customer;
        this.items = this.transaction.items;
        this.dateGenerated = this.formatDate(this.invoice.dateGenerated);
      },
      error: (err) => {
        this.errorMessage = err;
      }
    });
  }

  formatDate(dateString: string): string {
    return this.dateService.formatDateTime(dateString);
  }

  // Function to print the invoice
  printTemplate(): void {
    const element = document.getElementById('printable-template');
    if (element) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Invoice</title>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(element.outerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  }

  // Function to download the invoice as a PDF using html2pdf.js
  // Function to download the invoice as a PDF using html2pdf.js
downloadTemplate(): void {
  const element = document.getElementById('printable-template');
  if (element) {
    const options = {
      margin: 0,  // Consistent margin for all sides
      filename: `${this.invoice?.invoiceNo}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },  // Set a balance between quality and file size
      html2canvas: {
        scale: 4,  // Higher scale for better quality
        useCORS: true  // Use this to avoid cross-origin image issues
      },
      jsPDF: { format: 'a4', orientation: 'landscape' }  // Use portrait orientation
    };
    html2pdf().from(element).set(options).save();
  }
}

  
  
  
}
