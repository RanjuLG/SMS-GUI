import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, forwardRef, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { ThemeService } from '../../../Services/theme.service';
import { Subscription } from 'rxjs';
import flatpickr from 'flatpickr';

interface DateRangeValue {
  start: string | null;
  end: string | null;
}

@Component({
  selector: 'app-modern-date-range-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ModernDateRangePickerComponent),
      multi: true
    }
  ],
  template: `
    <div class="modern-date-range-wrapper" [class.dark-theme]="isDarkMode">
      <div class="date-range-input-group">
        <input
          #dateInput
          type="text"
          class="form-control modern-date-range-input"
          [placeholder]="placeholder"
          [disabled]="disabled"
          readonly
        />
        <div class="calendar-icon" [class.disabled]="disabled">
          <i class="ri-calendar-line"></i>
        </div>
        <div class="range-separator">
          <i class="ri-arrow-right-line"></i>
        </div>
      </div>
    </div>
  `,
  styleUrl: './modern-date-range-picker.component.scss'
})
export class ModernDateRangePickerComponent implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor {
  @ViewChild('dateInput', { static: true }) dateInput!: ElementRef<HTMLInputElement>;
  
  @Input() placeholder: string = 'Select date range...';
  @Input() minDate?: string;
  @Input() maxDate?: string;
  @Input() disabled: boolean = false;
  @Input() dateFormat: string = 'Y-m-d';
  @Input() enableTime: boolean = false;
  @Input() 
  set value(val: DateRangeValue | null) {
    if (val && val !== this._value) {
      this._value = val;
      this.updateFlatpickrValue(val);
    }
  }
  get value(): DateRangeValue | null {
    return this._value;
  }
  
  @Output() dateRangeSelected = new EventEmitter<DateRangeValue>();
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();

  private flatpickrInstance: flatpickr.Instance | null = null;
  private _value: DateRangeValue | null = { start: null, end: null };
  isDarkMode = false;
  private themeSubscription?: Subscription;
  private useFallback = false; // Flag for fallback mode
  
  // Control Value Accessor methods
  private onChange: (value: DateRangeValue) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
      this.updateFlatpickrTheme();
    });
  }

  ngAfterViewInit(): void {
    this.initializeFlatpickr();
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe();
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
    }
  }

  private initializeFlatpickr(): void {
    const options: flatpickr.Options.Options = {
      mode: 'range',
      dateFormat: this.enableTime ? `${this.dateFormat} H:i` : this.dateFormat,
      enableTime: this.enableTime,
      time_24hr: true,
      minDate: this.minDate,
      maxDate: this.maxDate,
      position: 'auto',
      positionElement: this.dateInput.nativeElement,
      conjunction: ' to ',
      static: true, // Fix for CSS security error
      appendTo: this.dateInput.nativeElement.parentElement || undefined, // Append to parent to avoid body CSS issues
      disableMobile: false, // Allow mobile usage
      onChange: (selectedDates, dateStr) => {
        this.onDateChange(selectedDates, dateStr);
      },
      onClose: () => {
        this.onTouched();
      },
      onReady: () => {
        // Ensure proper theme application after ready
        this.updateFlatpickrTheme();
      },
      onOpen: () => {
        // Additional safety for positioning
        setTimeout(() => {
          this.updateFlatpickrTheme();
        }, 10);
      }
    };

    try {
      this.flatpickrInstance = flatpickr(this.dateInput.nativeElement, options);
      console.log('Flatpickr initialized successfully');
    } catch (error) {
      console.warn('Flatpickr initialization error, using fallback approach:', error);
      this.useFallback = true;
      
      // Fallback: Use basic input event listeners
      this.setupFallbackHandlers();
    }
    
    // Apply theme after initialization
    if (this.flatpickrInstance && this.flatpickrInstance.calendarContainer) {
      this.flatpickrInstance.calendarContainer.classList.toggle('dark-theme', this.isDarkMode);
    }
  }

  private updateFlatpickrTheme(): void {
    if (this.flatpickrInstance && this.flatpickrInstance.calendarContainer) {
      this.flatpickrInstance.calendarContainer.classList.toggle('dark-theme', this.isDarkMode);
    }
  }

  private updateFlatpickrValue(val: DateRangeValue): void {
    if (this.flatpickrInstance && val) {
      const dates: Date[] = [];
      if (val.start) {
        dates.push(new Date(val.start));
      }
      if (val.end) {
        dates.push(new Date(val.end));
      }
      this.flatpickrInstance.setDate(dates, false); // false = don't trigger onChange
    }
  }

  private onDateChange(selectedDates: Date[], dateStr: string): void {
    const newValue: DateRangeValue = {
      start: selectedDates[0] ? this.formatDate(selectedDates[0]) : null,
      end: selectedDates[1] ? this.formatDate(selectedDates[1]) : null
    };

    this._value = newValue;
    this.onChange(newValue);
    this.dateRangeSelected.emit(newValue);

    // Emit individual date changes for compatibility
    if (newValue.start) {
      this.startDateChange.emit(newValue.start);
    }
    if (newValue.end) {
      this.endDateChange.emit(newValue.end);
    }
  }

  private formatDate(date: Date): string {
    if (this.enableTime) {
      // Format as YYYY-MM-DD HH:mm using local time
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    // Format as YYYY-MM-DD using local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ControlValueAccessor implementation
  writeValue(value: DateRangeValue | null): void {
    this._value = value || { start: null, end: null };
    if (this.flatpickrInstance && value) {
      const dates: Date[] = [];
      if (value.start) dates.push(new Date(value.start));
      if (value.end) dates.push(new Date(value.end));
      this.flatpickrInstance.setDate(dates);
    }
  }

  registerOnChange(fn: (value: DateRangeValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.flatpickrInstance) {
      if (isDisabled) {
        this.flatpickrInstance.set('clickOpens', false);
      } else {
        this.flatpickrInstance.set('clickOpens', true);
      }
    }
  }

  // Public methods for compatibility with existing code
  clear(): void {
    this._value = { start: null, end: null };
    if (this.flatpickrInstance) {
      this.flatpickrInstance.clear();
    }
    this.onChange(this._value);
    this.dateRangeSelected.emit(this._value);
  }

  setDateRange(start: string | Date, end: string | Date): void {
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;
    
    if (this.flatpickrInstance) {
      this.flatpickrInstance.setDate([startDate, endDate]);
    }
  }

  private setupFallbackHandlers(): void {
    // Setup manual date range handling as fallback
    const input = this.dateInput.nativeElement;
    
    input.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const inputValue = target.value;
      
      // Try to parse date range from input value
      if (inputValue.includes(' to ')) {
        const [start, end] = inputValue.split(' to ');
        this._value = { start: start.trim(), end: end.trim() };
      } else if (inputValue) {
        // Single date - treat as start date
        this._value = { start: inputValue, end: null };
      } else {
        this._value = { start: null, end: null };
      }
      
      this.onChange(this._value);
      this.dateRangeSelected.emit(this._value);
      
      if (this._value.start) {
        this.startDateChange.emit(this._value.start);
      }
      if (this._value.end) {
        this.endDateChange.emit(this._value.end);
      }
    });

    input.addEventListener('blur', () => {
      this.onTouched();
    });
  }
}
