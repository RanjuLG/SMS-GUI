import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service'
import { CreateCustomerDto, CustomerDto, CreateCustomerDTO, UpdateCustomerDTO, GetCustomerDTO, PaginatedResponse, CustomerSearchRequest, CustomerQuickSearchResponse, CustomerCountResponse } from '../Components/customer-form/customer.model';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreateItemDto, ItemDto } from '../Components/item-form/item.model';
import { CreateInvoiceDto, InvoiceDto, InvoiceDto2, InvoiceDto_, LoanInfoDto, UpdateInvoiceDto } from '../Components/invoice-form/invoice.model';
import { CreateTransactionDto, GetItemDTO, TransactionDto, TransactionCustomerDTO } from '../Components/transaction-history/transaction.model';
import { forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators'; // Make sure these models are created
import { AuthService } from './auth.service';
import { CreateUserDTO, User, UserDTO } from '../Components/user-management/user.model';
import { Pricing, LoanPeriod,Karat, EditPricing, CreatePricing, PricingBatchDTO, KaratDTO, LoanPeriodDTO, PricingDTO, PricingPutDTO } from '../Components/pricing/karat-value.model';
import { Overview, ReportByCustomer, TransactionReportDto } from '../Components/reports/reports.model';
import { NotificationService } from './notification.service';
import { 
  SystemHealth,
  DatabaseHealth,
  ServiceHealth,
  BackupStatus,
  StorageUsage,
  SystemMetrics,
  ApplicationLogs,
  SecurityStatus,
  SystemHealthOverview,
  HealthPing
} from '../Components/overview/system-health.model';
import { timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient, 
    private configService: ConfigService, 
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }
  
  /**
   * Get standard HTTP headers for authenticated requests
   */
  private getHttpHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    if (token) {
      // Validate token format before using it
      if (!this.isValidJwtFormat(token)) {
        console.error('Invalid JWT format detected in API service, cleaning up');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        throw new Error('Invalid token format');
      }
      
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('Added Authorization header with token:', token.substring(0, 50) + '...');
    }
    
    return headers;
  }

  /**
   * Get HTTP headers for multipart/form-data requests (file uploads)
   */
  private getMultipartHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Accept': 'application/json'
      // Don't set Content-Type for multipart - browser will set it automatically with boundary
    });
    
    if (token) {
      // Validate token format before using it
      if (!this.isValidJwtFormat(token)) {
        console.error('Invalid JWT format detected in API service, cleaning up');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        throw new Error('Invalid token format');
      }
      
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  /**
   * Validates if a string is in proper JWT format
   */
  private isValidJwtFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // JWT should have exactly 2 dots (3 parts)
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  /**
   * Enhanced error handling with authentication context
   */
  private handleError(error: any): Observable<never> {
    console.error('API call failed:', error);
    
    if (error.status === 401) {
      console.log('Unauthorized - handling appropriately');
      
      // Check if the error message indicates insufficient permissions vs invalid token
      const errorMessage = error.error?.message || error.message || '';
      if (errorMessage.toLowerCase().includes('permission') || 
          errorMessage.toLowerCase().includes('access denied') ||
          errorMessage.toLowerCase().includes('insufficient')) {
        this.notificationService.showUnauthorizedPopup();
      } else {
        // Token is invalid or expired
        this.authService.logout();
      }
    }
    
    return throwError(() => new Error(error.message || 'Server Error'));
  }

  /**
   * Check if user is logged in and handle authentication
   */
  private checkLoggedIn(): boolean {
    if (!this.authService.isLoggedIn) {
      console.error('User is not logged in');
      this.authService.logout();
      return false;
    }
    return true;
  }

  /**
   * Convert Date to local ISO string format for backend
   * Backend expects local time, not UTC
   */
  private toLocalISOString(date: Date): string {
    // Simply return the date as ISO string - no timezone adjustment needed
    // The date object already represents the correct local date/time
    return date.toISOString();
  }

//Customers
  // Create new customer - Updated to use config endpoints
  createCustomer(customerData: CreateCustomerDTO): Observable<GetCustomerDTO> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

    const formData = new FormData();
    formData.append('customerName', customerData.customerName);
    formData.append('customerAddress', customerData.customerAddress);
    formData.append('customerNIC', customerData.customerNIC);
    formData.append('customerContactNo', customerData.customerContactNo);
    
    if (customerData.customerNICPhoto) {
      formData.append('customerNICPhoto', customerData.customerNICPhoto);
    }

    return this.http.post<GetCustomerDTO>(this.configService.getCustomerEndpoint('create'), formData, {
      headers: this.getMultipartHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateCustomer(customerId: number, customerData: UpdateCustomerDTO): Observable<GetCustomerDTO> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

    const formData = new FormData();
    
    if (customerData.customerName) formData.append('customerName', customerData.customerName);
    if (customerData.customerAddress) formData.append('customerAddress', customerData.customerAddress);
    if (customerData.customerNIC) formData.append('customerNIC', customerData.customerNIC);
    if (customerData.customerContactNo) formData.append('customerContactNo', customerData.customerContactNo);
    
    if (customerData.customerNICPhoto) {
      formData.append('customerNICPhoto', customerData.customerNICPhoto);
    }

    return this.http.put<GetCustomerDTO>(
      this.configService.getCustomerEndpoint('update', { customerId }), 
      formData, {
        headers: this.getMultipartHeaders()
      }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }


  // Get paginated customers - Updated to use config endpoints
  getCustomers(searchParams: CustomerSearchRequest): Observable<PaginatedResponse<GetCustomerDTO>> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    
    // Build query parameters according to API documentation
    let params = new HttpParams()
      .set('from', searchParams.from)
      .set('to', searchParams.to);
    
    if (searchParams.page) params = params.set('page', searchParams.page.toString());
    if (searchParams.pageSize) params = params.set('pageSize', searchParams.pageSize.toString());
    if (searchParams.search) params = params.set('search', searchParams.search);
    if (searchParams.sortBy) params = params.set('sortBy', searchParams.sortBy);
    if (searchParams.sortOrder) params = params.set('sortOrder', searchParams.sortOrder);
    if (searchParams.customerNIC) params = params.set('customerNIC', searchParams.customerNIC);
    
    return this.http.get<PaginatedResponse<GetCustomerDTO>>(this.configService.getCustomerEndpoint('getAll'), {
      headers: this.getHttpHeaders(),
      params: params
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Get customer by ID - Updated to use config endpoints
  getCustomerById(customerId: number): Observable<GetCustomerDTO> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    
    return this.http.get<GetCustomerDTO>(
      this.configService.getCustomerEndpoint('getById', { customerId }), {
        headers: this.getHttpHeaders()
      }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Delete customer - Updated to use config endpoints
  deleteCustomer(customerId: number): Observable<{ message: string }> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    
    return this.http.delete<{ message: string }>(
      this.configService.getCustomerEndpoint('delete', { customerId }), {
        headers: this.getHttpHeaders()
      }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Get customer's NIC photo - Updated to use config endpoints
  getCustomerNICPhoto(customerId: number): Observable<Blob> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    
    return this.http.get(
      this.configService.getCustomerEndpoint('getNicPhoto', { customerId }), { 
        headers: this.getHttpHeaders(),
        responseType: 'blob' 
      }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Search customers - Updated to use config endpoints
  searchCustomers(searchTerm: string): Observable<GetCustomerDTO[]> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    
    const params = new HttpParams().set('search', searchTerm);
    return this.http.get<GetCustomerDTO[]>(this.configService.getCustomerEndpoint('search'), { 
      headers: this.getHttpHeaders(),
      params 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  deleteMultipleCustomers(customerIds: number[]): Observable<any>{
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

    return this.http.delete(this.configService.getCustomerEndpoint('deleteMultiple'), { 
      headers: this.getHttpHeaders(),
      body: customerIds 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getCustomersByIds(customerIds: number[]): Observable<CustomerDto[]> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    
    return this.http.post<CustomerDto[]>(this.configService.getCustomerEndpoint('getByIds'), customerIds, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getCustomerByNIC(customerNIC: string): Observable<CustomerDto> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    return this.http.post<CustomerDto>(this.configService.getCustomerEndpoint('getByNIC'), JSON.stringify(customerNIC), {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }


  


  //Items

  createItem(itemDto: CreateItemDto): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    
    const createUrl = this.configService.getItemEndpoint('create');
    return this.http.post(createUrl, itemDto, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateItem(itemId: number, itemDto: CreateItemDto): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    
    const updateUrl = this.configService.getItemEndpoint('update', { itemId });
    return this.http.put(updateUrl, itemDto, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getItems(from: Date, to: Date, page: number = 1, pageSize: number = 10, search?: string, sortBy?: string, sortOrder?: string, customerNIC?: string): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    
    // Convert dates to local ISO strings (backend expects local time)
    const fromStr = this.toLocalISOString(from);
    const toStr = this.toLocalISOString(to);

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

    const getAllUrl = this.configService.getItemEndpoint('getAll', {
      from: fromStr,
      to: toStr,
      page,
      pageSize,
      search: search || '',
      sortBy: sortBy || '',
      sortOrder: sortOrder || '',
      customerNIC: customerNIC || ''
    });
    return this.http.get<any>(getAllUrl, { 
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getItemById(itemId: number): Observable<ItemDto> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    
    const getByIdUrl = this.configService.getItemEndpoint('getById', { itemId });
    return this.http.get<ItemDto>(getByIdUrl, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  deleteItem(itemId: number): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    
    const deleteUrl = this.configService.getItemEndpoint('delete', { itemId });
    return this.http.delete(deleteUrl, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  deleteMultipleItems(itemIds: number[]): Observable<any>{
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

    const deleteMultipleUrl = this.configService.getItemEndpoint('deleteMultiple');
    return this.http.delete(deleteMultipleUrl, { 
      headers: this.getHttpHeaders(),
      body: itemIds 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getItemsByCustomerNIC(nic: string): Observable<ItemDto[]> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    
    const getByCustomerUrl = this.configService.getItemEndpoint('getByCustomerNIC', { nic });
    return this.http.get<ItemDto[]>(getByCustomerUrl, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }


  //invoices

  createInvoice(invoiceDto: CreateInvoiceDto, initialInvoiceNumber: string, installmentNumber: number): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
    const createUrl = this.configService.getInvoiceEndpoint('create', { 
      initialInvoiceNumber, 
      installmentNumber 
    });
  
    return this.http.post(createUrl, invoiceDto, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateInvoice(invoiceId: number, invoiceDto: CreateInvoiceDto): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    const updateUrl = this.configService.getInvoiceEndpoint('update', { invoiceId });
    return this.http.put(updateUrl, invoiceDto);
  }

  getInvoices(from: Date, to: Date, page: number = 1, pageSize: number = 10, search?: string, sortBy?: string, sortOrder?: string, customerNIC?: string, status?: number, invoiceTypeId?: number): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

    // Convert dates to local ISO strings (backend expects local time)
    const fromStr = this.toLocalISOString(from);
    const toStr = this.toLocalISOString(to);

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

    const getAllUrl = this.configService.getInvoiceEndpoint('getAll', {
      from: fromStr,
      to: toStr,
      page,
      pageSize,
      search: search || '',
      sortBy: sortBy || '',
      sortOrder: sortOrder || '',
      customerNIC: customerNIC || '',
      status: status?.toString() || '',
      invoiceTypeId: invoiceTypeId?.toString() || ''
    });

    return this.http.get<any>(getAllUrl);
  }

  getInvoiceById(invoiceId: number): Observable<InvoiceDto_> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    const getByIdUrl = this.configService.getInvoiceEndpoint('getById', { invoiceId });
    return this.http.get<InvoiceDto_>(getByIdUrl);
  }

  deleteInvoice(invoiceId: number): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    const deleteUrl = this.configService.getInvoiceEndpoint('delete', { invoiceId });
    return this.http.delete(deleteUrl);
  }

  deleteMultipleInvoices(invoiceIds: number[]): Observable<any> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    const deleteMultipleUrl = this.configService.getInvoiceEndpoint('deleteMultiple');
    return this.http.delete(deleteMultipleUrl, { body: invoiceIds });
  }

  getInvoicesByCustomerNIC(nic: string): Observable<InvoiceDto2[]> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    const getByCustomerUrl = this.configService.getInvoiceEndpoint('getByCustomerNIC', { nic });
    return this.http.get<InvoiceDto2[]>(getByCustomerUrl);
  }

  getInvoiceByInvoiceNo(invoiceNo: string): Observable<InvoiceDto[]> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    const getByInvoiceNoUrl = this.configService.getInvoiceEndpoint('getByInvoiceNo', { invoiceNo });
    return this.http.get<InvoiceDto[]>(getByInvoiceNoUrl);
  }

  getLoanInfoByInitialInvoiceNo(invoiceNo: string): Observable<LoanInfoDto> {
    if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
    const getLoanInfoUrl = this.configService.getInvoiceEndpoint('getLoanInfoByInitialInvoiceNo', { invoiceNo });
    return this.http.get<LoanInfoDto>(getLoanInfoUrl);
  }


 // Transactions
 createTransaction(transactionDto: CreateTransactionDto): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  const createUrl = this.configService.getTransactionEndpoint('create');
  return this.http.post(createUrl, transactionDto)
    .pipe(catchError(this.handleError));
}


getTransactions(from: Date, to: Date, page: number = 1, pageSize: number = 10, search?: string, sortBy?: string, sortOrder?: string, customerNIC?: string, transactionType?: number, minAmount?: number, maxAmount?: number): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  // Convert dates to local ISO strings (backend expects local time)
  const fromStr = this.toLocalISOString(from);
  const toStr = this.toLocalISOString(to);

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

  // Use configuration endpoint
  const endpoint = this.configService.apiEndpoints?.transactions?.getAll || '/api/transactions';
  const url = `${this.configService.apiUrl}${endpoint.split('?')[0]}`;
  
  return this.http.get<any>(url, { params })
    .pipe(catchError(this.handleError));
}

getTransactionById(transactionId: number): Observable<TransactionDto> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.apiEndpoints?.transactions?.getById || '/api/transactions/{transactionId}';
  const url = `${this.configService.apiUrl}${endpoint.replace('{transactionId}', transactionId.toString())}`;
  
  return this.http.get<TransactionDto>(url)
    .pipe(catchError(this.handleError));
}
getTransactionsByIds(transactionIds: number[]): Observable<TransactionDto[]> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.apiEndpoints?.transactions?.getByIds || '/api/transactions/byIds';
  const url = `${this.configService.apiUrl}${endpoint}`;
  
  return this.http.post<TransactionDto[]>(url, transactionIds)
    .pipe(catchError(this.handleError));
}

deleteTransaction(transactionId: number): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  const deleteUrl = this.configService.getTransactionEndpoint('delete', { transactionId });
  return this.http.delete(deleteUrl)
    .pipe(catchError(this.handleError));
}

deleteMultipleTransactions(transactionIds: number[]): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  const deleteMultipleUrl = this.configService.getTransactionEndpoint('deleteMultiple');
  return this.http.request('delete', deleteMultipleUrl, { body: transactionIds })
    .pipe(catchError(this.handleError));
}

getTransactionsByCustomerNIC(nic: string): Observable<TransactionDto[]> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.apiEndpoints?.transactions?.getByCustomerNIC || '/api/transactions/customer/{customerNIC}';
  const url = `${this.configService.apiUrl}${endpoint.replace('{customerNIC}', nic)}`;
  
  return this.http.get<TransactionDto[]>(url)
    .pipe(catchError(this.handleError));
}


getInvoiceDetails(invoiceId: number): Observable<{ invoice: InvoiceDto_, transactions: TransactionDto[], customer: TransactionCustomerDTO, items: GetItemDTO[] }> {
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

  return this.http.get<any>(`${this.configService.apiUrl}/api/account/users`, { 
    headers: this.getHttpHeaders(),
    params: params 
  })
  .pipe(catchError(this.handleError.bind(this)));
}

updateUser(userId: string,UserDto:UserDTO){
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.put(`${this.configService.apiUrl}/api/account/user/${userId}`,UserDto, {
    headers: this.getHttpHeaders()
  }).pipe(catchError(this.handleError.bind(this)));
}

deleteUsers(userIds: string[]){
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.delete(`${this.configService.apiUrl}/api/account/users/delete-multiple`,{
    headers: this.getHttpHeaders(),
    body: userIds
  })
  .pipe(catchError(this.handleError.bind(this)));
}

// Services for Karatage, LoanPeriod, and Pricing operations

// Karatage Operations

// Karat Operations

getAllKarats(): Observable<Karat[]> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<Karat[]>(this.configService.getKaratageEndpoint('karats', 'getAll'));
}

getKaratById(karatId: number): Observable<Karat> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<Karat>(this.configService.getKaratageEndpoint('karats', 'getById', { karatId }));
}

createKarat(karatValue: number): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  const karatDto: KaratDTO = { karatValue };
  return this.http.post(this.configService.getKaratageEndpoint('karats', 'create'), karatDto);
}

updateKarat(karatId: number, karat: Karat): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.put(this.configService.getKaratageEndpoint('karats', 'update', { karatId }), karat);
}

deleteKarat(karatId: number): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.delete(this.configService.getKaratageEndpoint('karats', 'delete', { karatId }));
}

// LoanPeriod Operations

getAllLoanPeriods(): Observable<LoanPeriod[]> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<LoanPeriod[]>(this.configService.getKaratageEndpoint('loanPeriods', 'getAll'));
}

getLoanPeriodById(loanPeriodId: number): Observable<LoanPeriod> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<LoanPeriod>(this.configService.getKaratageEndpoint('loanPeriods', 'getById', { loanPeriodId }));
}

createLoanPeriod(periodInMonths: number): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  const loanPeriodDto: LoanPeriodDTO = { period: periodInMonths };
  return this.http.post(this.configService.getKaratageEndpoint('loanPeriods', 'create'), loanPeriodDto);
}

updateLoanPeriod(loanPeriodId: number, loanPeriod: LoanPeriod): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.put(this.configService.getKaratageEndpoint('loanPeriods', 'update', { loanPeriodId }), loanPeriod);
}

deleteLoanPeriod(loanPeriodId: number): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.delete(this.configService.getKaratageEndpoint('loanPeriods', 'delete', { loanPeriodId }));
}

// Pricing Operations

getAllPricings(): Observable<Pricing[]> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<Pricing[]>(this.configService.getKaratageEndpoint('pricings', 'getAll'));
}

