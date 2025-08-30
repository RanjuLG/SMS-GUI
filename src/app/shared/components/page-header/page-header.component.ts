import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="container-fluid py-4">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="h3 mb-1">{{ title }}</h1>
            <p class="subtitle mb-0" *ngIf="subtitle">{{ subtitle }}</p>
          </div>
          <div class="col-md-4 text-end" *ngIf="showActions">
            <ng-content select="[slot=actions]"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      background: var(--card-bg);
      border-bottom: 1px solid var(--border-color);
      box-shadow: 0 1px 3px 0 var(--shadow), 0 1px 2px 0 var(--shadow);
      margin-bottom: 1.5rem;
      transition: background-color 0.3s ease, border-color 0.3s ease;
    }

    .h3 {
      font-weight: 600;
      color: var(--primary-text);
      margin: 0;
    }

    .subtitle {
      color: var(--secondary-text);
      font-size: 0.95rem;
      margin: 0;
    }
  `]
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showActions: boolean = true;
}
