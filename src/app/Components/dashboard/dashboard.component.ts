import { Component } from '@angular/core';
import { CreateInstallmentPaymentInvoiceComponent } from '../helpers/invoices/create-installment-payment-invoice/create-installment-payment-invoice.component';
import { InvoiceTypesComponent } from '../helpers/invoices/invoice-types/invoice-types.component';
import { CreateInvoiceComponent } from '../helpers/invoices/create-invoice/create-invoice.component';
import { CreateSettlementInvoiceComponent } from '../helpers/invoices/create-settlement-invoice/create-settlement-invoice.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CreateInstallmentPaymentInvoiceComponent,
    InvoiceTypesComponent,
    CreateInvoiceComponent,
    CreateSettlementInvoiceComponent,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  //showInvoiceType: string | null = null;
}
