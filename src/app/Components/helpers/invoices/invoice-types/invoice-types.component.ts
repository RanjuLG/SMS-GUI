import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import { CreateInvoiceComponent } from '../create-invoice/create-invoice.component';
import { CreateSettlementInvoiceComponent } from '../create-settlement-invoice/create-settlement-invoice.component';
import { CreateInstallmentPaymentInvoiceComponent } from '../create-installment-payment-invoice/create-installment-payment-invoice.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-types',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CreateInvoiceComponent,
    CreateSettlementInvoiceComponent,
    CreateInstallmentPaymentInvoiceComponent,
  ],
  templateUrl: './invoice-types.component.html',
  styleUrl: './invoice-types.component.scss'
})
export class InvoiceTypesComponent {


  showInvoiceType: string | null = null;

  
}
