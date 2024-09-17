import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service'
import { CreateCustomerDto, CustomerDto } from '../Components/customer-form/customer.model';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreateItemDto, ItemDto } from '../Components/item-form/item.model';
import { CreateInvoiceDto, InvoiceDto, InvoiceDto2, InvoiceDto_, LoanInfoDto, UpdateInvoiceDto } from '../Components/invoice-form/invoice.model';
import { CreateTransactionDto, GetCustomerDTO, GetItemDTO, TransactionDto } from '../Components/transaction-history/transaction.model';
import { forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators'; // Make sure these models are created
import { AuthService } from './auth.service';
import { CreateUserDTO, User, UserDTO } from '../Components/user-management/user.model';
import { Pricing, LoanPeriod,Karat, EditPricing, CreatePricing, PricingBatchDTO } from '../Components/pricing/karat-value.model';
import { ReportByCustomer } from '../Components/reports/reports.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private configService: ConfigService,private authService: AuthService) { }
  
  private handleError(error: any): Observable<never> {
    console.error('API call failed:', error);
    return throwError(() => new Error(error.message || 'Server Error'));
  }


  private checkLoggedIn(): boolean {
    if (!this.authService.isLoggedIn) {
      console.error('User is not logged in');
      this.authService.logout();
      return false;
    }
    return true;
  }

//Customers
  createCustomer(customerDto: CreateCustomerDto): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.post(`${this.configService.apiUrl}/api/customers`, customerDto);
  }

  updateCustomer(customerId: number, customerDto: CreateCustomerDto): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.put(`${this.configService.apiUrl}/api/customers/${customerId}/customer`, customerDto);
  }

  getCustomers(from: Date, to: Date): Observable<CustomerDto[]> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    // Convert dates to ISO strings
    const fromStr = from.toISOString();
    const toStr = to.toISOString();
  
    // Construct the URL with query parameters
    const url = `${this.configService.apiUrl}/api/customers?From=${encodeURIComponent(fromStr)}&To=${encodeURIComponent(toStr)}`;
  
    return this.http.get<CustomerDto[]>(url);
  }
  

  getCustomerById(customerId: number): Observable<CustomerDto> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.get<CustomerDto>(`${this.configService.apiUrl}/api/customers/${customerId}/customer`);
  }

  deleteCustomer(customerId: number): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.delete(`${this.configService.apiUrl}/api/customers/${customerId}/customer`);
  }

  deleteMultipleCustomers(customerIds: number[]): Observable<any>{
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

    return this.http.delete(`${this.configService.apiUrl}/api/customers/delete-multiple`, { body: customerIds });

  }

  getCustomersByIds(customerIds: number[]): Observable<CustomerDto[]> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.post<CustomerDto[]>(`${this.configService.apiUrl}/api/customers/byIds`, customerIds);
  }

  getCustomerByNIC(customerNIC: string): Observable<CustomerDto> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.post<CustomerDto>(`${this.configService.apiUrl}/api/customers/byNIC`, JSON.stringify(customerNIC), {
      headers: { 'Content-Type': 'application/json' }
    });
}


  


  //Items

  createItem(itemDto: CreateItemDto): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.post(`${this.configService.apiUrl}/api/items`, itemDto);
  }

  updateItem(itemId: number, itemDto: CreateItemDto): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.put(`${this.configService.apiUrl}/api/items/${itemId}/item`, itemDto);
  }

  getItems(from: Date, to: Date): Observable<ItemDto[]> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    
    const fromStr = from.toISOString();
    const toStr = to.toISOString();

    return this.http.get<ItemDto[]>(`${this.configService.apiUrl}/api/items?From=${encodeURIComponent(fromStr)}&To=${encodeURIComponent(toStr)}`);
  }

  getItemById(itemId: number): Observable<ItemDto> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.get<ItemDto>(`${this.configService.apiUrl}/api/items/${itemId}/item`);
  }

  deleteItem(itemId: number): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.delete(`${this.configService.apiUrl}/api/items/${itemId}/item`);
  }

  deleteMultipleItems(itemIds: number[]): Observable<any>{
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

    return this.http.delete(`${this.configService.apiUrl}/api/items/delete-multiple`, { body: itemIds });

  }
  getItemsByCustomerNIC(nic: string): Observable<ItemDto[]> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.get<ItemDto[]>(`${this.configService.apiUrl}/api/items/customer/${nic}`);
  }


  //invoices

  createInvoice(invoiceDto: CreateInvoiceDto, initialInvoiceNumber: string, installmentNumber: number): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
    const url = `${this.configService.apiUrl}/api/invoices/${initialInvoiceNumber}/${installmentNumber}`; 
  
    return this.http.post(url, invoiceDto);
  }

  updateInvoice(invoiceId: number, invoiceDto: CreateInvoiceDto): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.put(`${this.configService.apiUrl}/api/invoices/${invoiceId}`, invoiceDto);
  }

  getInvoices(from: Date, to: Date): Observable<InvoiceDto[]> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

    const fromStr = from.toISOString();
    const toStr = to.toISOString();

    return this.http.get<InvoiceDto[]>(`${this.configService.apiUrl}/api/invoices?From=${encodeURIComponent(fromStr)}&To=${encodeURIComponent(toStr)}`);
  }

  getInvoiceById(invoiceId: number): Observable<InvoiceDto_> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.get<InvoiceDto_>(`${this.configService.apiUrl}/api/invoices/${invoiceId}`);
  }

  deleteInvoice(invoiceId: number): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.delete(`${this.configService.apiUrl}/api/invoices/${invoiceId}`);
  }

  deleteMultipleInvoices(invoiceIds: number[]): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.delete(`${this.configService.apiUrl}/api/invoices/delete-multiple`, { body: invoiceIds });
  }

  getInvoicesByCustomerNIC(nic: string): Observable<InvoiceDto2[]> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.get<InvoiceDto2[]>(`${this.configService.apiUrl}/api/invoices/customer/${nic}`);
  }

  getInvoiceByInvoiceNo(invoiceNo: string): Observable<InvoiceDto[]> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.get<InvoiceDto[]>(`${this.configService.apiUrl}/api/invoices/invoiceNo/${invoiceNo}`);
  }

  getLoanInfoByInitialInvoiceNo(invoiceNo: string): Observable<LoanInfoDto> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.get<LoanInfoDto>(`${this.configService.apiUrl}/api/invoices/InitialInvoice/${invoiceNo}`);
  }


 // Transactions
 createTransaction(transactionDto: CreateTransactionDto): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.post(`${this.configService.apiUrl}/api/transactions`, transactionDto)
    .pipe(catchError(this.handleError));
}