getPricingById(pricingId: number): Observable<Pricing> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<Pricing>(this.configService.getKaratageEndpoint('pricings', 'getById', { pricingId }));
}

createPricing(pricing: PricingDTO): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.post(this.configService.getKaratageEndpoint('pricings', 'create'), pricing);
}

createPricingBatch(pricing: PricingBatchDTO[]): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.post(this.configService.getKaratageEndpoint('pricings', 'createBatch'), pricing);
}

updatePricing(pricingId: number, pricing: PricingPutDTO): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.put(this.configService.getKaratageEndpoint('pricings', 'update', { pricingId }), pricing);
}

deletePricing(pricingId: number): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.delete(this.configService.getKaratageEndpoint('pricings', 'delete', { pricingId }));
}

// Custom Operation: Get Pricings by Karat and LoanPeriod
getPricingsByKaratAndLoanPeriod(karatId: number, loanPeriodId: number): Observable<Pricing[]> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get<Pricing[]>(this.configService.getKaratageEndpoint('pricings', 'getByKaratAndLoanPeriod', { karatId, loanPeriodId }));
}

// Excel Operations for Pricing
getPricingExcelTemplate(): Observable<Blob> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  return this.http.get(this.configService.getKaratageEndpoint('pricings', 'getExcelTemplate'), {
    responseType: 'blob'
  });
}

