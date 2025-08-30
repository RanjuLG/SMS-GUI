import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-spinner-overlay" [class.show]="show">
      <div class="loading-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted" *ngIf="message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-spinner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--overlay-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .loading-spinner-overlay.show {
      opacity: 1;
      visibility: visible;
    }

    .loading-spinner {
      text-align: center;
    }

    .spinner-border {
      width: 3rem;
      height: 3rem;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() show: boolean = false;
  @Input() message: string = 'Loading...';
}
