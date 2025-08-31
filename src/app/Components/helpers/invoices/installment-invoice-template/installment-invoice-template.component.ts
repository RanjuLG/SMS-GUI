import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { ApiService } from '../../../../Services/api-service.service';
import { ActivatedRoute } from '@angular/router';
import { InvoiceDto } from '../../../invoice-form/invoice.model';
import { GetCustomerDTO, TransactionDto } from '../../../transaction-history/transaction.model';
import html2pdf from 'html2pdf.js';
import { DateService } from '../../../../Services/date-service.service';
import { ConfigService } from '../../../../Services/config-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-installment-invoice-template',
  standalone: true,
  templateUrl: './installment-invoice-template.component.html',
  styleUrls: ['./installment-invoice-template.component.scss'],
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.Emulated
})
export class InstallmentInvoiceTemplateComponent implements OnInit {
  invoiceId: number = 0;
  invoice: InvoiceDto | null = null;
  transaction: TransactionDto | null = null;
  customer: GetCustomerDTO | null = null;
  errorMessage: string | null = null;
  dateGenerated: string | null = null;
  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private dateService: DateService,
    private configService: ConfigService,
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
        this.dateGenerated = this.formatDate(this.invoice.dateGenerated);
      },
      error: (err) => {
        this.errorMessage = err;
      }
    });
  }
    // Function to download the invoice as a PDF using html2pdf.js
    downloadTemplate(): void {
      const element = document.getElementById('printable-template');
      if (element) {
        const options = {
          margin: [10, 15, 10, 15], // Top, Right, Bottom, Left margins in mm
          filename: `Installment-Invoice-${this.invoice?.invoiceNo}.pdf`,
          image: { 
            type: 'jpeg', 
            quality: 0.98 
          },
          html2canvas: {
            scale: 2, // Reduced scale for better performance while maintaining quality
            useCORS: true,
            logging: false,
            letterRendering: true,
            allowTaint: false
          },
          jsPDF: { 
            unit: 'mm',
            format: 'a4', // Standard A4 format for professional invoices
            orientation: 'portrait',
            putOnlyUsedFonts: true,
            floatPrecision: 16
          }
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

  formatDate(dateString: string): string {
    return this.dateService.formatDate(dateString);
  }
}
