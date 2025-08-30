import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Pricing, Karat, LoanPeriod, PricingBatchDTO } from './karat-value.model';
import { ApiService } from '../../Services/api-service.service';
import { DateService } from '../../Services/date-service.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { AddPricingComponent } from '../helpers/pricing/add-pricing/add-pricing.component';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { RouterLink } from '@angular/router';

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
    RouterLink
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
    // Subscribe to search changes to filter pricings by karat value
    this.searchControl.valueChanges.subscribe((searchTerm: string) => {
      this.filterPricingsByKarat(searchTerm);
  });
  }
  filterPricingsByKarat(searchTerm: string): void {
    if (!searchTerm) {
        // If no search term, load all pricings
        this.loadPricings();
        return;
    }

    const searchValue = parseInt(searchTerm, 10);

    // Filter pricings based on karat value
    this.apiService.getAllPricings().subscribe((data) => {
        this.pricings = data.filter((pricing: any) => pricing.karat?.karatValue === searchValue);
        this.cdr.markForCheck();
    });
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

   triggerFileInput(): void {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        fileInput.click();
    }

    handleFileInput(event: any): void {
      const file = event.target.files[0];
      if (file) {
          Swal.fire({
              title: 'Confirm Upload',
              text: `You are about to upload ${file.name}. Are you sure?`,
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, upload!'
          }).then((result) => {
              if (result.isConfirmed) {
                  this.readExcelFile(file); // Proceed with reading the file
              }
          });
      }
  }
  

    readExcelFile(file: File): void {
      console.log("file: ", file)
        const reader = new FileReader();
        reader.onload = (e: any) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const pricingBatch: PricingBatchDTO[] = [];

            // Assuming the first row contains headers, skip it and parse the rows
            (jsonData.slice(1) as any[][]).forEach((row: any[]) => {
                const pricingDTO: PricingBatchDTO = {
                    price: parseFloat(row[0]),   // Assuming price is in the first column
                    karatValue: parseInt(row[1]), // Assuming karat value is in the second column
                    period: parseInt(row[2])     // Assuming loan period is in the third column
                };
                pricingBatch.push(pricingDTO);
            });

            // Call the backend API to send the batch data
            this.uploadPricingBatch(pricingBatch);
        };
        reader.readAsArrayBuffer(file);
    }

    uploadPricingBatch(pricingBatch: PricingBatchDTO[]): void {
      this.apiService.createPricingBatch(pricingBatch).subscribe({
          next: (response) => {
              Swal.fire('Success!', 'Pricings have been uploaded successfully.', 'success');
              this.loadPricings();  // Reload pricings after upload
              this.cdr.markForCheck();
          },
          error: (error) => {
              Swal.fire('Error!', 'Failed to upload some pricings. Please check the errors.', 'error');
              console.error(error);
              this.loadPricings();  // Reload pricings after upload
              this.cdr.markForCheck();
          }
      });
  }
  downloadExcelTemplate(): void {
    // Define the template data
    const templateData = [
      ['Price', 'Karat Value', 'Loan Period (months)'],  // Header row
      [1000, 22, 12],  // Example row
      [1500, 24, 6],   // Example row
    ];

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    // Create a blob from the workbook
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    // Use FileSaver to save the file
    FileSaver.saveAs(blob, 'Pricing_Template.xlsx');
  }

}
