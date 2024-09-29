import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../Services/api-service.service';
import { InvoiceDto } from '../../../invoice-form/invoice.model';
import { GetCustomerDTO, TransactionDto } from '../../../transaction-history/transaction.model';
import html2pdf from 'html2pdf.js';
import { DateService } from '../../../../Services/date-service.service';
import { ConfigService } from '../../../../Services/config-service.service';

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
  customWidth = 229; // Custom width in mm
  customHeight = 180; // Custom height in mm
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private dateService: DateService,
    private configService: ConfigService,
  ) {}

  ngOnInit(): void {
   
      this.settlementInvoiceId = +this.route.snapshot.paramMap.get('invoiceId')!;
    
    console.log("this.settlementInvoiceId: ", this.settlementInvoiceId)
    this.loadInvoiceDetails();
    this.getInvoiceSettings();
  }

  loadInvoiceDetails(): void {
    if (this.settlementInvoiceId) {
      this.apiService.getInvoiceDetails(this.settlementInvoiceId).subscribe({
        next: (data) => {
          this.settlementInvoice = data.invoice;
          this.customer = data.customer;
          this.transaction = data.transactions[0];
          console.log(" this.transaction: ", this.transaction)
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
          filename: `${this.settlementInvoice?.invoiceNo}.pdf`,
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
}
