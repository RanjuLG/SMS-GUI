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
          <div class="col-lg-8 col-md-7 col-sm-12">
            <h1 class="h4 mb-1">{{ title }}</h1>
            <p class="subtitle mb-0" *ngIf="subtitle">{{ subtitle }}</p>
          </div>
          <div class="col-lg-4 col-md-5 col-sm-12 d-flex justify-content-end mt-sm-3 mt-md-0" *ngIf="showActions">
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

    .h4 {
      font-weight: 600;
      color: var(--primary-text);
      margin: 0;
    }

    .subtitle {
      color: var(--secondary-text);
      font-size: 0.875rem;
      margin: 0;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .page-header .container-fluid {
        padding-left: 1rem;
        padding-right: 1rem;
      }
      
      .page-header .py-4 {
        padding-top: 1.5rem !important;
        padding-bottom: 1.5rem !important;
      }
    }

    /* FORCE STANDARD BOOTSTRAP BUTTON STYLING - Override global theme */
    ::ng-deep .btn {
      /* Override global styles with standard Bootstrap values */
      border-radius: 0.375rem !important;
      padding: 0.375rem 0.75rem !important;
      font-size: 1rem !important;
      font-weight: 400 !important;
      line-height: 1.5 !important;
      border: 1px solid transparent !important;
      transition: none !important;
      text-decoration: none !important;
      display: inline-block !important;
      vertical-align: middle !important;
      text-align: center !important;
      cursor: pointer !important;
      transform: none !important;
      box-shadow: none !important;
    }

    /* Standard Bootstrap Primary - NO HOVER EFFECTS */
    ::ng-deep .btn-primary,
    ::ng-deep .btn-primary:hover,
    ::ng-deep .btn-primary:focus,
    ::ng-deep .btn-primary:active,
    ::ng-deep .btn-primary:visited {
      background-color: #0d6efd !important;
      border-color: #0d6efd !important;
      color: #fff !important;
      box-shadow: none !important;
      transform: none !important;
    }

    /* Standard Bootstrap Success - NO HOVER EFFECTS */
    ::ng-deep .btn-success,
    ::ng-deep .btn-success:hover,
    ::ng-deep .btn-success:focus,
    ::ng-deep .btn-success:active,
    ::ng-deep .btn-success:visited {
      background-color: #198754 !important;
      border-color: #198754 !important;
      color: #fff !important;
      box-shadow: none !important;
      transform: none !important;
    }

    /* Standard Bootstrap Info - NO HOVER EFFECTS */
    ::ng-deep .btn-info,
    ::ng-deep .btn-info:hover,
    ::ng-deep .btn-info:focus,
    ::ng-deep .btn-info:active,
    ::ng-deep .btn-info:visited {
      background-color: #0dcaf0 !important;
      border-color: #0dcaf0 !important;
      color: #000 !important;
      box-shadow: none !important;
      transform: none !important;
    }

    /* Standard Bootstrap Danger - NO HOVER EFFECTS */
    ::ng-deep .btn-danger,
    ::ng-deep .btn-danger:hover,
    ::ng-deep .btn-danger:focus,
    ::ng-deep .btn-danger:active,
    ::ng-deep .btn-danger:visited {
      background-color: #dc3545 !important;
      border-color: #dc3545 !important;
      color: #fff !important;
      box-shadow: none !important;
      transform: none !important;
    }

    /* Button spacing and arrangement */
    ::ng-deep .gap-2 {
      gap: 0.5rem !important;
    }

    ::ng-deep .d-flex {
      display: flex !important;
    }

    /* Mobile responsive button layout */
    @media (max-width: 768px) {
      ::ng-deep .gap-2 {
        flex-direction: column;
        gap: 0.5rem !important;
        width: 100%;
      }

      ::ng-deep .gap-2 .btn {
        width: 100%;
      }
    }
  `]
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showActions: boolean = true;
}
