import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../Services/api-service.service';
import { CreateInvoiceDto, InvoiceDto, Item } from '../../../invoice-form/invoice.model';
import { CustomerDto } from '../../../customer-form/customer.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-create-settlement-invoice',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './create-settlement-invoice.component.html',
  styleUrl: './create-settlement-invoice.component.scss'
})
export class CreateSettlementInvoiceComponent implements OnInit {
  @Input() invoice: CreateInvoiceDto | null = null;
  @Output() saveInvoice = new EventEmitter<CreateInvoiceDto>();
  invoiceForm: FormGroup;
  isEditMode = false;
  isCustomerAutofilled = false;
  initialInvoiceNumber = '0';
  //installmentNumber = 0;
  initialInvoices: InvoiceDto[] = []; // Add this line
  selectedInvoice: InvoiceDto | null = null; // Add this line
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.invoiceForm = this.fb.group({
      customer: this.fb.group({
        customerNIC: ['', Validators.required],
        customerName: [{ value: '', disabled: true }, Validators.required],
        customerContactNo: [{ value: '', disabled: true }, Validators.required],
        customerAddress: [{ value: '', disabled: true }, Validators.required],
      }),
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      paymentStatus: [true, Validators.required],
      subTotal: [0, Validators.required],
      interest: [0, Validators.required],
      totalAmount: [0, Validators.required],
      invoiceTypeId: [3, Validators.required], // Different invoice type ID for SETTLEMENT payments
      installmentNumber: [0,Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.invoice) {
      this.invoiceForm.patchValue(this.invoice);
      this.isEditMode = true;
    }

    this.invoiceForm.get('customer.customerNIC')?.valueChanges.subscribe(() => {
      if (this.isCustomerAutofilled) {
        this.resetCustomerFields();
      }
    });
  }
// New method to fetch invoices by NIC
fetchInvoicesByNIC(nic: string): void {
  this.apiService.getInvoicesByCustomerNIC(nic).subscribe({
    next: (invoices: InvoiceDto[]) => {
      // Filter the invoices where invoiceTypeId equals 2
      this.initialInvoices = invoices.filter(invoice => invoice.invoiceTypeId === 1);
      
      // Optionally check if no valid invoices are found and show a warning
      if (this.initialInvoices.length === 0) {
        Swal.fire('Warning', 'No valid installment payment invoices found for this customer', 'warning');
      }
    },
    error: (error) => {
      console.error('Error fetching invoices:', error);
      Swal.fire('Error', 'Failed to fetch invoices for this customer', 'error');
    }
  });
}


// New method to handle selection of an initial invoice
onInitialInvoiceSelected(event: Event): void {
  const selectedInvoiceId = (event.target as HTMLSelectElement).value;
  this.selectedInvoice = this.initialInvoices.find(invoice => invoice.invoiceId === +selectedInvoiceId) || null;
  console.log("this.selectedInvoice",this.selectedInvoice)
  if(this.selectedInvoice?.invoiceNo != null)
    {
      if (this.selectedInvoice && this.selectedInvoice.invoiceTypeId !== 1) 
        {
        this.showInvalidInvoiceWarning();
      }
      else
      {

        this.initialInvoiceNumber = this.selectedInvoice.invoiceNo;

        const loanPeriod = this.selectedInvoice.loanPeriod;
        console.log("this.selectedInvoice",this.selectedInvoice)
        if (loanPeriod > 0) {
          const installmentAmount = this.selectedInvoice.totalAmount / loanPeriod;
          this.invoiceForm.patchValue({ totalAmount: installmentAmount });
        } else {
          Swal.fire('Warning', 'Invalid loan period for this invoice', 'warning');
        }

      }

    
  }
}
  autofillCustomerDetails(): void {
    const nic = this.invoiceForm.get('customer.customerNIC')?.value;
    if (nic) {
      this.apiService.getCustomerByNIC(nic).subscribe({
        next: (customer: CustomerDto) => {
          this.invoiceForm.patchValue({
            customer: {
              customerNIC: nic,
              customerName: customer.customerName,
              customerAddress: customer.customerAddress,
              customerContactNo: customer.customerContactNo
            }
          });

          this.isCustomerAutofilled = true;
          this.invoiceForm.get('customer.customerName')?.disable();
          this.invoiceForm.get('customer.customerContactNo')?.disable();
          this.invoiceForm.get('customer.customerAddress')?.disable();
        },
        error: (error) => {
          this.isCustomerAutofilled = false;
          this.resetCustomerFields();
          console.error('Error fetching customer details:', error);
          Swal.fire('Error', 'Customer does not exist', 'error');
        }
      });
          // Fetch invoices after customer details are autofilled
          this.fetchInvoicesByNIC(nic); // Add this line
    }
  }

  resetCustomerFields(): void {
    this.isCustomerAutofilled = false;
    this.invoiceForm.get('customer.customerName')?.enable();
    this.invoiceForm.get('customer.customerContactNo')?.enable();
    this.invoiceForm.get('customer.customerAddress')?.enable();
    this.invoiceForm.get('customer')?.reset();
  }

  onSubTotalOrInterestChange() {
    const subTotal = this.invoiceForm.get('subTotal')?.value;
    const interest = this.invoiceForm.get('interest')?.value;
    const totalAmount = subTotal + (subTotal * interest / 100);
    this.invoiceForm.patchValue({ totalAmount });
  }

  showInvalidInvoiceWarning() {
    Swal.fire({
      icon: 'warning',
      title: 'Invalid Invoice',
      text: 'Please select a valid initial invoice.',
      confirmButtonText: 'Ok',
      confirmButtonColor: '#d33'
    }).then(() => {
      // Clear the selected invoice if invalid
      this.selectedInvoice = null;
    });
  }

  onSubmit() {
    if (this.invoiceForm.valid) {
      const installmentNumber = this.invoiceForm.get('installmentNumber')?.value;
      Swal.fire({
        title: 'Confirm Invoice Submission',
        text: 'Are you sure you want to submit this invoice?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, submit',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          const invoiceDto: CreateInvoiceDto = {
            ...this.invoiceForm.value,
            initialInvoiceNumber: this.initialInvoiceNumber,
            items: [] // No items for installment payments
          };

          if (this.isEditMode && this.invoice) {
            this.apiService.updateInvoice(this.invoice.invoiceId, invoiceDto).subscribe({
              next: () => {
                Swal.fire('Success', 'Invoice updated successfully', 'success');
                this.saveInvoice.emit(invoiceDto);
                this.router.navigate(['/view-invoice-template', this.invoice?.invoiceId]);
              },
              error: (error) => {
                console.error('Error updating invoice:', error);
                Swal.fire('Error', 'Failed to update invoice', 'error');
              }
            });
          } else {
                    if(installmentNumber == 0){

                      Swal.fire('Error', 'Please enter a valid installment number', 'error');

                    }
                    else{

                      this.apiService.createInvoice(invoiceDto,this.initialInvoiceNumber,installmentNumber).subscribe({
                        next: (createdInvoiceId) => {
                          Swal.fire('Success', 'Invoice created successfully', 'success');
                          this.saveInvoice.emit(invoiceDto);
                          this.router.navigate(['/view-installment-invoice-template', createdInvoiceId]);
                        },
                        error: (error) => {
                          console.error('Error creating invoice:', error);
                          Swal.fire('Error', 'Failed to create invoice', 'error');
                        }
                      });

                    }
            
          }
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Create Invoice',
        text: 'Please fill out all the fields.',
        confirmButtonText: 'OK'
      });
    }
  }

  onCancel() {
    Swal.fire({
      title: 'Cancel Changes',
      text: 'Are you sure you want to cancel these changes?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          'Cancelled',
          'Changes have been cancelled.',
          'info'
        );
        this.router.navigate(['/invoices']);
      }
    });
  }
}


