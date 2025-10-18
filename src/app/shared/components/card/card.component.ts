import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class]="cardClass">
      <div class="card-header" *ngIf="showHeader">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <h5 class="card-title mb-0" *ngIf="title">{{ title }}</h5>
            <p class="card-subtitle text-muted small mb-0" *ngIf="subtitle">{{ subtitle }}</p>
          </div>
          <div *ngIf="showHeaderActions">
            <ng-content select="[slot=header-actions]"></ng-content>
          </div>
        </div>
      </div>
      
      <div class="card-body" [class]="bodyClass">
        <ng-content></ng-content>
      </div>
      
      <div class="card-footer" *ngIf="showFooter">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      transition: box-shadow 0.15s ease-in-out;
    }

    .card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .card-header {
      background-color: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      padding: 1rem 1.25rem;
    }

    .card-title {
      font-weight: 600;
      color: #1f2937;
    }

    .card-subtitle {
      color: #6b7280;
    }

    .card-body {
      padding: 1.25rem;
    }

    .card-footer {
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      padding: 0.75rem 1.25rem;
    }
  `]
})
export class CardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showHeader: boolean = true;
  @Input() showFooter: boolean = false;
  @Input() showHeaderActions: boolean = false;
  @Input() cardClass: string = '';
  @Input() bodyClass: string = '';
}
