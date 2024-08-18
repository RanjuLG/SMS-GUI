import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Pricing, Karat, LoanPeriod } from './karat-value.model';
import { ApiService } from '../../Services/api-service.service';
import { DateService } from '../../Services/date-service.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { AddPricingComponent } from '../helpers/pricing/add-pricing/add-pricing.component';

export interface ExtendedPricingDto extends Pricing {
  selected?: boolean;
}

@Component({
  selector: 'app-karat-value',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    NgxPaginationModule,
    ReactiveFormsModule,
  ],
  templateUrl: './karat-value.component.html',
  styleUrls: ['./karat-value.component.scss'],
})
export class KaratValueComponent implements OnInit {
  pricings: ExtendedPricingDto[] = [];
  page: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [1, 5, 10, 15, 20];
  searchControl = new FormControl();
  karats: Karat[] = [];
  loanPeriods: LoanPeriod[] = [];
  selectedKaratId: number | null = null;
  selectedLoanPeriodId: number | null = null;

  constructor(
    private modalService: NgbModal,
    private apiService: ApiService,
    private dateService: DateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadKarats();
    this.loadLoanPeriods();
    this.loadPricings();
  }

  loadKarats(): void {
    this.apiService.getAllKarats().subscribe((data) => {
      this.karats = data;
      this.cdr.markForCheck();
    });
  }

  loadLoanPeriods(): void {
    this.apiService.getAllLoanPeriods().subscribe((data) => {
      this.loanPeriods = data;
      this.cdr.markForCheck();
    });
  }

  loadPricings(): void {
    this.apiService.getAllPricings().subscribe((data) => {
      this.pricings = data;
      this.cdr.markForCheck(); // Ensure change detection is triggered
    });
  }

  addPricing(): void {
    const modalRef = this.modalService.open(AddPricingComponent, { size: 'lg' });
    modalRef.componentInstance.savePricing.subscribe(() => {
      this.loadPricings();
      this.cdr.detectChanges(); // Ensure UI is updated after reloading data
      Swal.fire('Added!', 'Pricing has been added successfully.', 'success');
    });
  }

  editPricing(pricing: Pricing): void {
    const modalRef = this.modalService.open(AddPricingComponent, { size: 'lg' });
    modalRef.componentInstance.pricing = pricing;
    modalRef.componentInstance.savePricing.subscribe(() => {
      this.loadPricings();
      this.cdr.detectChanges(); // Ensure UI is updated after reloading data
      Swal.fire('Saved!', 'Pricing has been updated.', 'success');
    });
  }

  deletePricing(pricingId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deletePricing(pricingId).subscribe(() => {
          this.loadPricings(); // Reload pricings after deletion
          Swal.fire('Deleted!', 'Pricing has been deleted.', 'success');
        });
      }
    });
  }

  deleteSelectedPricings(): void {
    const selectedItems = this.pricings.filter((item) => item.selected);
    if (selectedItems.length === 0) {
      Swal.fire('No Selection', 'Please select at least one pricing to delete.', 'info');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedItems.length} pricing(s). This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        selectedItems.forEach((item) => {
          this.apiService.deletePricing(item.pricingId).subscribe(() => {
            this.loadPricings();
            this.cdr.markForCheck(); // Ensure UI is updated after deletion
          });
        });
        Swal.fire('Deleted!', 'Selected pricings have been deleted.', 'success');
      }
    });
  }

  toggleAllSelections(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.pricings.forEach((pricing) => (pricing.selected = checked));
    this.cdr.markForCheck(); // Trigger change detection
  }

  getStartIndex(): number {
    return (this.page - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    return Math.min(this.page * this.itemsPerPage, this.pricings.length);
  }

  openAddPricingModal(): void {
    const modalRef = this.modalService.open(AddPricingComponent, { size: 'lg' });
    modalRef.componentInstance.savePricing.subscribe((pricing: ExtendedPricingDto) => {
      Swal.fire('Added!', 'Pricing has been added.', 'success');
      this.loadPricings();
      this.cdr.markForCheck();
    });
  }
}
