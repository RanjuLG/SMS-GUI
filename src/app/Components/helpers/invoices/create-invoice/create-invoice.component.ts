import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../Services/api-service.service';
import { CreateInvoiceDto, Item } from '../../../invoice-form/invoice.model';
import { CustomerDto } from '../../../customer-form/customer.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoanPeriod } from '../../../pricing/karat-value.model';

@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss']
})
export class CreateInvoiceComponent implements OnInit {
  @Input() invoice: CreateInvoiceDto | null = null;
  @Output() saveInvoice = new EventEmitter<CreateInvoiceDto>();
  invoiceForm: FormGroup;
  isEditMode = false;
  manualTotalAmountEdit = false;
  customerItems: Item[] = [];
  isCustomerAutofilled = false; // Array to store items for the selected customer
  loanPeriods: LoanPeriod[] = [];  // Available loan periods
  karats: any[] = []; // Array to store karat values

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.invoiceForm = this.fb.group({
      customer: this.fb.group({
        customerNIC: ['', Validators.required],
        customerName: ['', Validators.required],
        customerContactNo: ['', Validators.required],
        customerAddress: ['', Validators.required],
      }),
      items: this.fb.array([this.createItem()]),
      date: [new Date().toISOString().substring(0, 10), Validators.required], // Set the default date to today
      loanPeriod: [null, Validators.required], // Updated to hold loanPeriodId
      paymentStatus: [true, Validators.required],
      subTotal: [0, Validators.required],
      interest: [0, Validators.required],
      totalAmount: [0, Validators.required],
      invoiceTypeId: [1, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.invoice) {
      this.invoiceForm.patchValue(this.invoice);
      this.isEditMode = true;
    }
    this.subscribeToFormChanges();

    // Load loan periods from API
    this.loadKaratValues(); // Load karat values
    this.loadLoanPeriods(); // Load loan periods

    this.invoiceForm.get('customer.customerNIC')?.valueChanges.subscribe(() => {
      if (this.isCustomerAutofilled) {
        this.resetCustomerFields();
      }
    });
  }
  loadKaratValues(): void {
    this.apiService.getAllKarats().subscribe({
      next: (karats) => {
        this.karats = karats;
      },
      error: (error) => {
        console.error('Error fetching karat values:', error);
        Swal.fire('Error', 'Failed to fetch karat values', 'error');
      }
    });
  }

  loadLoanPeriods(): void {
    this.apiService.getAllLoanPeriods().subscribe({
      next: (loanPeriods) => {
        this.loanPeriods = loanPeriods;
      },
      error: (error) => {
        console.error('Error fetching loan periods:', error);
        Swal.fire('Error', 'Failed to fetch loan periods', 'error');
      }
    });
  }

  // Other existing methods

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
            loanPeriodId: this.invoiceForm.value.loanPeriod, // Attach the selected loanPeriodId
            items: this.invoiceForm.value.items.map((item: Item) => ({
              ...item,
              itemId: item.itemId || 0 // Set itemId to 0 if it's null
            }))
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
                this.router.navigate(['/view-invoice-template', createdInvoiceId]);
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


  createItem(): FormGroup {
    return this.fb.group({
      itemId: [null], // Include itemId field
      itemDescription: ['', Validators.required],
      itemCaratage: [0, Validators.required],
      itemGoldWeight: [0, Validators.required],
      itemValue: [0, Validators.required]
    });
  }

  items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }



  removeItem(index: number): void {
    if (this.items().length > 1) {
      this.items().removeAt(index);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Remove Item',
        text: 'There should be at least one item in the invoice.',
        confirmButtonText: 'OK'
      });
    }
  }
  

  onItemSelected(event: Event, index: number): void {
    const selectedItemId = (event.target as HTMLSelectElement).value;
    if (selectedItemId) {
      const selectedItem = this.customerItems.find(item => item.itemId === +selectedItemId);
      if (selectedItem) {
        const itemFormGroup = this.items().at(index);
        itemFormGroup.patchValue({
          itemId: selectedItem.itemId,
          itemDescription: selectedItem.itemDescription,
          itemCaratage: selectedItem.itemCaratage,
          itemGoldWeight: selectedItem.itemGoldWeight,
          itemValue: selectedItem.itemValue
        });
  
        // Disable form controls for existing items
        itemFormGroup.get('itemDescription')?.disable();
        itemFormGroup.get('itemCaratage')?.disable();
        itemFormGroup.get('itemGoldWeight')?.disable();
        itemFormGroup.get('itemValue')?.disable();
      }
    } else {
      const itemFormGroup = this.items().at(index);
      itemFormGroup.reset();
      // Enable form controls for new items
      itemFormGroup.get('itemDescription')?.enable();
      itemFormGroup.get('itemCaratage')?.enable();
      itemFormGroup.get('itemGoldWeight')?.enable();
      itemFormGroup.get('itemValue')?.enable();
    }
  }
  
  addItem(): void {
    const newItem = this.createItem();
    this.items().push(newItem);
    // Enable form controls for new items
    newItem.get('itemDescription')?.enable();
    newItem.get('itemCaratage')?.enable();
    newItem.get('itemGoldWeight')?.enable();
    newItem.get('itemValue')?.enable();
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

          this.apiService.getItemsByCustomerNIC(nic).subscribe({
            next: (items: Item[]) => {
              this.customerItems = items;
            },
            error: (error) => {
              console.error('Error fetching customer items:', error);
              Swal.fire('Error', 'Failed to fetch items for this customer', 'error');
            }
          });
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
    this.customerItems = [];
    this.items().clear();
    this.addItem();
  }

  subscribeToFormChanges(): void {
    this.items().valueChanges.subscribe(() => {
      this.calculateSubTotal();
    });
  }

  calculateSubTotal(): void {
    const subTotal = this.items().controls.reduce((total, item) => {
      return total + item.get('itemValue')?.value;
    }, 0);
    this.invoiceForm.get('subTotal')?.setValue(subTotal);
    this.onSubTotalOrInterestChange();
  }

  onSubTotalOrInterestChange() {
    if (!this.manualTotalAmountEdit) {
      const subTotal = this.invoiceForm.get('subTotal')?.value;
      const interest = this.invoiceForm.get('interest')?.value;
      const totalAmount = subTotal + (subTotal * interest / 100);
      this.invoiceForm.patchValue({ totalAmount });
    }
  }

  onTotalAmountChange() {
    this.manualTotalAmountEdit = true;
  }

  

  statusss() {
    console.log("paymentStatus: ", this.invoiceForm.value.paymentStatus);
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
