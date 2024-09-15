import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../../Services/api-service.service';
import Swal from 'sweetalert2';
import { CreateInvoiceDto, InvoiceDto, LoanInfoDto } from '../../../invoice-form/invoice.model';
import { CustomerDto } from '../../../customer-form/customer.model';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-installment-payment-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-installment-payment-invoice.component.html',
  styleUrls: ['./create-installment-payment-invoice.component.scss']
})
export class CreateInstallmentPaymentInvoiceComponent implements OnInit {
  @Input() invoice: CreateInvoiceDto | null = null;
  @Output() saveInvoice = new EventEmitter<CreateInvoiceDto>();
  invoiceForm: FormGroup;
  isEditMode = false;
  isCustomerAutofilled = false;
  initialInvoiceNumber = '0';
  initialInvoices: InvoiceDto[] = [];
  selectedInvoice: InvoiceDto | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
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
      invoiceTypeId: [2, Validators.required], // Different invoice type ID for installment payments
      installmentNumber: [{ value: 0, disabled: true }, Validators.required]
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

  fetchInvoicesByNIC(nic: string): void {
    this.apiService.getInvoicesByCustomerNIC(nic).subscribe({
      next: (invoices: InvoiceDto[]) => {
        this.initialInvoices = invoices.filter(invoice => invoice.invoiceTypeId === 1);
        if (this.initialInvoices.length === 0) {
          Swal.fire('Warning', 'No valid installment payment invoices found for this customer', 'warning');
        }
      },
      error: (error) => {
        console.error('Error fetching invoices:', error);
        Swal.fire('Error', 'Failed to fetch invoices for this customer', 'error');
        this.clearInvoiceFields();

        
      }
    });
  }

  onInitialInvoiceSelected(event: Event): void {
    const selectedInvoiceId = (event.target as HTMLSelectElement).value;
    this.selectedInvoice = this.initialInvoices.find(invoice => invoice.invoiceId === +selectedInvoiceId) || null;
    console.log("this.selectedInvoice", this.selectedInvoice);

    if (this.selectedInvoice?.invoiceNo != null) {
      if (this.selectedInvoice.invoiceTypeId !== 1) {
        this.showInvalidInvoiceWarning();
      } else {
        this.initialInvoiceNumber = this.selectedInvoice.invoiceNo;
        console.log("this.initialInvoiceNumber", this.initialInvoiceNumber);

        // Call API to get loan info based on the selected invoice number
        this.apiService.getLoanInfoByInitialInvoiceNo(this.selectedInvoice.invoiceNo).subscribe({
          next: (loanInfo: LoanInfoDto) => {
            console.log("API Response: loanInfo", loanInfo);
            if (loanInfo) {
              console.log("Loan Info:", loanInfo);

              if (loanInfo.isLoanSettled) {
                Swal.fire('Warning', 'The loan is already settled. Please select a valid invoice', 'warning');
                this.clearInvoiceFields();
                return;
              }

              if (loanInfo.loanPeriod > 0) {
                const installmentAmount = loanInfo.totalAmount / loanInfo.loanPeriod;
                const installmentNo = loanInfo.numberOfInstallmentsPaid + 1;
                this.invoiceForm.patchValue({ totalAmount: installmentAmount, installmentNumber: installmentNo });
              } else {
                Swal.fire('Warning', 'Invalid loan period for this invoice', 'warning');
                this.clearInvoiceFields();
              }
            } else {
              Swal.fire('Error', 'No loan information found for this invoice', 'error');
              this.clearInvoiceFields();
            }
          },
          error: (error) => {
            console.error('Error fetching loan info:', error);
            Swal.fire('Error', 'Failed to fetch loan information', 'error');
            this.clearInvoiceFields();
          }
        });
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

          // Fetch invoices after customer details are autofilled
          this.fetchInvoicesByNIC(nic);
        },
        error: (error) => {
          this.isCustomerAutofilled = false;
          this.resetCustomerFields();
          this.clearInvoiceFields();
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

  clearInvoiceFields(): void {
    this.selectedInvoice = null;
    this.initialInvoiceNumber = '';
    this.invoiceForm.patchValue({
      totalAmount: 0,
      installmentNumber: 0,
      initialInvoiceNumber: ''
    });
  
    // Reset dropdown value
    const dropdown = document.getElementById('initialInvoiceNumber') as HTMLSelectElement;
    if (dropdown) {
      dropdown.value = ''; // Set the dropdown to its default option
    }
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
      this.clearInvoiceFields();
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
            if (installmentNumber == 0) {
              Swal.fire('Error', 'Please enter a valid installment number', 'error');
            } else {
              this.apiService.createInvoice(invoiceDto, this.initialInvoiceNumber, installmentNumber).subscribe({
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
