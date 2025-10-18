import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormField } from '../../models/common.models';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="dynamicForm" (ngSubmit)="onSubmit()" class="needs-validation" novalidate>
      <div class="row">
        <div 
          *ngFor="let field of fields" 
          [class]="'col-md-' + (field.type === 'textarea' ? '12' : '6')">
          <div class="mb-3">
            <label [for]="field.name" class="form-label">
              {{ field.label }}
              <span *ngIf="field.required" class="text-danger">*</span>
            </label>

            <!-- Text Input -->
            <input 
              *ngIf="field.type === 'text' || field.type === 'email' || field.type === 'password'"
              [type]="field.type"
              [id]="field.name"
              [formControlName]="field.name"
              [placeholder]="field.placeholder || ''"
              class="form-control"
              [class.is-invalid]="isFieldInvalid(field.name)">

            <!-- Number Input -->
            <input 
              *ngIf="field.type === 'number'"
              type="number"
              [id]="field.name"
              [formControlName]="field.name"
              [placeholder]="field.placeholder || ''"
              class="form-control"
              [class.is-invalid]="isFieldInvalid(field.name)">

            <!-- Date Input -->
            <input 
              *ngIf="field.type === 'date'"
              type="date"
              [id]="field.name"
              [formControlName]="field.name"
              class="form-control"
              [class.is-invalid]="isFieldInvalid(field.name)">

            <!-- Select Dropdown -->
            <select 
              *ngIf="field.type === 'select'"
              [id]="field.name"
              [formControlName]="field.name"
              class="form-select"
              [class.is-invalid]="isFieldInvalid(field.name)">
              <option value="">Select {{ field.label }}</option>
              <option 
                *ngFor="let option of field.options" 
                [value]="option.value"
                [disabled]="option.disabled">
                {{ option.label }}
              </option>
            </select>

            <!-- Textarea -->
            <textarea 
              *ngIf="field.type === 'textarea'"
              [id]="field.name"
              [formControlName]="field.name"
              [placeholder]="field.placeholder || ''"
              class="form-control"
              rows="3"
              [class.is-invalid]="isFieldInvalid(field.name)">
            </textarea>

            <!-- Error Messages -->
            <div class="invalid-feedback" *ngIf="isFieldInvalid(field.name)">
              <div *ngIf="dynamicForm.get(field.name)?.errors?.['required']">
                {{ field.label }} is required
              </div>
              <div *ngIf="dynamicForm.get(field.name)?.errors?.['email']">
                Please enter a valid email address
              </div>
              <div *ngIf="dynamicForm.get(field.name)?.errors?.['pattern']">
                Invalid format for {{ field.label }}
              </div>
              <div *ngIf="dynamicForm.get(field.name)?.errors?.['min']">
                Minimum value is {{ field.validation?.min }}
              </div>
              <div *ngIf="dynamicForm.get(field.name)?.errors?.['max']">
                Maximum value is {{ field.validation?.max }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-4">
        <button 
          type="button" 
          class="btn btn-secondary"
          (click)="onCancel()">
          Cancel
        </button>
        <button 
          type="submit" 
          class="btn btn-primary"
          [disabled]="dynamicForm.invalid || loading">
          <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
          {{ submitLabel }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .form-label {
      font-weight: 500;
      color: #374151;
    }

    .form-control, .form-select {
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .form-control:focus, .form-select:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
    }

    .is-invalid {
      border-color: #dc3545;
    }

    .invalid-feedback {
      display: block;
    }

    .text-danger {
      color: #dc3545 !important;
    }
  `]
})
export class DynamicFormComponent implements OnInit {
  @Input() fields: FormField[] = [];
  @Input() initialData: any = {};
  @Input() submitLabel: string = 'Submit';
  @Input() loading: boolean = false;

  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  dynamicForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    const formControls: any = {};

    this.fields.forEach(field => {
      const validators = [];
      
      if (field.required) {
        validators.push(Validators.required);
      }

      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      if (field.validation?.pattern) {
        validators.push(Validators.pattern(field.validation.pattern));
      }

      if (field.validation?.min !== undefined) {
        validators.push(Validators.min(field.validation.min));
      }

      if (field.validation?.max !== undefined) {
        validators.push(Validators.max(field.validation.max));
      }

      formControls[field.name] = [
        this.initialData[field.name] || '', 
        validators
      ];
    });

    this.dynamicForm = this.fb.group(formControls);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.dynamicForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.dynamicForm.valid) {
      this.formSubmit.emit(this.dynamicForm.value);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel() {
    this.formCancel.emit();
  }

  private markFormGroupTouched() {
    Object.keys(this.dynamicForm.controls).forEach(key => {
      const control = this.dynamicForm.get(key);
      control?.markAsTouched();
    });
  }
}
