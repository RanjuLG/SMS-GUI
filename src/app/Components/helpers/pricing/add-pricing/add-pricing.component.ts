import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';  
import { Pricing, Karat, LoanPeriod } from '../../../pricing/karat-value.model';
import { ApiService } from '../../../../Services/api-service.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-add-pricing',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
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
  
    if (this.pricing) {
      this.loadDropdownData(() => {
        if (this.pricing) {
          this.pricingForm.patchValue(this.pricing);
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
        console.log('API Response:', result); // Debug log
        
        // API returns direct arrays as per documentation
        this.karats = (result.karats || []).filter((k: any) => k && k.karatId);
        this.loanPeriods = (result.loanPeriods || []).filter((p: any) => p && p.loanPeriodId);

        console.log('Filtered Karats:', this.karats); // Debug log
        console.log('Filtered Loan Periods:', this.loanPeriods); // Debug log

        this.cdr.detectChanges();

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
            // Update existing pricing - only price can be updated
            this.apiService.updatePricing(this.pricing.pricingId, { price: pricingData.price }).subscribe({
              next: (response) => {
                this.savePricing.emit(response);
                this.activeModal.close();
              },
              error: () => Swal.fire('Error', 'Failed to save changes. Please try again.', 'error')
            });
          } else {
            // Create new pricing using PricingDTO
            const newPricing = {
              price: pricingData.price,
              karatId: pricingData.karatId,
              loanPeriodId: pricingData.loanPeriodId
            };
            this.apiService.createPricing(newPricing).subscribe({
              next: (response) => {
                this.savePricing.emit(response);
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

  addNewKarat() {
    Swal.fire({
      title: 'Add New Karat Value',
      input: 'number',
      inputLabel: 'Karat Value',
      inputPlaceholder: 'Enter karat value (e.g., 18, 22, 24)',
      showCancelButton: true,
      confirmButtonText: 'Add',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter a karat value!';
        }
        const numValue = parseInt(value);
        if (numValue <= 0 || numValue > 24) {
          return 'Please enter a valid karat value between 1 and 24!';
        }
        // Check if karat already exists
        if (this.karats.some(k => k.karatValue === numValue)) {
          return 'This karat value already exists!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.createKarat(parseInt(result.value)).subscribe({
          next: (response) => {
            this.karats.push(response);
            this.pricingForm.patchValue({ karatId: response.karatId });
            this.cdr.detectChanges();
            Swal.fire('Success!', 'New karat value added successfully.', 'success');
          },
          error: (error) => {
            console.error('Error creating karat:', error);
            Swal.fire('Error', 'Failed to add new karat value. Please try again.', 'error');
          }
        });
      }
    });
  }

  addNewLoanPeriod() {
    Swal.fire({
      title: 'Add New Loan Period',
      input: 'number',
      inputLabel: 'Loan Period (Months)',
      inputPlaceholder: 'Enter loan period in months (e.g., 6, 12, 24)',
      showCancelButton: true,
      confirmButtonText: 'Add',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter a loan period!';
        }
        const numValue = parseInt(value);
        if (numValue <= 0 || numValue > 120) {
          return 'Please enter a valid loan period between 1 and 120 months!';
        }
        // Check if loan period already exists - comparing the period numbers directly
        if (this.loanPeriods.some(p => p.period === numValue)) {
          return 'This loan period already exists!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.createLoanPeriod(parseInt(result.value)).subscribe({
          next: (response) => {
            this.loanPeriods.push(response);
            this.pricingForm.patchValue({ loanPeriodId: response.loanPeriodId });
            this.cdr.detectChanges();
            Swal.fire('Success!', 'New loan period added successfully.', 'success');
          },
          error: (error) => {
            console.error('Error creating loan period:', error);
            Swal.fire('Error', 'Failed to add new loan period. Please try again.', 'error');
          }
        });
      }
    });
  }
}
