import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

export interface SearchField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'multiSelect';
  placeholder?: string;
  options?: { value: any, label: string }[];
  min?: number;
  max?: number;
}

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule
  ],
  template: `
    <div class="advanced-search-container">
      <mat-expansion-panel class="search-panel" [expanded]="expanded">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>search</mat-icon>
            <span class="ms-2">Advanced Search</span>
          </mat-panel-title>
          <mat-panel-description>
            {{ getActiveFiltersCount() }} filter(s) active
          </mat-panel-description>
        </mat-expansion-panel-header>

        <form [formGroup]="searchForm" (ngSubmit)="onSearch()">
          <div class="row g-3">
            <!-- Dynamic search fields -->
            <div *ngFor="let field of searchFields" 
                 [ngClass]="getFieldColClass(field)">
              
              <!-- Text Input -->
              <mat-form-field *ngIf="field.type === 'text'" appearance="outline" class="w-100">
                <mat-label>{{ field.label }}</mat-label>
                <input matInput 
                       [formControlName]="field.key"
                       [placeholder]="field.placeholder || ''">
              </mat-form-field>

              <!-- Number Input -->
              <mat-form-field *ngIf="field.type === 'number'" appearance="outline" class="w-100">
                <mat-label>{{ field.label }}</mat-label>
                <input matInput 
                       type="number"
                       [formControlName]="field.key"
                       [min]="field.min || null"
                       [max]="field.max || null"
                       [placeholder]="field.placeholder || ''">
              </mat-form-field>

              <!-- Date Input -->
              <mat-form-field *ngIf="field.type === 'date'" appearance="outline" class="w-100">
                <mat-label>{{ field.label }}</mat-label>
                <input matInput 
                       [matDatepicker]="picker"
                       [formControlName]="field.key">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <!-- Date Range -->
              <div *ngIf="field.type === 'dateRange'" class="w-100">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>{{ field.label }}</mat-label>
                  <mat-date-range-input [rangePicker]="rangePicker">
                    <input matStartDate 
                           [formControlName]="field.key + 'From'"
                           placeholder="Start date">
                    <input matEndDate 
                           [formControlName]="field.key + 'To'"
                           placeholder="End date">
                  </mat-date-range-input>
                  <mat-datepicker-toggle matSuffix [for]="rangePicker"></mat-datepicker-toggle>
                  <mat-date-range-picker #rangePicker></mat-date-range-picker>
                </mat-form-field>
              </div>

              <!-- Select Dropdown -->
              <mat-form-field *ngIf="field.type === 'select'" appearance="outline" class="w-100">
                <mat-label>{{ field.label }}</mat-label>
                <mat-select [formControlName]="field.key">
                  <mat-option value="">All</mat-option>
                  <mat-option *ngFor="let option of field.options" [value]="option.value">
                    {{ option.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Multi Select -->
              <mat-form-field *ngIf="field.type === 'multiSelect'" appearance="outline" class="w-100">
                <mat-label>{{ field.label }}</mat-label>
                <mat-select [formControlName]="field.key" multiple>
                  <mat-option *ngFor="let option of field.options" [value]="option.value">
                    {{ option.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="row mt-3">
            <div class="col-12 d-flex justify-content-end gap-2">
              <button type="button" 
                      mat-stroked-button 
                      (click)="onClear()">
                <mat-icon>clear</mat-icon>
                Clear
              </button>
              <button type="submit" 
                      mat-raised-button 
                      color="primary">
                <mat-icon>search</mat-icon>
                Search
              </button>
            </div>
          </div>
        </form>
      </mat-expansion-panel>
    </div>
  `,
  styles: [`
    .advanced-search-container {
      margin-bottom: 1rem;
    }

    .search-panel {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .mat-expansion-panel-header {
      padding: 0 24px;
    }

    .mat-form-field {
      width: 100%;
    }

    .mat-expansion-panel-body {
      padding: 16px 24px 24px;
    }

    .active-filters-chip {
      margin-right: 8px;
      margin-bottom: 8px;
    }

    mat-icon {
      vertical-align: middle;
    }
  `]
})
export class AdvancedSearchComponent implements OnInit {
  @Input() searchFields: SearchField[] = [];
  @Input() expanded: boolean = false;
  @Input() initialValues: any = {};

  @Output() search = new EventEmitter<any>();
  @Output() clear = new EventEmitter<void>();

  searchForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildForm();
    if (this.initialValues) {
      this.searchForm.patchValue(this.initialValues);
    }
  }

  buildForm() {
    const formControls: any = {};

    this.searchFields.forEach(field => {
      if (field.type === 'dateRange') {
        formControls[field.key + 'From'] = [''];
        formControls[field.key + 'To'] = [''];
      } else if (field.type === 'multiSelect') {
        formControls[field.key] = [[]];
      } else {
        formControls[field.key] = [''];
      }
    });

    this.searchForm = this.fb.group(formControls);
  }

  onSearch() {
    const formValue = this.searchForm.value;
    const searchCriteria: any = {};

    // Process form values and remove empty ones
    Object.keys(formValue).forEach(key => {
      const value = formValue[key];
      if (value !== null && value !== '' && value !== undefined) {
        if (Array.isArray(value) && value.length > 0) {
          searchCriteria[key] = value;
        } else if (!Array.isArray(value)) {
          searchCriteria[key] = value;
        }
      }
    });

    this.search.emit(searchCriteria);
  }

  onClear() {
    this.searchForm.reset();
    this.clear.emit();
  }

  getActiveFiltersCount(): number {
    const formValue = this.searchForm?.value || {};
    return Object.keys(formValue).filter(key => {
      const value = formValue[key];
      return value !== null && value !== '' && value !== undefined && 
             (!Array.isArray(value) || value.length > 0);
    }).length;
  }

  getFieldColClass(field: SearchField): string {
    // Adjust column classes based on field type
    switch (field.type) {
      case 'dateRange':
        return 'col-md-6';
      case 'text':
      case 'select':
        return 'col-md-4';
      case 'number':
        return 'col-md-3';
      default:
        return 'col-md-4';
    }
  }
}
