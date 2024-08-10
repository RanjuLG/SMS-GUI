import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config-service.service'
import { CreateCustomerDto, CustomerDto } from '../Components/customer-form/customer.model';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreateItemDto, ItemDto } from '../Components/item-form/item.model';
import { CreateInvoiceDto, InvoiceDto, InvoiceDto_, UpdateInvoiceDto } from '../Components/invoice-form/invoice.model';
import { CreateTransactionDto, GetCustomerDTO, GetItemDTO, TransactionDto } from '../Components/transaction-history/transaction.model';
import { forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators'; // Make sure these models are created

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private configService: ConfigService) { }
  
  private handleError(error: any): Observable<never> {
    console.error('API call failed:', error);
    return throwError(() => new Error(error.message || 'Server Error'));
  }

//Customers
  createCustomer(customerDto: CreateCustomerDto): Observable<any> {
    return this.http.post(`${this.configService.apiUrl}/api/customers`, customerDto);
  }

  updateCustomer(customerId: number, customerDto: CreateCustomerDto): Observable<any> {
    return this.http.put(`${this.configService.apiUrl}/api/customers/${customerId}/customer`, customerDto);
  }

  getCustomers(from: Date, to: Date): Observable<CustomerDto[]> {
    // Convert dates to ISO strings
    const fromStr = from.toISOString();
    const toStr = to.toISOString();
  
    // Construct the URL with query parameters
    const url = `${this.configService.apiUrl}/api/customers?From=${encodeURIComponent(fromStr)}&To=${encodeURIComponent(toStr)}`;
  
    return this.http.get<CustomerDto[]>(url);
  }
  

  getCustomerById(customerId: number): Observable<CustomerDto> {
    return this.http.get<CustomerDto>(`${this.configService.apiUrl}/api/customers/${customerId}/customer`);
  }

  deleteCustomer(customerId: number): Observable<any> {
    return this.http.delete(`${this.configService.apiUrl}/api/customers/${customerId}/customer`);
  }

  deleteMultipleCustomers(customerIds: number[]): Observable<any>{

    return this.http.delete(`${this.configService.apiUrl}/api/customers/delete-multiple`, { body: customerIds });

  }

  getCustomersByIds(customerIds: number[]): Observable<CustomerDto[]> {
    return this.http.post<CustomerDto[]>(`${this.configService.apiUrl}/api/customers/byIds`, customerIds);
  }

  getCustomerByNIC(customerNIC: string): Observable<CustomerDto> {
    return this.http.post<CustomerDto>(`${this.configService.apiUrl}/api/customers/byNIC`, JSON.stringify(customerNIC), {
      headers: { 'Content-Type': 'application/json' }
    });
}


  


  //Items

  createItem(itemDto: CreateItemDto): Observable<any> {
    return this.http.post(`${this.configService.apiUrl}/api/items`, itemDto);
  }

  updateItem(itemId: number, itemDto: CreateItemDto): Observable<any> {
    return this.http.put(`${this.configService.apiUrl}/api/items/${itemId}/item`, itemDto);
  }

  getItems(from: Date, to: Date): Observable<ItemDto[]> {
    
    const fromStr = from.toISOString();
    const toStr = to.toISOString();

    return this.http.get<ItemDto[]>(`${this.configService.apiUrl}/api/items?From=${encodeURIComponent(fromStr)}&To=${encodeURIComponent(toStr)}`);
  }

  getItemById(itemId: number): Observable<ItemDto> {
    return this.http.get<ItemDto>(`${this.configService.apiUrl}/api/items/${itemId}/item`);
  }

  deleteItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.configService.apiUrl}/api/items/${itemId}/item`);
  }

  deleteMultipleItems(itemIds: number[]): Observable<any>{

    return this.http.delete(`${this.configService.apiUrl}/api/items/delete-multiple`, { body: itemIds });

  }
  getItemsByCustomerNIC(nic: string): Observable<ItemDto[]> {
    return this.http.get<ItemDto[]>(`${this.configService.apiUrl}/api/items/customer/${nic}`);
  }


  //Invoices
  createInvoice(invoiceDto: CreateInvoiceDto): Observable<any> {
    return this.http.post(`${this.configService.apiUrl}/api/invoices`, invoiceDto);
  }

  updateInvoice(invoiceId: number, invoiceDto: CreateInvoiceDto): Observable<any> {
    return this.http.put(`${this.configService.apiUrl}/api/invoices/${invoiceId}`, invoiceDto);
  }

  getInvoices(from: Date, to: Date): Observable<InvoiceDto[]> {

    const fromStr = from.toISOString();
    const toStr = to.toISOString();

    return this.http.get<InvoiceDto[]>(`${this.configService.apiUrl}/api/invoices?From=${encodeURIComponent(fromStr)}&To=${encodeURIComponent(toStr)}`);
  }

  getInvoiceById(invoiceId: number): Observable<InvoiceDto_> {
    return this.http.get<InvoiceDto_>(`${this.configService.apiUrl}/api/invoices/${invoiceId}`);
  }

  deleteInvoice(invoiceId: number): Observable<any> {
    return this.http.delete(`${this.configService.apiUrl}/api/invoices/${invoiceId}`);
  }

  deleteMultipleInvoices(invoiceIds: number[]): Observable<any> {
    return this.http.delete(`${this.configService.apiUrl}/api/invoices/delete-multiple`, { body: invoiceIds });
  }

  getInvoicesByCustomerNIC(nic: string): Observable<InvoiceDto[]> {
    return this.http.get<InvoiceDto[]>(`${this.configService.apiUrl}/api/invoices/customer/${nic}`);
  }

  getInvoiceByInvoiceNo(invoiceNo: string): Observable<InvoiceDto[]> {
    return this.http.get<InvoiceDto[]>(`${this.configService.apiUrl}/api/invoices/invoiceNo/${invoiceNo}`);
  }



 // Transactions
 createTransaction(transactionDto: CreateTransactionDto): Observable<any> {
  return this.http.post(`${this.configService.apiUrl}/api/transactions`, transactionDto)
    .pipe(catchError(this.handleError));
}


getTransactions(): Observable<TransactionDto[]> {
  return this.http.get<TransactionDto[]>(`${this.configService.apiUrl}/api/transactions`)
    .pipe(catchError(this.handleError));
}

getTransactionById(transactionId: number): Observable<TransactionDto> {
  return this.http.get<TransactionDto>(`${this.configService.apiUrl}/api/transactions/${transactionId}`)
    .pipe(catchError(this.handleError));
}
getTransactionsByIds(transactionIds: number[]): Observable<TransactionDto[]> {
  return this.http.post<TransactionDto[]>(`${this.configService.apiUrl}/api/transactions/byIds`, transactionIds)
    .pipe(catchError(this.handleError));
}

deleteTransaction(transactionId: number): Observable<any> {
  return this.http.delete(`${this.configService.apiUrl}/api/transactions/${transactionId}`)
    .pipe(catchError(this.handleError));
}

deleteMultipleTransactions(transactionIds: number[]): Observable<any> {
  return this.http.request('delete', `${this.configService.apiUrl}/api/transactions/delete-multiple`, { body: transactionIds })
    .pipe(catchError(this.handleError));
}

getTransactionsByCustomerNIC(nic: string): Observable<TransactionDto[]> {
  return this.http.get<TransactionDto[]>(`${this.configService.apiUrl}/api/transactions/customer/${nic}`);
}


getInvoiceDetails(invoiceId: number): Observable<{ invoice: InvoiceDto_, transactions: TransactionDto[], customer: GetCustomerDTO, items: GetItemDTO[] }> {
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
  );
}




}


