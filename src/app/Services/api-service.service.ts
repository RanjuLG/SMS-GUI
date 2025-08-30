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
import { Overview, ReportByCustomer, TransactionReportDto } from '../Components/reports/reports.model';

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
createCustomer(customerDto: CreateCustomerDto, nicPhotoFile: File | null): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

  const formData = new FormData();

  // Append the customer details to the FormData
  formData.append('customerNIC', customerDto.customerNIC);
  formData.append('customerName', customerDto.customerName);
  formData.append('customerAddress', customerDto.customerAddress);
  formData.append('customerContactNo', customerDto.customerContactNo);

  // Append the NIC photo file if it exists
  if (nicPhotoFile) {
    formData.append('nicPhoto', nicPhotoFile);
  }

  // Make a POST request with the FormData
  return this.http.post(`${this.configService.apiUrl}/api/customers`, formData);
}

updateCustomer(customerId: number, customerDto: CreateCustomerDto, nicPhotoFile: File | null): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

  const formData = new FormData();
  formData.append('customerNIC', customerDto.customerNIC);
  formData.append('customerName', customerDto.customerName);
  formData.append('customerAddress', customerDto.customerAddress);
  formData.append('customerContactNo', customerDto.customerContactNo);
  
  if (nicPhotoFile) {
    formData.append('nicPhoto', nicPhotoFile);  // Append file only if present
  } else {
    formData.append('nicPhoto', '');  // Add an empty string or skip this
  }
  

  // Make a PUT request with the FormData
  return this.http.put(`${this.configService.apiUrl}/api/customers/${customerId}/customer`, formData);
}


  getCustomers(from: Date, to: Date, page: number = 1, pageSize: number = 10, search?: string, sortBy?: string, sortOrder?: string): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    // Convert dates to ISO strings
    const fromStr = from.toISOString();
    const toStr = to.toISOString();
  
    // Build query parameters
    let params = new HttpParams()
      .set('From', fromStr)
      .set('To', toStr)
      .set('Page', page.toString())
      .set('PageSize', pageSize.toString());
    
    if (search) {
      params = params.set('Search', search);
    }
    if (sortBy) {
      params = params.set('SortBy', sortBy);
    }
    if (sortOrder) {
      params = params.set('SortOrder', sortOrder);
    }
  
    // Construct the URL with query parameters
    const url = `${this.configService.apiUrl}/api/customers`;
  
    return this.http.get<any>(url, { params });
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

  getItems(from: Date, to: Date, page: number = 1, pageSize: number = 10, search?: string, sortBy?: string, sortOrder?: string, customerNIC?: string): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    
    const fromStr = from.toISOString();
    const toStr = to.toISOString();

    // Build query parameters
    let params = new HttpParams()
      .set('From', fromStr)
      .set('To', toStr)
      .set('Page', page.toString())
      .set('PageSize', pageSize.toString());
    
    if (search) {
      params = params.set('Search', search);
    }
    if (sortBy) {
      params = params.set('SortBy', sortBy);
    }
    if (sortOrder) {
      params = params.set('SortOrder', sortOrder);
    }
    if (customerNIC) {
      params = params.set('CustomerNIC', customerNIC);
    }

    return this.http.get<any>(`${this.configService.apiUrl}/api/items`, { params });
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

  getInvoices(from: Date, to: Date, page: number = 1, pageSize: number = 10, search?: string, sortBy?: string, sortOrder?: string, customerNIC?: string, status?: number, invoiceTypeId?: number): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

    const fromStr = from.toISOString();
    const toStr = to.toISOString();

    // Build query parameters
    let params = new HttpParams()
      .set('From', fromStr)
      .set('To', toStr)
      .set('Page', page.toString())
      .set('PageSize', pageSize.toString());
    
    if (search) {
      params = params.set('Search', search);
    }
    if (sortBy) {
      params = params.set('SortBy', sortBy);
    }
    if (sortOrder) {
      params = params.set('SortOrder', sortOrder);
    }
    if (customerNIC) {
      params = params.set('CustomerNIC', customerNIC);
    }
    if (status !== undefined) {
      params = params.set('Status', status.toString());
    }
    if (invoiceTypeId !== undefined) {
      params = params.set('InvoiceTypeId', invoiceTypeId.toString());
    }

    return this.http.get<any>(`${this.configService.apiUrl}/api/invoices`, { params });
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