uploadPricingExcel(file: File): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post(this.configService.getKaratageEndpoint('pricings', 'uploadExcel'), formData);
}

// Installments

getAllInstallments(): Observable<any[]> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.apiEndpoints?.installments?.getAll || '/api/installments';
  const url = `${this.configService.apiUrl}${endpoint}`;
  
  return this.http.get<any[]>(url)
    .pipe(catchError(this.handleError));
}

getInstallmentById(installmentId: number): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.apiEndpoints?.installments?.getById || '/api/installments/{installmentId}';
  const url = `${this.configService.apiUrl}${endpoint.replace('{installmentId}', installmentId.toString())}`;
  
  return this.http.get<any>(url)
    .pipe(catchError(this.handleError));
}

getInstallmentsByTransaction(transactionId: number): Observable<any[]> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.apiEndpoints?.installments?.getByTransaction || '/api/installments/transaction/{transactionId}';
  const url = `${this.configService.apiUrl}${endpoint.replace('{transactionId}', transactionId.toString())}`;
  
  return this.http.get<any[]>(url)
    .pipe(catchError(this.handleError));
}

getInstallmentsByInvoiceNumber(invoiceNumber: string): Observable<any[]> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.apiEndpoints?.installments?.getByInvoiceNumber || '/api/installments/invoice/{invoiceNumber}';
  const url = `${this.configService.apiUrl}${endpoint.replace('{invoiceNumber}', invoiceNumber)}`;
  
  return this.http.get<any[]>(url)
    .pipe(catchError(this.handleError));
}

