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

export const routes: Routes = [
    { path: '', redirectTo: '/overview', pathMatch: 'full' },
    { path: 'overview', component: OverviewComponent },
    { path: 'customer-form', component: CustomerFormComponent},
    {path: 'item-form',component: ItemFormComponent},
    { path: 'transaction-history', component: TransactionHistoryComponent},
    {path: 'invoices',component: InvoiceFormComponent},
    {path: 'create-invoice',component: CreateInvoiceComponent},
    { path: 'view-invoice-template/:invoiceId', component: InvoiceTemplateComponent },
    {path:'cash-balance',component: CashBalanceComponent},
    {path:'auth/sign-in',component: SignInComponent},
    //{ path: 'login', component: LoginComponent },
    { path: 'auth/register', component: RegisterComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'users', component: UserManagementComponent, canActivate: [AuthGuard], data: { role: 'Admin' } },
    { path: 'unauthorized', component: UnauthorizedComponent },
    { path: 'auth/sign-up', component: SignUpComponent, canActivate: [AuthGuard], data: { role: 'Admin' } }

];