getTransactions(from: Date, to: Date, page: number = 1, pageSize: number = 10, search?: string, sortBy?: string, sortOrder?: string, customerNIC?: string, transactionType?: number, minAmount?: number, maxAmount?: number): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  const fromStr = from.toISOString();
  const toStr = to.toISOString();

  // Build query parameters
  let params = new HttpParams()
    .set('From', fromStr)
    .set('To', toStr)
    .set('Page', page.toString())
    .set('PageSize', pageSize.toString());
  
  if (search) {
    params = params.set('Search', search);
  }
  if (sortBy) {
    params = params.set('SortBy', sortBy);
  }
  if (sortOrder) {
    params = params.set('SortOrder', sortOrder);
  }
  if (customerNIC) {
    params = params.set('CustomerNIC', customerNIC);
  }
  if (transactionType !== undefined) {
    params = params.set('TransactionType', transactionType.toString());
  }
  if (minAmount !== undefined) {
    params = params.set('MinAmount', minAmount.toString());
  }
  if (maxAmount !== undefined) {
    params = params.set('MaxAmount', maxAmount.toString());
  }

  return this.http.get<any>(`${this.configService.apiUrl}/api/transactions`, { params })
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
getUsers(page: number = 1, pageSize: number = 10, search?: string, sortBy?: string, sortOrder?: string, role?: string): Observable<any>{
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  // Build query parameters
  let params = new HttpParams()
    .set('Page', page.toString())
    .set('PageSize', pageSize.toString());
  
  if (search) {
    params = params.set('Search', search);
  }
  if (sortBy) {
    params = params.set('SortBy', sortBy);
  }
  if (sortOrder) {
    params = params.set('SortOrder', sortOrder);
  }
  if (role) {
    params = params.set('Role', role);
  }

  return this.http.get<any>(`${this.configService.apiUrl}/api/account/users`, { params })
  .pipe(catchError(this.handleError));
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

getAllKarats(page: number = 1, pageSize: number = 10, search?: string, sortBy?: string, sortOrder?: string): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  // Build query parameters
  let params = new HttpParams()
    .set('Page', page.toString())
    .set('PageSize', pageSize.toString());
  
  if (search) {
    params = params.set('Search', search);
  }
  if (sortBy) {
    params = params.set('SortBy', sortBy);
  }
  if (sortOrder) {
    params = params.set('SortOrder', sortOrder);
  }

  return this.http.get<any>(`${this.configService.apiUrl}/api/karatage/karats`, { params });
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

getAllLoanPeriods(page: number = 1, pageSize: number = 10, search?: string, sortBy?: string, sortOrder?: string): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  // Build query parameters
  let params = new HttpParams()
    .set('Page', page.toString())
    .set('PageSize', pageSize.toString());
  
  if (search) {
    params = params.set('Search', search);
  }
  if (sortBy) {
    params = params.set('SortBy', sortBy);
  }
  if (sortOrder) {
    params = params.set('SortOrder', sortOrder);
  }

  return this.http.get<any>(`${this.configService.apiUrl}/api/karatage/loanperiods`, { params });
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

getAllPricings(page: number = 1, pageSize: number = 10, search?: string, sortBy?: string, sortOrder?: string, karatId?: number, loanPeriodId?: number, minPrice?: number, maxPrice?: number): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  // Build query parameters
  let params = new HttpParams()
    .set('Page', page.toString())
    .set('PageSize', pageSize.toString());
  
  if (search) {
    params = params.set('Search', search);
  }
  if (sortBy) {
    params = params.set('SortBy', sortBy);
  }
  if (sortOrder) {
    params = params.set('SortOrder', sortOrder);
  }
  if (karatId !== undefined) {
    params = params.set('KaratId', karatId.toString());
  }
  if (loanPeriodId !== undefined) {
    params = params.set('LoanPeriodId', loanPeriodId.toString());
  }
  if (minPrice !== undefined) {
    params = params.set('MinPrice', minPrice.toString());
  }
  if (maxPrice !== undefined) {
    params = params.set('MaxPrice', maxPrice.toString());
  }

  return this.http.get<any>(`${this.configService.apiUrl}/api/karatage/pricings`, { params });
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

getOverview():Observable<Overview> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<Overview>(`${this.configService.apiUrl}/api/reports/overview`);
}

}


