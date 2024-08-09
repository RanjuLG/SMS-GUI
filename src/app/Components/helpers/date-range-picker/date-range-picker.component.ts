import { EventEmitter, NgModule, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateRange, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
  ],
  exports: [
    DateRangePickerComponent
  ]
})

export class DateRangePickerComponent {
  @Output() dateRangeSelected = new EventEmitter<DateRange<Date>>();

  onDateRangeChange(dateRange: DateRange<Date>): void {
    this.dateRangeSelected.emit(dateRange);
  }
}
