import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { CreateItemDto } from '../../../item-form/item.model';
import { ApiService } from '../../../../Services/api-service.service';

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {
  @Input() item: CreateItemDto | null = null;
  @Output() saveItem = new EventEmitter<CreateItemDto>();
  itemForm: FormGroup;

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder, private apiService: ApiService) {
    this.itemForm = this.fb.group({
      itemDescription: ['', Validators.required],
      itemRemarks: [''],
      itemCaratage: ['', Validators.required],
      itemWeight:  ['', Validators.required],
      itemGoldWeight: ['', Validators.required],
      itemValue: [{ value: ''}, Validators.required],
      customerNIC: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.item) {
      // Patch the form with item data
      this.itemForm.patchValue(this.item);

      // Ensure itemValue is calculated correctly if the form is in edit mode
      this.calculateItemValue();
      
      // Update itemValue on changes to amountPerCaratage and itemCaratage
      this.itemForm.get('amountPerCaratage')!.valueChanges.subscribe(() => this.calculateItemValue());
      this.itemForm.get('itemCaratage')!.valueChanges.subscribe(() => this.calculateItemValue());
    } else {
      // Reset itemValue to empty on Add mode
      this.itemForm.get('itemValue')!.setValue('');
    }
  }

  calculateItemValue() {
    const amountPerCaratage = this.itemForm.get('amountPerCaratage')!.value;
    const itemCaratage = this.itemForm.get('itemCaratage')!.value;
    if (amountPerCaratage != null && itemCaratage != null) {
      const itemValue = amountPerCaratage * itemCaratage;
      this.itemForm.get('itemValue')!.setValue(itemValue, { emitEvent: false });
    }
  }

  onSubmit() {
    if (this.itemForm.valid) {
      Swal.fire({
        title: 'Save Changes',
        text: 'Are you sure you want to save these changes?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, save',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        console.log("results: ",result)
        if (result.isConfirmed) {
          const itemDto: CreateItemDto = this.itemForm.getRawValue();
          console.log("itemDto: ",itemDto)
          if (this.item) {
            this.apiService.updateItem(this.item.itemId, itemDto).subscribe({
              next: (response: any) => {
                this.saveItem.emit(response);
                this.activeModal.close();
                Swal.fire('Saved!', 'Changes have been saved.', 'success');
              },
              error: (error: any) => {
                console.error('Error updating item:', error);
                Swal.fire('Error', 'Failed to save changes. Please try again.', 'error');
              }
            });
          } else {
            this.apiService.createItem(itemDto).subscribe({
              next: (response: any) => {
                this.saveItem.emit(response);
                this.activeModal.close();
                Swal.fire('Saved!', 'Changes have been saved.', 'success');
              },
              error: (error: any) => {
                console.error('Error creating item:', error);
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