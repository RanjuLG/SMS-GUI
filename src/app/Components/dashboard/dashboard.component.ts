import { Component } from '@angular/core';
import { ReportByCustomerComponent } from '../helpers/reports/report-by-customer/report-by-customer.component';
import { CreateInstallmentPaymentInvoiceComponent } from '../helpers/invoices/create-installment-payment-invoice/create-installment-payment-invoice.component';
import { InvoiceTypesComponent } from '../helpers/invoices/invoice-types/invoice-types.component';
import { CreateInvoiceComponent } from '../helpers/invoices/create-invoice/create-invoice.component';
import { CreateSettlementInvoiceComponent } from '../helpers/invoices/create-settlement-invoice/create-settlement-invoice.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ReportByCustomerComponent,
    CreateInstallmentPaymentInvoiceComponent,
    InvoiceTypesComponent,
    CreateInvoiceComponent,
    CreateSettlementInvoiceComponent

  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  //showInvoiceType: string | null = null;
}
