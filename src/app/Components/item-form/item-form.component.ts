import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddItemComponent } from '../helpers/items/add-item/add-item.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { ItemDto } from './item.model';
import { ApiService } from '../../Services/api-service.service';
import { DateService } from '../../Services/date-service.service';
import { ChangeDetectionStrategy } from '@angular/core';
import { CustomerDto } from '../customer-form/customer.model';

export interface ExtendedItemDto extends ItemDto {
  amountPerCaratage?: number;
  selected?: boolean;
  customerNIC: string;
}

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [FormsModule, CommonModule, NgxPaginationModule],
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemFormComponent implements OnInit {
  items: ExtendedItemDto[] = [];
  page: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [1, 5, 10, 15, 20];

  constructor(
    private modalService: NgbModal,
    private apiService: ApiService,
    private dateService: DateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadItems();
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
    const modalRef = this.modalService.open(AddItemComponent, { size: 'lg' });
    modalRef.componentInstance.item = { ...item };
    modalRef.componentInstance.saveItem.subscribe((updatedItem: ExtendedItemDto) => {
      this.loadItems();
      Swal.fire('Updated!', 'Item has been updated.', 'success');
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

  loadItems(): void {
    
    this.apiService.getItems().subscribe({
      next: (items: ItemDto[]) => {
        this.items = items.map(item => ({
          ...item,
          createdAt: this.dateService.formatDateTime(item.createdAt),
          selected: false
        })) as ExtendedItemDto[]; // Type assertion to ExtendedItemDto[]
  
            this.cdr.markForCheck(); // Trigger change detection
         
        console.log(this.items)
      },
      error: (error: any) => {
        console.error('Failed to load items', error);
      }
    });
  }
  
}
