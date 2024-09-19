import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { ApiService } from '../../../../Services/api-service.service';
import { ActivatedRoute } from '@angular/router';
import { InvoiceDto } from '../../../invoice-form/invoice.model';
import { GetCustomerDTO, TransactionDto } from '../../../transaction-history/transaction.model';
import html2pdf from 'html2pdf.js';
import { DateService } from '../../../../Services/date-service.service';
import { ConfigService } from '../../../../Services/config-service.service';

@Component({
  selector: 'app-installment-invoice-template',
  standalone: true,
  templateUrl: './installment-invoice-template.component.html',
  styleUrls: ['./installment-invoice-template.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class InstallmentInvoiceTemplateComponent implements OnInit {
  invoiceId: number = 0;
  invoice: InvoiceDto | null = null;
  transaction: TransactionDto | null = null;
  customer: GetCustomerDTO | null = null;
  errorMessage: string | null = null;
  dateGenerated: string | null = null;
  customWidth = 229; // Custom width in mm
  customHeight = 180; // Custom height in mm
  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private dateService: DateService,
    private configService: ConfigService,
  ) {}

  ngOnInit(): void {
    this.invoiceId = +this.route.snapshot.paramMap.get('invoiceId')!;
    this.getInvoiceDetails();
    this.getInvoiceSettings();
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

  getInvoiceSettings(): void {

    var settings = this.configService.invoiceSettings;
  
    console.log("this.settings: ",settings)
    this.customWidth = settings.width;
    this.customHeight = settings.height;
   }
    // Function to download the invoice as a PDF using html2pdf.js
    downloadTemplate(): void {
      const element = document.getElementById('printable-template');
      if (element) {
        const options = {
          margin: 0,
          filename: `${this.invoice?.invoiceNo}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 4,
            useCORS: true
          },
          jsPDF: { 
            unit: 'mm', // Specify the unit as millimeters
            format: [this.customWidth, this.customHeight], // Custom dimensions in mm
            orientation: 'portrait' // Orientation: 'portrait' or 'landscape'
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
    return this.dateService.formatDateTime(dateString);
  }
}
