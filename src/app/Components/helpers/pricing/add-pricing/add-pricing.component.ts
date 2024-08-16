import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Pricing, Karat, LoanPeriod } from '../../../pricing/karat-value.model';
import { ApiService } from '../../../../Services/api-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-pricing',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-pricing.component.html',
  styleUrls: ['./add-pricing.component.scss']
})
export class AddPricingComponent implements OnInit {
  @Input() pricing: Pricing | null = null;
  @Input() karats: Karat[] = [];
  @Input() loanPeriods: LoanPeriod[] = [];
  @Output() savePricing = new EventEmitter<Pricing>();
  
  pricingForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.pricingForm = this.fb.group({
      price: ['', Validators.required],
      karatId: ['', Validators.required],
      loanPeriodId: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.pricing) {
      this.pricingForm.patchValue(this.pricing);
    }
  }

  onSubmit() {
    if (this.pricingForm.valid) {
      Swal.fire({
        title: 'Save Changes',
        text: 'Are you sure you want to save these changes?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, save',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          const pricingData: Pricing = this.pricingForm.value;
          if (this.pricing) {
            // Edit existing pricing
            this.apiService.updatePricing(this.pricing.pricingId, pricingData).subscribe({
              next: (response) => {
                this.savePricing.emit(response);
                this.activeModal.close();
                Swal.fire('Saved!', 'Changes have been saved.', 'success');
              },
              error: (error) => {
                console.error('Error updating pricing:', error);
                Swal.fire('Error', 'Failed to save changes. Please try again.', 'error');
              }
            });
          } else {
            // Create new pricing
            this.apiService.createPricing(pricingData).subscribe({
              next: (response) => {
                this.savePricing.emit(response);
                this.cdr.detectChanges();
                this.activeModal.close();
                Swal.fire('Saved!', 'Changes have been saved.', 'success');
              },
              error: (error) => {
                console.error('Error creating pricing:', error);
                Swal.fire('Error', 'Failed to save changes. Please try again.', 'error');
              }
            });
          }
        }
      });
    } else {
      console.log('Form is invalid. Cannot submit.');
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
