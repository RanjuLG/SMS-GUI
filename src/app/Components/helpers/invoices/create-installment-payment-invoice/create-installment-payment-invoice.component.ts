import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../../Services/api-service.service';
import Swal from 'sweetalert2';
import { CreateInvoiceDto, InvoiceDto, InvoiceDto2, LoanInfoDto } from '../../../invoice-form/invoice.model';
import { CustomerDto } from '../../../customer-form/customer.model';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { sum } from 'mathjs';
import { DateService } from '../../../../Services/date-service.service';

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
  initialInvoices: InvoiceDto2[] = [];
  selectedInvoice: InvoiceDto2 | null = null;
  lastInstallmentDate = new Date();
  baseInterest = 0;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private dateService: DateService,
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
      interestAmount: [0, Validators.required],
      totalAmount: [0, Validators.required],
      invoiceTypeId: [2, Validators.required], // Different invoice type ID for installment payments
      installmentNumber: [{ value: 0, disabled: true }]
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
    this.invoiceForm.get('date')?.valueChanges.subscribe(() => this.calculateInterest());
    this.invoiceForm.get('subTotal')?.valueChanges.subscribe(() => this.updateTotalAmount());
    this.invoiceForm.get('interestAmount')?.valueChanges.subscribe(() => this.updateTotalAmount());
    
  }

  fetchInvoicesByNIC(nic: string): void {
    this.apiService.getInvoicesByCustomerNIC(nic).subscribe({
      next: (invoices: InvoiceDto2[]) => {
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

        // Call API to get loan info based on the selected invoice number
        this.apiService.getLoanInfoByInitialInvoiceNo(this.selectedInvoice.invoiceNo).subscribe({
          next: (loanInfo: LoanInfoDto) => {
            if (loanInfo) {
              if (loanInfo.isLoanSettled) {
                Swal.fire('Warning', 'The loan is already settled. Please select a valid invoice', 'warning');
                this.clearInvoiceFields();
                return;
              }

              if (loanInfo.loanPeriod > 0) {
                console.log("this.loanInfo: ", loanInfo)
                // Convert the date string to a Date object, but adjust for local time
                // Assuming loanInfo.lastInstallmentDate is a string like "2024-04-01T00:00:00"
                
                const lastInstallmentDateString = loanInfo.lastInstallmentDate; // Assume this is the ISO 8601 string from backend
                const lastInstallmentDate = new Date(lastInstallmentDateString); // Automatically parses the timezone correctly
                
                if (!isNaN(lastInstallmentDate.getTime())) {
                    this.lastInstallmentDate = lastInstallmentDate;
                    console.log('Last Installment Date:', this.lastInstallmentDate); // Should print with the correct local time
                } else {
                    console.error('Invalid Date:', lastInstallmentDateString);
                }
            
                
                this.baseInterest = loanInfo.dailyInterest;
                console.log("Base Interest (Daily Interest):", this.baseInterest);
                
                const principleAmount = Math.round(Number(loanInfo.principleAmount) / Number(loanInfo.loanPeriod));
                console.log("Principle Amount (Per Period):", principleAmount);
                
                const accumulatedInterest = this.calculateInterest();
                console.log("Accumulated Interest:", accumulatedInterest);
                
                const totalAmount = sum((principleAmount), Number(accumulatedInterest));
                console.log("Total Amount:", totalAmount);
                
                this.invoiceForm.patchValue({ subTotal: principleAmount});
                this.invoiceForm.patchValue({ interestAmount: accumulatedInterest});
                this.invoiceForm.patchValue({ totalAmount: totalAmount});
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
  updateTotalAmount(): void {
    const subTotal = this.invoiceForm.get('subTotal')?.value || 0;
    const interestAmount = this.invoiceForm.get('interestAmount')?.value || 0;
    const totalAmount = subTotal + interestAmount;
    
    // Update the totalAmount field in the form
    this.invoiceForm.patchValue({ totalAmount });
  }

  onSubTotalOrInterestChange() {
    const subTotal = this.invoiceForm.get('subTotal')?.value;
    const interestAmount = this.invoiceForm.get('interestAmount')?.value;
    const totalAmount = subTotal + interestAmount;
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
            if (installmentNumber < 0) {
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

  calculateInterest(): number {
    const newDate = this.invoiceForm.get('date')?.value;
    console.log("Selected Date:", newDate);
  
    // Logic to recalculate interest based on the new date.
    const recalculatedInterest = this.calculateInterestBasedOnDate(newDate);
    console.log("Recalculated Interest:", recalculatedInterest);
  
    // Update the interestAmount in the form
    this.invoiceForm.patchValue({ interestAmount: recalculatedInterest });
    return recalculatedInterest;
  }
  
  calculateInterestBasedOnDate(date: string): number {
    const daysElapsed = this.getDaysDifferenceFromLastInstallmentDate(date);
    console.log("Days Elapsed since Last Installment:", daysElapsed);
  
    const baseInterestRate = this.baseInterest; // Example base interest rate
    console.log("Base Interest Rate:", baseInterestRate);
  
    const calculatedInterest = daysElapsed * baseInterestRate; // Simple interest calculation based on elapsed days
    console.log("Calculated Interest:", calculatedInterest);
  
    return Math.round(calculatedInterest); // Return rounded interest
  }
  
  getDaysDifferenceFromLastInstallmentDate(date: string): number {
    const selectedDate = new Date(date);
    console.log("Selected Date for Days Calculation:", selectedDate);
  
    const lastDay = this.lastInstallmentDate;
    console.log("Last Installment Date:", lastDay);
  
    const timeDifference = Math.abs(lastDay.getTime() - selectedDate.getTime());
    const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    console.log("Difference in Days:", dayDifference);
  
    return dayDifference;
  }
  

}
