import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../../Services/api-service.service';
import Swal from 'sweetalert2';
import { CreateInvoiceDto } from '../../../invoice-form/invoice.model';
import { CustomerDto } from '../../../customer-form/customer.model';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-create-installment-payment-invoice',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './create-installment-payment-invoice.component.html',
  styleUrls: ['./create-installment-payment-invoice.component.scss']
})
export class CreateInstallmentPaymentInvoiceComponent implements OnInit {
  @Input() invoice: CreateInvoiceDto | null = null;
  @Output() saveInvoice = new EventEmitter<CreateInvoiceDto>();
  invoiceForm: FormGroup;
  isEditMode = false;
  isCustomerAutofilled = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
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
      invoiceTypeId: [2, Validators.required] // Different invoice type ID for installment payments
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

  onSubmit() {
    if (this.invoiceForm.valid) {
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
            this.apiService.createInvoice(invoiceDto).subscribe({
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
