import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../Services/api-service.service';
import { InvoiceDto } from '../../../invoice-form/invoice.model';
import { GetCustomerDTO, TransactionDto } from '../../../transaction-history/transaction.model';
import html2pdf from 'html2pdf.js';
import { DateService } from '../../../../Services/date-service.service';
import { ConfigService } from '../../../../Services/config-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settlement-invoice-template',
  standalone: true,
  templateUrl: './settlement-invoice-template.component.html',
  styleUrls: ['./settlement-invoice-template.component.scss'],
  imports: [CommonModule]
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
    private dateService: DateService,
    private configService: ConfigService,
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
    return this.dateService.formatDate(dateString);
  }
    // Function to download the invoice as a PDF using html2pdf.js
    downloadTemplate(): void {
      const element = document.getElementById('printable-template');
      if (element) {
        // Clone the element to avoid modifying the original
        const clonedElement = element.cloneNode(true) as HTMLElement;
        
        // Ensure the cloned element has proper styling
        clonedElement.style.width = '210mm';
        clonedElement.style.minHeight = '297mm';
        clonedElement.style.padding = '10mm';
        clonedElement.style.margin = '0';
        clonedElement.style.backgroundColor = '#ffffff';
        clonedElement.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        clonedElement.style.fontSize = '12px';
        clonedElement.style.lineHeight = '1.4';
        
        const options = {
          margin: [5, 5, 5, 5], // Minimal margins for better content fit
          filename: `Settlement-Invoice-${this.settlementInvoice?.invoiceNo || 'template'}.pdf`,
          image: { 
            type: 'jpeg', 
            quality: 0.98 
          },
          html2canvas: {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
            letterRendering: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            width: 794, // A4 width in pixels at 96 DPI
            height: 1123 // A4 height in pixels at 96 DPI
          },
          jsPDF: { 
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            putOnlyUsedFonts: true,
            floatPrecision: 16,
            compress: true
          },
          pagebreak: { 
            mode: ['avoid-all', 'css', 'legacy'],
            before: '.page-break-before',
            after: '.page-break-after',
            avoid: '.no-page-break'
          }
        };
    
        html2pdf().from(clonedElement).set(options).save();
      } else {
        console.error('Printable template element not found');
      }
    }

  // Function to print the invoice with proper styling
  printTemplate(): void {
    const printableElement = document.getElementById('printable-template');
    if (printableElement) {
      // Save original content and styles
      const originalContents = document.body.innerHTML;
      const originalTitle = document.title;
      
      // Create comprehensive print styles
      const printStyle = document.createElement('style');
      printStyle.innerHTML = `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            font-size: 10px !important;
            line-height: 1.2 !important;
            color: #000 !important;
            background: white !important;
          }
          .invoice-container {
            margin: 0 !important;
            padding: 5mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: none !important;
            width: 210mm !important;
            min-height: 287mm !important;
            max-height: 287mm !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
            position: relative !important;
            display: block !important;
          }
          #printable-template {
            width: 210mm !important;
            min-height: 287mm !important;
            max-height: 287mm !important;
            margin: 0 !important;
            padding: 5mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            overflow: hidden !important;
            position: relative !important;
            display: block !important;
          }
          .d-print-none {
            display: none !important;
          }
          .row {
            display: flex !important;
            flex-wrap: wrap !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .col-6, .col-md-6 {
            width: 48% !important;
            display: inline-block !important;
            vertical-align: top !important;
            margin-right: 2% !important;
            padding: 0 !important;
          }
          .col-6:last-child, .col-md-6:last-child {
            margin-right: 0 !important;
          }
          .hstack {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 0;
            padding: 0;
          }
        }
        
        /* Non-print styles reset */
        .invoice-container {
          display: block !important;
          position: relative !important;
        }
        #printable-template {
          display: block !important;
          position: relative !important;
        }
        .row {
          display: flex !important;
          flex-wrap: wrap !important;
        }
        .col-6, .col-md-6 {
          flex: 0 0 48% !important;
          max-width: 48% !important;
          margin-right: 2% !important;
        }
        .col-6:last-child, .col-md-6:last-child {
          margin-right: 0 !important;
        }
      `;
      
      // Add print styles to head
      document.head.appendChild(printStyle);
      
      // Clone and prepare the printable element
      const clonedElement = printableElement.cloneNode(true) as HTMLElement;
      
      // Apply inline styles to ensure proper layout
      clonedElement.style.width = '210mm';
      clonedElement.style.minHeight = '287mm';
      clonedElement.style.maxHeight = '287mm';
      clonedElement.style.padding = '5mm';
      clonedElement.style.margin = '0';
      clonedElement.style.overflow = 'hidden';
      clonedElement.style.position = 'relative';
      clonedElement.style.display = 'block';
      clonedElement.style.backgroundColor = '#ffffff';
      clonedElement.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
      clonedElement.style.fontSize = '10px';
      clonedElement.style.lineHeight = '1.2';
      clonedElement.style.color = '#000';
      
      // Replace body content with printable content
      document.body.innerHTML = clonedElement.outerHTML;
      document.title = `Settlement-Invoice-${this.settlementInvoice?.invoiceNo || 'Print'}`;
      
      // Force layout recalculation
      document.body.offsetHeight;
      
      // Wait for styles to be applied, then print
      setTimeout(() => {
        window.print();
        
        // Restore original content after printing
        setTimeout(() => {
          document.body.innerHTML = originalContents;
          document.title = originalTitle;
          
          // Remove the temporary style
          if (printStyle.parentNode) {
            printStyle.parentNode.removeChild(printStyle);
          }
        }, 200);
      }, 300);
    }
  }
}
