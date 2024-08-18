import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';  // Added for ngFor directive support
import { Pricing, Karat, LoanPeriod } from '../../../pricing/karat-value.model';
import { ApiService } from '../../../../Services/api-service.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-add-pricing',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],  // Added CommonModule for ngFor
  templateUrl: './add-pricing.component.html',
  styleUrls: ['./add-pricing.component.scss']
})
export class AddPricingComponent implements OnInit {
  @Input() pricing: Pricing | null = null;
  @Input() karats: Karat[] = [];
  @Input() loanPeriods: LoanPeriod[] = [];
  @Output() savePricing = new EventEmitter<Pricing>();
  pricingForm!: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initForm();
  
    // Load dropdown data and disable controls if editing
    if (this.pricing) {
      this.loadDropdownData(() => {
        // Ensure that this.pricing is not null before patching values
        if (this.pricing) {
          this.pricingForm.patchValue(this.pricing);
          // Disable the dropdowns if editing
          this.pricingForm.controls['karatId'].disable();
          this.pricingForm.controls['loanPeriodId'].disable();
        }
      });
    } else {
      this.loadDropdownData();
    }
  }
  

  initForm() {
    this.pricingForm = this.fb.group({
      price: ['', Validators.required],
      karatId: ['', Validators.required],
      loanPeriodId: ['', Validators.required]
    });
  }

  loadDropdownData(callback?: () => void) {
    forkJoin({
      karats: this.apiService.getAllKarats(),
      loanPeriods: this.apiService.getAllLoanPeriods()
    }).subscribe({
      next: (result) => {
        this.karats = result.karats;
        this.loanPeriods = result.loanPeriods;

        // Trigger change detection to ensure UI is updated
        this.cdr.detectChanges();

        // Execute the callback if provided (used for patching values after loading dropdown data)
        if (callback) callback();
      },
      error: (error) => {
        console.error("Error loading dropdown data: ", error);
        Swal.fire('Error', 'Failed to load dropdown data. Please try again.', 'error');
      }
    });
  }

  onSubmit() {
    if (this.pricingForm.valid) {
      Swal.fire({
        title: this.pricing ? 'Save Changes' : 'Add Pricing',
        text: 'Are you sure you want to proceed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, save',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          const pricingData = this.pricingForm.getRawValue();
          if (this.pricing) {
            this.apiService.updatePricing(this.pricing.pricingId, { price: pricingData.price }).subscribe({
              next: (response) => {
                this.savePricing.emit(response); // Emit event after updating
                this.activeModal.close();
              },
              error: () => Swal.fire('Error', 'Failed to save changes. Please try again.', 'error')
            });
          } else {
            this.apiService.createPricing(pricingData).subscribe({
              next: (response) => {
                this.savePricing.emit(response); // Emit event after adding
                this.activeModal.close();
              },
              error: () => Swal.fire('Error', 'Failed to add pricing. Please try again.', 'error')
            });
          }
        }
      });
    }
  }

  onCancel() {
    Swal.fire({
      title: 'Cancel Changes',
      text: 'Are you sure you want to cancel?',
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
