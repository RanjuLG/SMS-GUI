import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../Services/api-service.service';
import { CreateInvoiceDto, Item } from '../../../invoice-form/invoice.model';
import { CustomerDto } from '../../../customer-form/customer.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoanPeriod, Karat } from '../../../pricing/karat-value.model';

@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
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
  isCustomerAutofilled = false; // Flag to check if customer details are autofilled
  loanPeriods: LoanPeriod[] = [];  // Available loan periods
  karats: Karat[] = []; // Array to store karat values

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
      interestRate: [0, Validators.required],
      interestAmount: [0, Validators.required],
      totalAmount: [0, Validators.required],
      invoiceTypeId: [1, Validators.required]
    });
  }

  ngOnInit(): void {
    const newItem = this.createItem();
    //this.items().push(newItem);
    if (this.invoice) {
      this.invoiceForm.patchValue(this.invoice);
      this.isEditMode = true;
    }
    this.subscribeToFormChanges();
  
    // Load karat values and loan periods from API
    this.loadKaratValues(); 
    this.loadLoanPeriods();
  
    // Reset customer fields if NIC changes
    this.invoiceForm.get('customer.customerNIC')?.valueChanges.subscribe(() => {
      if (this.isCustomerAutofilled) {
        this.resetCustomerFields();
      }
    });
  
    // Subscribe to changes in gold weight, loan period, and karat
    this.invoiceForm.get('loanPeriod')?.valueChanges.subscribe(() => {
      this.items().controls.forEach((item, index) => {
        this.loadPricingForNewItem(index);
      });
    });
  
    this.items().controls.forEach((item, index) => {
      item.get('itemGoldWeight')?.valueChanges.subscribe(() => {
        this.loadPricingForNewItem(index);
      });
  
      item.get('itemCaratage')?.valueChanges.subscribe(() => {
        this.loadPricingForNewItem(index);
      });
    });

    this.subscribeToItemChanges(newItem);
  }
  

  loadKaratValues(): void {
    this.apiService.getAllKarats().subscribe({
      next: (karats) => {
        this.karats = karats;
        console.log(" this.karats: ", this.karats)
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

  createItem(): FormGroup {
    return this.fb.group({
      itemId: [null], // Include itemId field
      itemDescription: ['', Validators.required],
      itemRemarks: [''],
      itemCaratage: [0, Validators.required],
      itemWeight: [0, Validators.required],
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
          itemRemarks: selectedItem.itemRemarks,
          itemCaratage: selectedItem.itemCaratage,
          itemWeight:selectedItem.itemWeight,
          itemGoldWeight: selectedItem.itemGoldWeight,
          itemValue: selectedItem.itemValue
        });

        // Disable form controls for existing items
        itemFormGroup.get('itemDescription')?.disable();
        itemFormGroup.get('itemRemarks')?.disable();
        itemFormGroup.get('itemCaratage')?.disable();
        itemFormGroup.get('itemWeight')?.disable();
        itemFormGroup.get('itemGoldWeight')?.disable();
        itemFormGroup.get('itemValue')?.disable();
      }
    } else {
      const itemFormGroup = this.items().at(index);
      itemFormGroup.reset();
      // Enable form controls for new items
      itemFormGroup.get('itemDescription')?.enable();
      itemFormGroup.get('itemRemarks')?.enable();
      itemFormGroup.get('itemCaratage')?.enable();
      itemFormGroup.get('itemWeight')?.enable();
      itemFormGroup.get('itemGoldWeight')?.enable();
      itemFormGroup.get('itemValue')?.enable();


    // Load pricing based on karat and loan period
    this.loadPricingForNewItem(index);
    }
  }

  addItem(): void {
    const newItem = this.createItem();
    this.items().push(newItem);
    // Subscribe to changes in the newly added item's fields
  this.subscribeToItemChanges(newItem);
    // Enable form controls for new items
    newItem.get('itemDescription')?.enable();
    newItem.get('itemRemarks')?.enable();
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

  isExistingItem(index: number): boolean {
    const itemId = this.items().at(index).get('itemId')?.value;
    return !!itemId;
  }

  subscribeToFormChanges(): void {
    this.items().valueChanges.subscribe(() => {
      this.calculateSubTotal();
    });
  }

  calculateSubTotal(): void {
    const subTotal = this.items().controls.reduce((total, item) => {
      return total + (item.get('itemValue')?.value || 0);
    }, 0);
    this.invoiceForm.get('subTotal')?.setValue(subTotal);
    this.onSubTotalOrInterestChange();
  }
  
  onSubTotalOrInterestChange() {
    if (!this.manualTotalAmountEdit) {
      const subTotal = this.invoiceForm.get('subTotal')?.value;
      const interestRate = this.invoiceForm.get('interestRate')?.value;
      if (subTotal && interestRate) {
        const interestAmount = (subTotal * interestRate) / 100;
        this.invoiceForm.patchValue({ interestAmount });

        if (interestAmount) {
          const totalAmount = subTotal + interestAmount;
          this.invoiceForm.patchValue({ totalAmount });
        }
      }
    }
  }

  onTotalAmountChange() {
    this.manualTotalAmountEdit = true;
  }

  onSubmit() {
    if (this.invoiceForm.valid) {
      console.log("interestAmount: ",this.invoiceForm.value.interestAmount),
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
            loanPeriodId: this.invoiceForm.value.loanPeriod,
            interestAmount: this.invoiceForm.value.interestAmount,
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
            this.apiService.createInvoice(invoiceDto, '0', 0).subscribe({
              next: (createdInvoiceId) => {
                Swal.fire('Success', 'Invoice created successfully', 'success');
                this.saveInvoice.emit(invoiceDto);
                console.log("createdInvoiceId: ",createdInvoiceId.value)
                this.router.navigate([`/view-invoice-template/${createdInvoiceId.value}`]);
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


  loadPricingForNewItem(index: number): void {
    const itemFormGroup = this.items().at(index);
    const karatValue = itemFormGroup.get('itemCaratage')?.value;
    const loanPeriodId = this.invoiceForm.value.loanPeriod;
    const goldWeight = itemFormGroup.get('itemGoldWeight')?.value;

    if (!karatValue || !loanPeriodId || !goldWeight) {
      console.warn("Missing or invalid values:", { karatValue, goldWeight, loanPeriodId });
        return; // Exit if any of the values are missing
    }

    const numericKaratValue = Number(karatValue);
    const selectedKarat = this.karats.find(k => k.karatValue === numericKaratValue);
    const karatId = selectedKarat ? selectedKarat.karatId : null;

    if (karatId && loanPeriodId && goldWeight) {
        this.apiService.getPricingsByKaratAndLoanPeriod(karatId, loanPeriodId).subscribe({
            next: (pricings) => {
                if (pricings && pricings.length > 0) {
                    const pricing = pricings[0];
                    const itemValue = (pricing.price / 8) * goldWeight; // Example calculation
                    itemFormGroup.patchValue({ itemValue });
                    this.calculateSubTotal();
                }
            },
            error: (error) => {
                console.error('Error loading pricing:', error);
                Swal.fire('Error', 'Failed to load pricing for this item', 'error');
            }
        });
    }
}

private subscribeToItemChanges(item: FormGroup): void {
  item.get('itemGoldWeight')?.valueChanges.subscribe(() => {
      this.loadPricingForNewItem(this.items().controls.indexOf(item));
  });

  item.get('itemCaratage')?.valueChanges.subscribe(() => {
      this.loadPricingForNewItem(this.items().controls.indexOf(item));
  });
}

onCalculateItemValue(index: number): void {
  this.loadPricingForNewItem(index);
}




}