getTransactions(from: Date, to: Date): Observable<TransactionDto[]> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  const fromStr = from.toISOString();
    const toStr = to.toISOString();
  return this.http.get<TransactionDto[]>(`${this.configService.apiUrl}/api/transactions?From=${encodeURIComponent(fromStr)}&To=${encodeURIComponent(toStr)}`)
    .pipe(catchError(this.handleError));
}

getTransactionById(transactionId: number): Observable<TransactionDto> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<TransactionDto>(`${this.configService.apiUrl}/api/transactions/${transactionId}`)
    .pipe(catchError(this.handleError));
}
getTransactionsByIds(transactionIds: number[]): Observable<TransactionDto[]> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.post<TransactionDto[]>(`${this.configService.apiUrl}/api/transactions/byIds`, transactionIds)
    .pipe(catchError(this.handleError));
}

deleteTransaction(transactionId: number): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.delete(`${this.configService.apiUrl}/api/transactions/${transactionId}`)
    .pipe(catchError(this.handleError));
}

deleteMultipleTransactions(transactionIds: number[]): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.request('delete', `${this.configService.apiUrl}/api/transactions/delete-multiple`, { body: transactionIds })
    .pipe(catchError(this.handleError));
}

getTransactionsByCustomerNIC(nic: string): Observable<TransactionDto[]> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<TransactionDto[]>(`${this.configService.apiUrl}/api/transactions/customer/${nic}`)
  .pipe(catchError(this.handleError));
}