createInstallment(installmentData: any): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.apiEndpoints?.installments?.create || '/api/installments';
  const url = `${this.configService.apiUrl}${endpoint}`;
  
  return this.http.post<any>(url, installmentData)
    .pipe(catchError(this.handleError));
}

updateInstallment(installmentId: number, installmentData: any): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.apiEndpoints?.installments?.update || '/api/installments/{installmentId}';
  const url = `${this.configService.apiUrl}${endpoint.replace('{installmentId}', installmentId.toString())}`;
  
  return this.http.put<any>(url, installmentData)
    .pipe(catchError(this.handleError));
}

deleteInstallment(installmentId: number): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.apiEndpoints?.installments?.delete || '/api/installments/{installmentId}';
  const url = `${this.configService.apiUrl}${endpoint.replace('{installmentId}', installmentId.toString())}`;
  
  return this.http.delete<any>(url)
    .pipe(catchError(this.handleError));
}

deleteMultipleInstallments(installmentIds: number[]): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.apiEndpoints?.installments?.deleteMultiple || '/api/installments/delete-multiple';
  const url = `${this.configService.apiUrl}${endpoint}`;
  
  return this.http.request('delete', url, { body: installmentIds })
    .pipe(catchError(this.handleError));
}


// Reports

getReportByCustomer(customerNIC: any): Observable<ReportByCustomer> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.apiEndpoints?.reports?.getByCustomer || '/api/reports/customer/{customerNIC}';
  const url = `${this.configService.apiUrl}${endpoint.replace('{customerNIC}', customerNIC)}`;
  
  return this.http.get<ReportByCustomer>(url)
    .pipe(catchError(this.handleError));
}

