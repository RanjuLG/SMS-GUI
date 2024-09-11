import { Routes } from '@angular/router';
import { OverviewComponent } from './Components/overview/overview.component';
import { CustomerFormComponent } from './Components/customer-form/customer-form.component';
import { ItemFormComponent } from './Components/item-form/item-form.component';
import { TransactionHistoryComponent } from './Components/transaction-history/transaction-history.component';
import { InvoiceFormComponent } from './Components/invoice-form/invoice-form.component';
import { CreateInvoiceComponent } from './Components/helpers/invoices/create-invoice/create-invoice.component';
import { InvoiceTemplateComponent } from './Components/helpers/invoices/invoice-template/invoice-template.component';
import { CashBalanceComponent } from './Components/cash-balance/cash-balance.component';
import { SignInComponent } from './Components/sign-in/sign-in.component';
import { LoginComponent } from './Components/login/login.component';
import { RegisterComponent } from './Components/register/register.component';
import { AuthGuard } from './Services/auth.guard';
import { UserManagementComponent } from './Components/user-management/user-management.component';
import { UnauthorizedComponent } from './Components/helpers/unauthorized/unauthorized.component';
import { SignUpComponent } from './Components/sign-up/sign-up.component';
import { AddCustomerComponent } from './Components/helpers/customer/add-customer/add-customer.component';
import { KaratValueComponent } from './Components/pricing/karat-value.component';
import { CreateInstallmentPaymentInvoiceComponent } from './Components/helpers/invoices/create-installment-payment-invoice/create-installment-payment-invoice.component';
import { InstallmentInvoiceTemplateComponent } from './Components/helpers/invoices/installment-invoice-template/installment-invoice-template.component';
import { CreateSettlementInvoiceComponent } from './Components/helpers/invoices/create-settlement-invoice/create-settlement-invoice.component';
import { ReportsComponent } from './Components/reports/reports.component';
import { ReportByCustomerComponent } from './Components/helpers/reports/report-by-customer/report-by-customer.component';

export const routes: Routes = [
    { path: '', redirectTo: '/overview', pathMatch: 'full'},
    { path: 'overview', component: OverviewComponent, canActivate: [AuthGuard], data: { role: 'Cashier' } },
    { path: 'customer-form', component: CustomerFormComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    {path: 'item-form',component: ItemFormComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    { path: 'transaction-history', component: TransactionHistoryComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    {path: 'invoices',component: InvoiceFormComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    { path: 'create-initial-invoice', component: CreateInvoiceComponent, canActivate: [AuthGuard], data: { role: 'Cashier' } },
    { path: 'create-installment-invoice', component: CreateInstallmentPaymentInvoiceComponent, canActivate: [AuthGuard], data: { role: 'Cashier' } },
    { path: 'create-settlement-invoice', component: CreateSettlementInvoiceComponent, canActivate: [AuthGuard], data: { role: 'Cashier' } },
    { path: 'view-invoice-template/:invoiceId', component: InvoiceTemplateComponent, canActivate: [AuthGuard], data: { role: 'Cashier' } },
    { path: 'view-installment-invoice-template/:invoiceId', component: InstallmentInvoiceTemplateComponent, canActivate: [AuthGuard], data: { role: 'Cashier' } },
    {path:'cash-balance',component: CashBalanceComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    {path:'auth/sign-in',component: SignInComponent},
   // { path: 'login', component: LoginComponent },
    { path: 'auth/register', component: RegisterComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'users', component: UserManagementComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'unauthorized', component: UnauthorizedComponent },
    { path: 'auth/sign-up', component: SignUpComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    {path:'customers/create-customer',component: AddCustomerComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    {path:'karatages',component: KaratValueComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    {path:'reports',component: ReportsComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    {path:'reports/by-customer',component: ReportByCustomerComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},

];


//ReportByCustomerComponent