getInvoiceDetails(invoiceId: number): Observable<{ invoice: InvoiceDto_, transactions: TransactionDto[], customer: GetCustomerDTO, items: GetItemDTO[] }> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.getInvoiceById(invoiceId).pipe(
    switchMap(invoice => 
      this.getTransactionsByIds([invoice.transactionId]).pipe(  
        map(transactions => {
          const customer = transactions[0].customer;
          const items = transactions[0].items;

          return {
            invoice,
            transactions,
            customer,
            items
          };
        })
      )
    )
  )
  .pipe(catchError(this.handleError));
}

//users
getUsers(){
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<User[]>(`${this.configService.apiUrl}/api/account/users`)
  .pipe(catchError(this.handleError));
}

addUser(token: string,UserDto:CreateUserDTO){
  
  if(!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.put(`${this.configService.apiUrl}/api/account/register?token=${token}`,UserDto);
}

updateUser(userId: string,UserDto:UserDTO){
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.put(`${this.configService.apiUrl}/api/account/user/${userId}`,UserDto);

}

deleteUsers(userIds: string[]){
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.delete(`${this.configService.apiUrl}/api/account/users/delete-multiple`,{body: userIds})
  .pipe(catchError(this.handleError));

}

// Services for Karatage, LoanPeriod, and Pricing operations

// Karatage Operations

getAllKarats(): Observable<Karat[]> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<Karat[]>(`${this.configService.apiUrl}/api/karatage/karats`);
}

getKaratById(karatId: number): Observable<Karat> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<Karat>(`${this.configService.apiUrl}/api/karatage/karats/${karatId}`);
}

createKarat(karat: Karat): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.post(`${this.configService.apiUrl}/api/karatage/karats`, karat);
}

updateKarat(karatId: number, karat: Karat): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.put(`${this.configService.apiUrl}/api/karatage/karats/${karatId}`, karat);
}

deleteKarat(karatId: number): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.delete(`${this.configService.apiUrl}/api/karatage/karats/${karatId}`);
}

// LoanPeriod Operations

getAllLoanPeriods(): Observable<LoanPeriod[]> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<LoanPeriod[]>(`${this.configService.apiUrl}/api/karatage/loanperiods`);
}

getLoanPeriodById(loanPeriodId: number): Observable<LoanPeriod> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<LoanPeriod>(`${this.configService.apiUrl}/api/karatage/loanperiods/${loanPeriodId}`);
}

createLoanPeriod(loanPeriod: LoanPeriod): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.post(`${this.configService.apiUrl}/api/karatage/loanperiods`, loanPeriod);
}

updateLoanPeriod(loanPeriodId: number, loanPeriod: LoanPeriod): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.put(`${this.configService.apiUrl}/api/karatage/loanperiods/${loanPeriodId}`, loanPeriod);
}

deleteLoanPeriod(loanPeriodId: number): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.delete(`${this.configService.apiUrl}/api/karatage/loanperiods/${loanPeriodId}`);
}

// Pricing Operations

getAllPricings(): Observable<Pricing[]> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<Pricing[]>(`${this.configService.apiUrl}/api/karatage/pricings`);
}

getPricingById(pricingId: number): Observable<Pricing> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<Pricing>(`${this.configService.apiUrl}/api/karatage/pricings/${pricingId}`);
}

createPricing(pricing: CreatePricing): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.post(`${this.configService.apiUrl}/api/karatage/pricings`, pricing);
}
createPricingBatch(pricing: PricingBatchDTO[]): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.post(`${this.configService.apiUrl}/api/karatage/pricings/batch`, pricing);
}

updatePricing(pricingId: number, pricing: EditPricing): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.put(`${this.configService.apiUrl}/api/karatage/pricings/${pricingId}`, pricing);
}

deletePricing(pricingId: number): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.delete(`${this.configService.apiUrl}/api/karatage/pricings/${pricingId}`);
}

// Custom Operation: Get Pricings by Karat and LoanPeriod
getPricingsByKaratAndLoanPeriod(karatId: any, loanPeriodId: number): Observable<Pricing[]> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<Pricing[]>(`${this.configService.apiUrl}/api/karatage/pricings/karat/${karatId}/loanperiod/${loanPeriodId}`);
}



// Reports

getReportByCustomer(customerNIC: any): Observable<ReportByCustomer> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<ReportByCustomer>(`${this.configService.apiUrl}/api/reports/customer/${customerNIC}`);
}

}