getOverview(): Observable<Overview> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.apiEndpoints?.reports?.getOverview || '/api/reports/overview';
  const url = `${this.configService.apiUrl}${endpoint}`;
  
  return this.http.get<Overview>(url)
    .pipe(catchError(this.handleError));
}

// System Health Monitoring Endpoints

/**
 * Get overall system health status
 */
getSystemHealth(): Observable<SystemHealth> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.healthEndpoints?.system || '/api/health/system';
  return this.http.get<SystemHealth>(`${this.configService.apiUrl}${endpoint}`, {
    headers: this.getHttpHeaders()
  }).pipe(
    timeout(10000),
    catchError((error) => {
      console.error('System health endpoint failed:', error);
      return throwError(() => new Error('Health service unavailable'));
    })
  );
}

/**
 * Get database health and connection status
 */
getDatabaseHealth(): Observable<DatabaseHealth> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.healthEndpoints?.database || '/api/health/database';
  return this.http.get<DatabaseHealth>(`${this.configService.apiUrl}${endpoint}`, {
    headers: this.getHttpHeaders()
  }).pipe(
    timeout(10000),
    catchError((error) => {
      console.error('Database health endpoint failed:', error);
      return throwError(() => new Error('Database health service unavailable'));
    })
  );
}

/**
 * Get API services health status
 */
