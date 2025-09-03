import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateInvoiceComponent } from '../helpers/invoices/create-invoice/create-invoice.component';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../Services/api-service.service';
import { InvoiceDto } from './invoice.model';
import { DateService } from '../../Services/date-service.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {RouterLink} from '@angular/router';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ModernDateRangePickerComponent } from '../helpers/modern-date-range-picker/modern-date-range-picker.component';

export interface ExtendedInvoiceDto extends Omit<InvoiceDto, 'loanPeriod'> {
  selected?: boolean;
  invoiceType?: string;
  loanPeriod?: string | number;
}

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule, 
    DataTableComponent,
    ReactiveFormsModule,
    RouterLink,
    PageHeaderComponent,
    ModernDateRangePickerComponent
  ],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceFormComponent implements OnInit, OnChanges {
  invoices: ExtendedInvoiceDto[] = [];
  tableColumns = [
    { key: 'invoiceNo', label: 'Invoice No.' },
    { key: 'invoiceType', label: 'Invoice Type' },
    { key: 'customerNIC', label: 'Customer NIC' },
    { key: 'loanPeriod', label: 'Loan Period (months)' },
    { key: 'dateGenerated', label: 'Date' }
  ];

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalRecords = 0;
  isLoading = false;

  // Search and filter properties
  searchQuery = '';
  private readonly _currentDate = new Date();
  readonly maxDate = new Date(this._currentDate);
  from = new Date(this._currentDate);
  to = new Date(this._currentDate);
  dateRangeSelected = false;

  get maxDateString(): string {
    return this.maxDate.toISOString().split('T')[0];
  }

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private apiService: ApiService,
    private dateService: DateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Set default date range to last 30 days
    this.from.setDate(this.from.getDate() - 30);
    this.to.setDate(this.to.getDate() + 1);
    this.loadInvoices();
  }

  ngOnChanges(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const searchParams = {
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchQuery || undefined,
      from: this.from,
      to: this.to,
      sortBy: 'dateGenerated',
      sortOrder: 'desc'
    };

    this.apiService.getInvoicesPaginated(searchParams).subscribe({
      next: (response: any) => {
        console.log('Invoice pagination response:', response);
        
        if (response && response.data) {
          this.invoices = response.data.map((invoice: any) => ({
            ...invoice,
            dateGenerated: this.dateService.formatDateTime(invoice.dateGenerated),
            selected: false,
            customerNIC: invoice.customerNIC,
            invoiceNo: invoice.invoiceNo,
            invoiceType: this.getInvoiceType(invoice.invoiceTypeId),
            loanPeriod: invoice.loanPeriod ? invoice.loanPeriod : 'N/A'
          }));

          // Update pagination metadata
          this.currentPage = response.currentPage || 1;
          this.totalPages = response.totalPages || 1;
          this.totalRecords = response.totalRecords || 0;
          this.pageSize = response.pageSize || 10;
        } else {
          this.invoices = [];
          this.totalPages = 1;
          this.totalRecords = 0;
        }

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error fetching invoices:', error);
        this.isLoading = false;
        this.invoices = [];
        this.totalPages = 1;
        this.totalRecords = 0;
        this.cdr.markForCheck();
      }
    });
  }

  onSearch(searchQuery: string): void {
    this.searchQuery = searchQuery;
    this.currentPage = 1; // Reset to first page
    this.loadInvoices();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadInvoices();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1; // Reset to first page when changing page size
    this.loadInvoices();
  }

  get currentPageValue(): number {
    return this.currentPage;
  }
  openCreateInvoiceModal() {
    const modalRef = this.modalService.open(CreateInvoiceComponent, { size: 'lg' });
    modalRef.result.then((result) => {
      if (result === 'submitted') {
        this.loadInvoices();
      }
    }).catch((error) => {
      console.log('Create invoice modal dismissed:', error);
    });
  }

  openCreateInvoiceWindow() {
    // Construct the URL to the CreateInvoiceComponent route
    const url = `${window.location.origin}/create-invoice`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  
  editInvoice(invoiceId: number): void {
    Swal.fire({
      title: 'Edit Invoice',
      text: `Are you sure you want to edit this invoice?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      confirmButtonText: 'Yes, edit it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.getInvoiceById(invoiceId).subscribe(invoice => {
          const modalRef = this.modalService.open(CreateInvoiceComponent, { size: 'lg' });
          modalRef.componentInstance.invoice = invoice;
          modalRef.result.then((result) => {
            if (result === 'submitted') {
              this.loadInvoices();
              Swal.fire('Updated!', 'Invoice has been updated.', 'success');
            }
          }).catch((error) => {
            console.error('Modal dismissed:', error);
          });
        }, error => {
          console.error('Error fetching invoice:', error);
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Invoice editing cancelled.', 'info');
      }
    });
  }

  deleteInvoice(invoiceId: number) {
    console.log("invo id: ",invoiceId )
    Swal.fire({
      title: 'Delete Invoice',
      text: 'Are you sure you want to delete this invoice?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteInvoice(invoiceId).subscribe(
          () => {
            this.loadInvoices();
            Swal.fire('Deleted!', 'Invoice has been deleted.', 'success');
          },
          (error) => {
            console.error('Error deleting invoice:', error);
            Swal.fire('Error', 'There was an error deleting the invoice.', 'error');
          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Invoice deletion cancelled.', 'info');
      }
    });
  }

  toggleAllSelections(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.invoices.forEach(invoice => invoice.selected = checked);
  }

  deleteSelectedInvoices() {
    const selectedInvoices = this.invoices.filter(invoice => invoice.selected);
    if (selectedInvoices.length === 0) {
      Swal.fire('No invoices selected', 'Please select at least one invoice to delete.', 'warning');
      return;
    }
    const invoiceIds = selectedInvoices.map(invoice => invoice.invoiceId);
    Swal.fire({
      title: 'Delete Selected invoices',
      text: `Are you sure you want to delete the selected ${selectedInvoices.length} invoices?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete them',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteMultipleInvoices(invoiceIds).subscribe(
          () => {
            this.loadInvoices();
            Swal.fire('Deleted!', 'Selected invoices have been deleted.', 'success');
          },
          (error: any) => {
            console.error('Error deleting invoices:', error);
            Swal.fire('Error', 'There was an error deleting the invoices.', 'error');
          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Selected invoice deletion cancelled.', 'info');
      }
    });
  }

  onTableAction(event: { action: string, item: any }) {
    switch(event.action) {
      case 'view':
        this.viewInvoice(event.item.invoiceId, event.item.invoiceTypeId);
        break;
      case 'edit':
        this.editInvoice(event.item.invoiceId);
        break;
      case 'delete':
        this.deleteInvoice(event.item.invoiceId);
        break;
    }
  }

  viewInvoiceTemplate() {
    this.router.navigate(['/view-invoice-template/37']);
  }

  viewInvoice(invoiceId: number,invoiceTypeId:number) {
    if(invoiceTypeId == 1){
      this.router.navigate([`/view-invoice-template/${invoiceId}`]);
    }
    else if(invoiceTypeId==2){
      this.router.navigate([`/view-installment-invoice-template/${invoiceId}`]);
    }
    else if(invoiceTypeId==3){
      this.router.navigate([`/view-settlement-invoice-template/${invoiceId}`]);
    }
  }
  onStartDateChange(dateString: string): void {
    if (dateString) {
      // Parse date string as local date (YYYY-MM-DD format)
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-based
        const day = parseInt(parts[2]);
        this.from = new Date(year, month, day, 0, 0, 0);
      } else {
        const fromDate = new Date(dateString);
        this.from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0);
      }
      
      console.log("this.from (Local): ", this.from);
      this.currentPage = 1; // Reset to first page
      this.loadInvoices();
    } else {
      console.error('Start date is null or empty');
    }
    this.cdr.markForCheck();
  }
  
  onDateRangeChange(dateString: string): void {
    if (dateString) {
      // Parse date string as local date (YYYY-MM-DD format)
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-based
        const day = parseInt(parts[2]);
        this.to = new Date(year, month, day + 1, 0, 0, 0); // +1 day for end date
      } else {
        const toDate = new Date(dateString);
        this.to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate() + 1, 0, 0, 0);
      }
      
      console.log("this.to (Local): ", this.to);
      this.currentPage = 1; // Reset to first page
      this.loadInvoices();
    } else {
      console.error('End date is null or empty');
    }
    this.cdr.markForCheck();
  }

  onDateRangeSelected(dateRange: { start: string | null; end: string | null }): void {
    console.log('Date range selected:', dateRange);
    
    if (dateRange.start) {
      // Parse start date as local date
      const parts = dateRange.start.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-based
        const day = parseInt(parts[2]);
        this.from = new Date(year, month, day, 0, 0, 0);
      } else {
        const fromDate = new Date(dateRange.start);
        this.from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0);
      }
    }
    
    if (dateRange.end) {
      // Parse end date as local date
      const parts = dateRange.end.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-based
        const day = parseInt(parts[2]);
        this.to = new Date(year, month, day + 1, 0, 0, 0); // +1 day for end date
      } else {
        const toDate = new Date(dateRange.end);
        this.to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate() + 1, 0, 0, 0);
      }
    }
    
    if (dateRange.start || dateRange.end) {
      this.dateRangeSelected = true;
      this.currentPage = 1; // Reset to first page
      this.loadInvoices();
    } else {
      this.dateRangeSelected = false;
    }
    
    this.cdr.markForCheck();
  }

  clearDateFilter(): void {
    this.from = new Date(this._currentDate);
    this.to = new Date(this._currentDate);
    this.from.setDate(this.from.getDate() - 30);
    this.to.setDate(this.to.getDate() + 1);
    this.dateRangeSelected = false;
    this.currentPage = 1; // Reset to first page
    this.loadInvoices();
    this.cdr.markForCheck();
  }
  
  getInvoiceType(invoiceTypeId: number): string {
    switch (invoiceTypeId) {
      case 1: return 'Initial Pawn Invoice';
      case 2: return 'Installment Payment Invoice';
      case 3: return 'Settlement Invoice';
      default: return 'N/A';
    }
  }
}
