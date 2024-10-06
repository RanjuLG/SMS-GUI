import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { CreateCustomerDto } from '../../../customer-form/customer.model';
import { ApiService } from '../../../../Services/api-service.service';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [ReactiveFormsModule], // Remove imports from decorator as they are not supported
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.scss']
})
export class AddCustomerComponent {
  @Input() customer: CreateCustomerDto | null = null;
  @Output() saveCustomer = new EventEmitter<CreateCustomerDto>();
  customerForm: FormGroup;
  nicPhotoFile: File | null = null;  // To store the uploaded NIC file

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.customerForm = this.fb.group({
      customerNIC: ['', Validators.required],
      customerName: ['', Validators.required],
      customerAddress: ['', Validators.required],
      customerContactNo: ['', Validators.required],
      status: [1, Validators.required],
      // Additional Form Controls for file upload if needed
    });
  }

  ngOnInit() {
    if (this.customer) {
      this.customerForm.patchValue(this.customer);
    }
  }

  // Handle file change for NIC photo upload
  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.nicPhotoFile = event.target.files[0];  // Store the selected file
    }
  }

  onSubmit() {
    if (this.customerForm.valid) {
      const customerDto: CreateCustomerDto = this.customerForm.value;

      // Create FormData object to send along with file
      const formData = new FormData();
      formData.append('customerNIC', customerDto.customerNIC);
      formData.append('customerName', customerDto.customerName);
      formData.append('customerAddress', customerDto.customerAddress);
      formData.append('customerContactNo', customerDto.customerContactNo);

      if (this.nicPhotoFile) {
        formData.append('nicPhoto', this.nicPhotoFile);  // Append NIC photo file
      }

      // Show confirmation and process the form data
      Swal.fire({
        title: 'Save Changes',
        text: 'Are you sure you want to save these changes?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, save',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.customer) {
            // Edit existing customer
            this.apiService.updateCustomer(this.customer.customerId, customerDto,this.nicPhotoFile).subscribe({
              next: (response) => {
                this.saveCustomer.emit(response);
                this.activeModal.close();
                Swal.fire('Saved!', 'Changes have been saved.', 'success');
              },
              error: (error) => {
                console.error('Error updating customer:', error);
                Swal.fire('Error', 'Failed to save changes. Please try again.', 'error');
              }
            });
          } else {
            // Create new customer
            this.apiService.createCustomer(customerDto, this.nicPhotoFile).subscribe({
              next: (response) => {
                this.saveCustomer.emit(response);
                this.activeModal.close();
                Swal.fire('Saved!', 'Customer has been added.', 'success');
              },
              error: (error) => {
                console.error('Error creating customer:', error);
                Swal.fire('Error', 'Failed to save changes. Please try again.', 'error');
              }
            });
          }
        }
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
        this.activeModal.dismiss();
        Swal.fire('Cancelled', 'Changes have been cancelled.', 'info');
      }
    });
  }
}