getServiceHealth(): Observable<ServiceHealth> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.healthEndpoints?.services || '/api/health/services';
  return this.http.get<ServiceHealth>(`${this.configService.apiUrl}${endpoint}`, {
    headers: this.getHttpHeaders()
  }).pipe(
    timeout(10000),
    catchError((error) => {
      console.error('Services health endpoint failed:', error);
      return throwError(() => new Error('Services health service unavailable'));
    })
  );
}

/**
 * Get backup status and schedule information
 */
getBackupStatus(): Observable<BackupStatus> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.healthEndpoints?.backup || '/api/health/backup';
  return this.http.get<BackupStatus>(`${this.configService.apiUrl}${endpoint}`, {
    headers: this.getHttpHeaders()
  }).pipe(
    timeout(10000),
    catchError((error) => {
      console.error('Backup status endpoint failed:', error);
      return throwError(() => new Error('Backup status service unavailable'));
    })
  );
}

/**
 * Get storage usage statistics
 */
getStorageUsage(): Observable<StorageUsage> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.healthEndpoints?.storage || '/api/health/storage';
  return this.http.get<StorageUsage>(`${this.configService.apiUrl}${endpoint}`, {
    headers: this.getHttpHeaders()
  }).pipe(
    timeout(10000),
    catchError((error) => {
      console.error('Storage usage endpoint failed:', error);
      return throwError(() => new Error('Storage usage service unavailable'));
    })
  );
}

