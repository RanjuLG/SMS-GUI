import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../Services/api-service.service';
import { CreateInvoiceDto, Item } from '../../../invoice-form/invoice.model';
import { CustomerDto } from '../../../customer-form/customer.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  customerFieldsDisabled = true;
  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.invoiceForm = this.fb.group({
      customer: this.fb.group({
        customerNIC: ['', Validators.required],
        customerName: ['', Validators.required],
        customerContactNo: ['', Validators.required],
        customerAddress: ['', Validators.required],
      }),
      items: this.fb.array([this.createItem()]),
      date: [new Date().toISOString(), Validators.required],
      paymentStatus: [true, Validators.required],
      subTotal: [0, Validators.required],
      interest: [0, Validators.required],
      totalAmount: [0, Validators.required]
    });    
  }

  ngOnInit(): void {
    if (this.invoice) {
      this.invoiceForm.patchValue(this.invoice);
      this.isEditMode = true;
    }
    this.subscribeToFormChanges();
  }

  createItem(): FormGroup {
    return this.fb.group({
      itemDescription: ['', Validators.required],
      itemCaratage: [0, Validators.required],
      itemGoldWeight: [0, Validators.required],
      itemValue: [0, Validators.required]
    });
  }

  items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  addItem(): void {
    this.items().push(this.createItem());
  }

  removeItem(index: number): void {
    this.items().removeAt(index);
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
          };
  
          if (this.isEditMode && this.invoice) {
            this.apiService.updateInvoice(this.invoice.invoiceId, invoiceDto).subscribe({
              next: () => {
                Swal.fire('Success', 'Invoice updated successfully', 'success');
                this.activeModal.close();
                this.saveInvoice.emit(invoiceDto);
                this.router.navigate(['/view-invoice-template/this.invoice?.invoiceId', this.invoice?.invoiceId]);
              },
              error: (error) => {
                console.error('Error updating invoice:', error);
                Swal.fire('Error', 'Failed to update invoice', 'error');
              }
            });
          } else {
            console.log("paymentStatussssss: ", this.invoiceForm.value.paymentStatus)
            console.log("invoiceDto: ", invoiceDto.paymentStatus)
            this.apiService.createInvoice(invoiceDto).subscribe({
              
              next: (createdInvoice) => {
                Swal.fire('Success', 'Invoice created successfully', 'success');
                this.activeModal.close();
                this.saveInvoice.emit(invoiceDto);
                this.router.navigate(['/view-invoice-template/createdInvoice.invoiceId', createdInvoice.invoiceId]);
              },
              error: (error) => {
                console.error('Error creating invoice:', error);
                Swal.fire('Error', 'Failed to create invoice', 'error');
              }
            });
          }
        }
      });
    }
  }
  

  previewInvoice(invoice: CreateInvoiceDto): void {
    this.router.navigate(['/view-invoice-template/', invoice.invoiceId]);
  }

  autofillCustomerDetails() {
    const nic = this.invoiceForm.get('customer.customerNIC')?.value;
    console.log("nic: ",nic )
    this.apiService.getCustomerByNIC(nic).subscribe({
      next: (customer: CustomerDto) => {
        this.invoiceForm.patchValue({
          customer: {
            customerNIC: nic, // Ensure this is included if it needs to be kept
            customerName: customer.customerName,
            customerAddress: customer.customerAddress,
            customerContactNo: customer.customerContactNo
          }
        });
      },
      error: (error) => {
        console.error('Error fetching customer details:', error);
        Swal.fire('Error', 'Failed to fetch customer details', 'error');
      }
    });
  }
  
  
  

  onCancel() {
    this.activeModal.dismiss();
  }


  statusss(){

    console.log("paymentStatus: ", this.invoiceForm.value.paymentStatus)

  }


}
