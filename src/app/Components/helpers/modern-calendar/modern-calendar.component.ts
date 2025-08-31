import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { FlatpickrModule } from 'angularx-flatpickr';
import { ThemeService } from '../../../Services/theme.service';
import { Subscription } from 'rxjs';

// Flatpickr options interface
interface FlatpickrOptions {
  mode?: 'single' | 'multiple' | 'range';
  dateFormat?: string;
  enableTime?: boolean;
  time_24hr?: boolean;
  minDate?: string | Date;
  maxDate?: string | Date;
  theme?: string;
  position?: string;
  disable?: any[];
  enable?: any[];
  inline?: boolean;
  static?: boolean;
  monthSelectorType?: 'static' | 'dropdown';
  showMonths?: number;
  conjunction?: string;
}

@Component({
  selector: 'app-modern-calendar',
  standalone: true,
  imports: [CommonModule, FlatpickrModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ModernCalendarComponent),
      multi: true
    }
  ],
  template: `
    <div class="modern-calendar-wrapper" [class.dark-theme]="isDarkMode">
      <div class="calendar-input-group">
        <input
          type="text"
          class="form-control modern-calendar-input"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [(ngModel)]="value"
          [flatpickr]="flatpickrOptions"
          (flatpickrChange)="onDateChange($event)"
          readonly
        />
        <div class="calendar-icon" [class.disabled]="disabled">
          <i class="ri-calendar-line"></i>
        </div>
      </div>
      
      <!-- Inline calendar option -->
      <div *ngIf="inline" class="inline-calendar-container">
        <input
          type="text"
          style="display: none;"
          [flatpickr]="inlineFlatpickrOptions"
          (flatpickrChange)="onDateChange($event)"
        />
      </div>
    </div>
  `,
  styleUrl: './modern-calendar.component.scss'
})
export class ModernCalendarComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() placeholder: string = 'Select date...';
  @Input() mode: 'single' | 'multiple' | 'range' = 'single';
  @Input() enableTime: boolean = false;
  @Input() dateFormat: string = 'Y-m-d';
  @Input() minDate?: string | Date;
  @Input() maxDate?: string | Date;
  @Input() disabled: boolean = false;
  @Input() inline: boolean = false;
  @Input() showMonths: number = 1;
  @Input() theme: 'light' | 'dark' | 'material' | 'airbnb' | 'confetti' = 'material';
  
  @Output() dateSelected = new EventEmitter<any>();
  @Output() ready = new EventEmitter<any>();

  value: any;
  isDarkMode = false;
  private themeSubscription?: Subscription;
  
  // Control Value Accessor methods
  private onChange: (value: any) => void = () => {};
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

  get flatpickrOptions(): FlatpickrOptions {
    return {
      mode: this.mode,
      dateFormat: this.enableTime ? `${this.dateFormat} H:i` : this.dateFormat,
      enableTime: this.enableTime,
      time_24hr: true,
      minDate: this.minDate,
      maxDate: this.maxDate,
      theme: this.isDarkMode ? 'dark' : this.theme,
      position: 'auto',
      static: false,
      monthSelectorType: 'dropdown',
      showMonths: this.showMonths,
      conjunction: ' to '
    };
  }

  get inlineFlatpickrOptions(): FlatpickrOptions {
    return {
      ...this.flatpickrOptions,
      inline: true,
      static: true
    };
  }

  onDateChange(event: any): void {
    this.value = event;
    this.onChange(event);
    this.onTouched();
    this.dateSelected.emit(event);
  }

  onReady(event: any): void {
    this.ready.emit(event);
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