/**
 * Get system metrics (CPU, Memory, Network)
 */
getSystemMetrics(): Observable<SystemMetrics> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.healthEndpoints?.metrics || '/api/health/metrics';
  return this.http.get<SystemMetrics>(`${this.configService.apiUrl}${endpoint}`, {
    headers: this.getHttpHeaders()
  }).pipe(
    timeout(10000),
    catchError((error) => {
      console.error('System metrics endpoint failed:', error);
      return throwError(() => new Error('System metrics service unavailable'));
    })
  );
}

/**
 * Get application logs summary
 */
getApplicationLogs(): Observable<ApplicationLogs> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.healthEndpoints?.logs || '/api/health/logs';
  return this.http.get<ApplicationLogs>(`${this.configService.apiUrl}${endpoint}`, {
    headers: this.getHttpHeaders()
  }).pipe(
    timeout(10000),
    catchError((error) => {
      console.error('Application logs endpoint failed:', error);
      return throwError(() => new Error('Application logs service unavailable'));
    })
  );
}

/**
 * Get security status and vulnerability information
 */
getSecurityStatus(): Observable<SecurityStatus> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.healthEndpoints?.security || '/api/health/security';
  return this.http.get<SecurityStatus>(`${this.configService.apiUrl}${endpoint}`, {
    headers: this.getHttpHeaders()
  }).pipe(
    timeout(10000),
    catchError((error) => {
      console.error('Security status endpoint failed:', error);
      return throwError(() => new Error('Security status service unavailable'));
    })
  );
}

/**
 * Get comprehensive system health overview
 */
getSystemHealthOverview(): Observable<SystemHealthOverview> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.healthEndpoints?.overview || '/api/health/overview';
  return this.http.get<SystemHealthOverview>(`${this.configService.apiUrl}${endpoint}`, {
    headers: this.getHttpHeaders()
  }).pipe(
    catchError((error) => {
      console.warn('System health overview endpoint not available:', error);
      return of(null as any);
    })
  );
}

/**
 * Simple health ping endpoint
 */
getHealthPing(): Observable<HealthPing> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  const endpoint = this.configService.healthEndpoints?.ping || '/api/health/ping';
  return this.http.get<HealthPing>(`${this.configService.apiUrl}${endpoint}`, {
    headers: this.getHttpHeaders()
  }).pipe(
    timeout(5000),
    catchError((error) => {
      console.error('Health ping endpoint failed:', error);
      return throwError(() => new Error('Health ping service unavailable'));
    })
  );
}

}


