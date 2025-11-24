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
import { SettlementInvoiceTemplateComponent } from './Components/helpers/invoices/settlement-invoice-template/settlement-invoice-template.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { IncomeReportComponent } from './Components/helpers/reports/income-report/income-report.component';
import { ProfileComponent } from './Components/profile/profile.component';
import { UnifiedTransactionHistoryComponent } from './Components/unified-transaction-history/unified-transaction-history.component';
import { CashierDashboardComponent } from './Components/cashier-dashboard/cashier-dashboard.component';
import { HelpComponent } from './Components/help/help.component';

export const routes: Routes = [
    { path: '', redirectTo: '/overview', pathMatch: 'full'},
    { path: 'cashier', component: CashierDashboardComponent, canActivate: [AuthGuard], data: { role: 'Cashier', isCashierMode: true } },
    { path: 'overview', component: OverviewComponent, canActivate: [AuthGuard], data: { role: 'Cashier' } },
    { path: 'profile', component: ProfileComponent }, // Safe route for logged-in users without full permissions
    { path: 'customers', component: CustomerFormComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    {path: 'items',component: ItemFormComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    { path: 'transaction-history', component: UnifiedTransactionHistoryComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    { path: 'transaction-history-legacy', component: TransactionHistoryComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    {path: 'invoices',component: InvoiceFormComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
   // { path: 'create-initial-invoice', component: CreateInvoiceComponent, canActivate: [AuthGuard], data: { role: 'Cashier' } },
   // { path: 'create-installment-invoice', component: CreateInstallmentPaymentInvoiceComponent, canActivate: [AuthGuard], data: { role: 'Cashier' } },
   // { path: 'create-settlement-invoice', component: CreateSettlementInvoiceComponent, canActivate: [AuthGuard], data: { role: 'Cashier' } },
    { path: 'view-invoice-template/:invoiceId', component: InvoiceTemplateComponent, canActivate: [AuthGuard], data: { role: 'Cashier' } },
    { path: 'view-installment-invoice-template/:invoiceId', component: InstallmentInvoiceTemplateComponent, canActivate: [AuthGuard], data: { role: 'Cashier' } },
    { path: 'view-settlement-invoice-template/:invoiceId', component: SettlementInvoiceTemplateComponent, canActivate: [AuthGuard], data: { role: 'Cashier' } },
    {path:'cash-balance',component: CashBalanceComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    {path:'auth/sign-in',component: SignInComponent},
    { path: 'auth/register', component: RegisterComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'config/users', component: UserManagementComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'unauthorized', component: UnauthorizedComponent },
    { path: 'auth/sign-up', component: SignUpComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    // Note: AddCustomerComponent is now used as a modal, not a route
    // {path:'customers/create-customer',component: AddCustomerComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    {path:'config/pricings',component: KaratValueComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    {path:'reports',component: ReportsComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    {path:'reports/by-customer',component: ReportByCustomerComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    {path:'reports/transactions',component: UnifiedTransactionHistoryComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    {path:'create-invoice',component: DashboardComponent, canActivate: [AuthGuard], data: { role: 'Cashier' }},
    { path: 'help', component: HelpComponent },
];
