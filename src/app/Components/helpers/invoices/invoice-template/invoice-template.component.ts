import { Component, OnInit } from '@angular/core';
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
})
export class InvoiceTemplateComponent implements OnInit {
  invoiceId: number = 0; // Holds the invoice ID from the route parameter
  invoice: InvoiceDto | null = null; // Holds the invoice data
  transaction: TransactionDto | null = null; // Holds the transaction data
  customer: GetCustomerDTO | null = null; // Holds the customer data
  items: GetItemDTO[] | null = null; // Holds the item data
  errorMessage: string | null = null; // Holds any error messages
  dateGenerated:string | null = null;

  constructor(private apiService: ApiService, private route: ActivatedRoute,private dateService: DateService,) { }

  ngOnInit(): void {
    // Get the invoice ID from the route parameters
    this.invoiceId = +this.route.snapshot.paramMap.get('invoiceId')!;
    console.log("invoiceId: ", this.invoiceId)
    // Fetch the invoice details using the obtained invoice ID
    this.getInvoiceDetails();
  }

  getInvoiceDetails(): void {
    // Make a call to the ApiService to fetch invoice details
    this.apiService.getInvoiceDetails(this.invoiceId).subscribe({
      next: (data) => {
        console.log("data: ", data)
        // Assign the fetched data to the respective properties
        this.invoice = data.invoice;
        this.transaction = data.transactions[0];
        console.log("this.transaction",this.transaction)
        this.customer = data.customer;
        this.items = this.transaction.items;
        this.dateGenerated = this.formatDate(this.invoice.dateGenerated)
        console.log("this.transaction ", this.transaction)
        console.log("this.items: ", this.items)
        console.log("customer ",this.customer)
      },
      error: (err) => {
        // Handle any errors that occur during the API call
        this.errorMessage = err;
      }
    });
  }

  downloadTemplate(): void {
    const element = document.getElementById('printable-template');
    if (element) {
      const options = {
        margin: 2,
        filename: `${this.invoice?.invoiceNo}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 1 },
        jsPDF: { format: 'a4', orientation: 'landscape' } // Half A4 size in landscape orientation
      };
      html2pdf().from(element).set(options).save();
    }
  }

  formatDate(dateString: string): string {
    return this.dateService.formatDateTime(dateString);
  }


  /*
  downloadTemplate(): void {
    const element = document.getElementById('printable-template');
    if (element) {
      const options = {
        margin: 1,
        filename: this.invoice?.invoiceNo,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 1 },
        jsPDF: { format: 'a4', orientation: 'landscape' }
      };
      html2pdf().from(element).set(options).save();
    }
  }
    */
  printTemplate(): void {
    const printContents = document.getElementById('printable-template')?.innerHTML;
    if (printContents) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
     // window.location.reload(); // Reload the page to restore the original content
    }
  }
}
