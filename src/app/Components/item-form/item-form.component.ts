import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddItemComponent } from '../helpers/items/add-item/add-item.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { ItemDto } from './item.model';
import { ApiService } from '../../Services/api-service.service';
import { DateService } from '../../Services/date-service.service';
import { ChangeDetectionStrategy } from '@angular/core';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatHint } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ExtendedItemDto extends ItemDto {
  amountPerCaratage?: number;
  selected?: boolean;
  customerNIC: string;
}

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule, 
    NgxPaginationModule, 
    ReactiveFormsModule,
    MatDatepickerModule,
    MatHint,
    MatFormFieldModule,
    MatInputModule

  ],
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ItemFormComponent implements OnInit {
  items: ExtendedItemDto[] = [];
  page: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [1, 5, 10, 15, 20];
  searchControl = new FormControl();
  private readonly _currentDate = new Date();
  readonly maxDate = new Date(this._currentDate);
  from = new Date(this._currentDate);
  to = new Date(this._currentDate)

  constructor(
    private modalService: NgbModal,
    private apiService: ApiService,
    private dateService: DateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.from.setDate(this.from.getDate() - 30);
    this.to.setDate(this.to.getDate() + 1);
    this.loadItems();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((nic: string) => {
        if (!nic) {
          return this.apiService.getItems(this.from,this.to); // Return all items if NIC is empty
        }
        console.log(nic)
        return this.apiService.getItemsByCustomerNIC(nic).pipe(
          catchError(() => of([])) // Handle errors and return an empty array
        );
      })
    ).subscribe({
      next: (result: any[]) => { // Use 'any' type here if your API response does not have a consistent type
        this.items = result.map(item => ({
          ...item,
          createdAt: this.dateService.formatDateTime(item.createdAt),
          selected: false,
          customerNIC: item.customerNIC // Ensure this property is available in the response
        }));
        this.cdr.markForCheck(); // Trigger change detection
      },
      error: (error: any) => {
        console.error('Failed to fetch items', error);
      }
    });
  }
  
  loadItems(): void {
    console.log("$",this.from)
    console.log("$$",this.to)
    this.apiService.getItems(this.from,this.to).subscribe({
      next: (items: any[]) => { // Use 'any' type here if your API response does not have a consistent type
        this.items = items.map(item => ({
          ...item,
          createdAt: this.dateService.formatDateTime(item.createdAt),
          selected: false,
          customerNIC: item.customerNIC // Ensure this property is available in the response
        })) as ExtendedItemDto[]; // Type assertion to ExtendedItemDto[]
  
        this.cdr.markForCheck(); // Trigger change detection
        console.log(this.items);
      },
      error: (error: any) => {
        console.error('Failed to load items', error);
      }
    });
  }
  


  openAddItemModal(): void {
    const modalRef = this.modalService.open(AddItemComponent, { size: 'lg' });
    modalRef.componentInstance.saveItem.subscribe((item: ExtendedItemDto) => {
      this.addItem(item);
      Swal.fire('Added!', 'Item has been added.', 'success');
    });
  }

  addItem(item: ExtendedItemDto): void {
    this.items.push(item);
    this.cdr.markForCheck(); // Trigger change detection
    Swal.fire('Added!', 'Item has been added.', 'success');
  }

  editItem(item: ExtendedItemDto): void {
    Swal.fire({
      title: 'Edit Item',
      text: `Are you sure you want to edit item '${item.itemId}'?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      confirmButtonText: 'Yes, edit it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const modalRef = this.modalService.open(AddItemComponent, { size: 'lg' });
        modalRef.componentInstance.item = { ...item };
        modalRef.componentInstance.saveItem.subscribe((updatedItem: ExtendedItemDto) => {
          this.loadItems();
          Swal.fire('Updated!', 'Item has been updated.', 'success');
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Item editing cancelled.', 'info');
      }
    });
  }
  

  removeItem(item: ExtendedItemDto): void {
    Swal.fire({
      title: 'Delete Item',
      text: `Are you sure you want to delete this item '${item.itemDescription}'?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteItem(item.itemId).subscribe({
          next: () => {
            this.loadItems();
            Swal.fire('Deleted!', 'Item has been deleted.', 'success');
          },
          error: (error) => {
            console.error('Error deleting item:', error);
            Swal.fire('Error', 'Failed to delete item. Please try again.', 'error');
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Item deletion cancelled.', 'info');
      }
    });
  }

  toggleAllSelections(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.items.forEach(item => item.selected = checked);
    this.cdr.markForCheck(); // Trigger change detection
  }

  deleteSelectedItems(): void {
    const selectedItems = this.items.filter(item => item.selected).map(item => item.itemId);
    if (selectedItems.length === 0) {
      Swal.fire('No items selected', 'Please select at least one item to delete.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Delete Selected Items',
      text: `Are you sure you want to delete the selected ${selectedItems.length} items?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete them',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteMultipleItems(selectedItems).subscribe({
          next: () => {
            this.loadItems();
            Swal.fire('Deleted!', 'Selected items have been deleted.', 'success');
          },
          error: (error) => {
            console.error('Error deleting selected items:', error);
            Swal.fire('Error', 'Failed to delete selected items. Please try again.', 'error');
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Selected item deletion cancelled.', 'info');
      }
    });
  }

  getStartIndex(): number {
    return (this.page - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    const endIndex = this.page * this.itemsPerPage;
    return endIndex > this.items.length ? this.items.length : endIndex;
  }

  onStartDateChange(event: any): void{
    this.from = new Date(event.value)
    console.log("this.from: ", this.from);


  }
  onDateRangeChange(event: any): void {
   
    if (event && event.value) 
    {
      const {end } = event.value;
      
        this.to = new Date(event.value);
        this.to.setDate(this.to.getDate() + 1);
        
        console.log("this.to: ", this.to);
        this.loadItems();
  
    } 
    else {
      console.error('Event or event value is null');
    }
    this.cdr.markForCheck();
  }

  
  
  
}
