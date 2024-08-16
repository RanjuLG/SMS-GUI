import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Pricing, Karat, LoanPeriod } from './karat-value.model';
import { ApiService } from '../../Services/api-service.service';
import { DateService } from '../../Services/date-service.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { AddPricingComponent } from '../helpers/pricing/add-pricing/add-pricing.component';
import Swal from 'sweetalert2';

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
  styleUrl: './karat-value.component.scss'
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
    private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadKarats();
    this.loadLoanPeriods();
    this.loadPricings();
  }

  loadKarats(): void {
    this.apiService.getAllKarats().subscribe((data) => {
      this.karats = data;
    });
  }

  loadLoanPeriods(): void {
    this.apiService.getAllLoanPeriods().subscribe((data) => {
      this.loanPeriods = data;
    });
  }
  loadPricings(): void {
   
      this.apiService.getAllPricings().subscribe((data) => {
        this.pricings = data;
      });
    
  }

  /*
  loadPricings(): void {
    if (this.selectedKaratId && this.selectedLoanPeriodId) {
      this.apiService.getPricingsByKaratAndLoanPeriod(this.selectedKaratId, this.selectedLoanPeriodId).subscribe((data) => {
        this.pricings = data;
      });
    }
  }
    */

  addPricing(): void {
    const newPricing: Pricing = {
      pricingId: 0, // or generate a new ID if needed
      price: 0, // default price value
      karatId: this.selectedKaratId ?? 0,
      loanPeriodId: this.selectedLoanPeriodId ?? 0,
    };

    this.apiService.createPricing(newPricing).subscribe(() => {
      this.loadPricings();
    });
  }

  editPricing(pricing: Pricing): void {
    this.apiService.updatePricing(pricing.pricingId, pricing).subscribe(() => {
      this.loadPricings();
    });
  }

  deletePricing(pricingId: number): void {
    this.apiService.deletePricing(pricingId).subscribe(() => {
      this.loadPricings();
    });
  }

  deleteSelectedPricings(): void {
    const selectedItems = this.pricings.filter(item => item.selected);
    selectedItems.forEach(item => {
      this.deletePricing(item.pricingId);
    });
  }

  toggleAllSelections(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.pricings.forEach(pricing => pricing.selected = checked);
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
    modalRef.componentInstance.saveCustomer.subscribe((customer: ExtendedPricingDto) => {
      this.loadPricings(); // Reload customers after adding a new customer
      this.cdr.markForCheck(); // Trigger change detection
      Swal.fire('Added!', 'Customer has been added.', 'success');
    });
  }
}
