import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateInvoiceComponent } from '../helpers/invoices/create-invoice/create-invoice.component';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ApiService } from '../../Services/api-service.service';
import { InvoiceDto } from './invoice.model';
import { DateService } from '../../Services/date-service.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface ExtendedInvoiceDto extends InvoiceDto {
  selected?: boolean;
}

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [FormsModule, CommonModule, NgxPaginationModule,ReactiveFormsModule],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceFormComponent implements OnInit {
  invoices: ExtendedInvoiceDto[] = [];
  page: number = 1;
  invoicesPerPage: number = 10;
  invoicesPerPageOptions: number[] = [1, 5, 10, 15, 20];
  searchNICControl = new FormControl();
  searchInvoiceNoControl = new FormControl();

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private apiService: ApiService,
    private dateService: DateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInvoices();

    this.searchNICControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((nic: string) => {
        if (!nic) {
          return this.apiService.getInvoices(); // Return all invoices if NIC is empty
        }
        return this.apiService.getInvoicesByCustomerNIC(nic).pipe(
          catchError(() => of([])) // Handle errors and return an empty array
        );
      })
    ).subscribe({
      next: (result: any[]) => { 
        console.log(result)// Use 'any' type here if your API response does not have a consistent type
        this.invoices = result.map(invoice => ({
          ...invoice,
          dateGenerated: this.dateService.formatDateTime(invoice.dateGenerated),
          selected: false,
          customerNIC: invoice.customerNIC,
          invoiceNo: invoice.invoiceNo
        }));
        this.cdr.markForCheck(); // Trigger change detection
      },
      error: (error: any) => {
        console.error('Failed to fetch invoices by NIC', error);
      }
    });

    this.searchInvoiceNoControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((invoiceNo: string) => {
        if (!invoiceNo) {
          return this.apiService.getInvoices(); // Return all invoices if Invoice No is empty
        }
        return this.apiService.getInvoiceByInvoiceNo(invoiceNo).pipe(
          catchError(() => of([])) // Handle errors and return an empty array
        );
      })
    ).subscribe({
      next: (result: any[]) => { // Use 'any' type here if your API response does not have a consistent type
        this.invoices = result.map(invoice => ({
          ...invoice,
          dateGenerated: this.dateService.formatDateTime(invoice.dateGenerated),
          selected: false,
          customerNIC: invoice.customerNIC,
          invoiceNo: invoice.invoiceNo
        }));
        this.cdr.markForCheck(); // Trigger change detection
      },
      error: (error: any) => {
        console.error('Failed to fetch invoices by Invoice No', error);
      }
    });
  }
  
  loadInvoices() {
    this.apiService.getInvoices().subscribe(
      (data: InvoiceDto[]) => {
        this.invoices = data.map(invoice => ({ ...invoice,
          dateGenerated: this.dateService.formatDateTime(invoice.dateGenerated),
          selected: false,
          customerNIC: invoice.customerNIC,
          invoiceNo: invoice.invoiceNo }));
          
        console.log("invoices: ",this.invoices)
        this.cdr.markForCheck(); // Trigger change detection
      },
      (error) => {
        console.error('Error fetching invoices:', error);
      }
    );
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
  
  editInvoice(invoiceId: number) {
    this.apiService.getInvoiceById(invoiceId).subscribe(invoice => {
      const modalRef = this.modalService.open(CreateInvoiceComponent, { size: 'lg' });
      modalRef.componentInstance.invoice = invoice;
      modalRef.result.then((result) => {
        if (result === 'submitted') {
          this.loadInvoices();
        }
      }).catch((error) => {
        console.error('Modal dismissed:', error);
      });
    }, error => {
      console.error('Error fetching invoice:', error);
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

  getStartIndex(): number {
    return (this.page - 1) * this.invoicesPerPage + 1;
  }

  getEndIndex(): number {
    const endIndex = this.page * this.invoicesPerPage;
    return endIndex > this.invoices.length ? this.invoices.length : endIndex;
  }

  viewInvoiceTemplate() {
    this.router.navigate(['/view-invoice-template/37']);
  }
}
