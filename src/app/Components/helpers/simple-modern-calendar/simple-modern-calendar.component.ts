import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { ThemeService } from '../../../Services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-simple-modern-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SimpleModernCalendarComponent),
      multi: true
    }
  ],
  template: `
    <div class="modern-calendar-wrapper" [class.dark-theme]="isDarkMode">
      <div class="calendar-input-group">
        <input
          type="date"
          class="form-control modern-calendar-input"
          [min]="minDate"
          [max]="maxDate"
          [disabled]="disabled"
          [(ngModel)]="value"
          (change)="onDateChange($event)"
          (blur)="onTouchedCallback()"
        />
        <div class="calendar-icon" [class.disabled]="disabled">
          <i class="ri-calendar-line"></i>
        </div>
      </div>
    </div>
  `,
  styleUrl: './simple-modern-calendar.component.scss'
})
export class SimpleModernCalendarComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() minDate?: string;
  @Input() maxDate?: string;
  @Input() disabled: boolean = false;
  
  @Output() dateSelected = new EventEmitter<string>();

  value: string = '';
  isDarkMode = false;
  private themeSubscription?: Subscription;
  
  // Control Value Accessor methods
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe();
  }

  onDateChange(event: any): void {
    this.value = event.target.value;
    this.onChange(this.value);
    this.dateSelected.emit(this.value);
  }

  onTouchedCallback(): void {
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
