import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, CommonModule } from '@angular/common';
import { CreateInvoiceComponent } from '../helpers/invoices/create-invoice/create-invoice.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Services/api-service.service';
import { Overview } from '../reports/reports.model';
declare var bootstrap: any;
import { AuthService } from '../../Services/auth.service';

// Import shared components
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    CommonModule,
    PageHeaderComponent,
    CardComponent
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit, AfterViewInit {
  totalLoans: number = 0;
  totalInvoices: number = 0;
  totalRevenue: number = 0;
  inventoryCount: number = 0;
  customerCount: number = 0;
  userName: string = '';
  greeting: string = '';
  currentDate: string = '';

  constructor(
    private modalService: NgbModal,
    private el: ElementRef,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngAfterViewInit(): void {
    const tooltipElements = this.el.nativeElement.querySelectorAll('[data-bs-toggle="tooltip"]');

    tooltipElements.forEach((element: HTMLElement) => {
      const tooltip = new bootstrap.Tooltip(element, {
        placement: 'right',
        trigger: 'hover' // Use hover to show/hide tooltip on mouse events
      });

      element.addEventListener('click', () => {
        // If the tooltip is visible, hide it; otherwise, show it.
        if (tooltip._isShown()) {
          tooltip.hide();
        } else {
          tooltip.show();
        }
      });

      // Optional: Dismiss tooltip if clicked outside the element
      document.addEventListener('click', (event: MouseEvent) => {
        if (!element.contains(event.target as Node)) {
          tooltip.hide();
        }
      });
    });
  }

  ngOnInit(): void {
    this.getUserName();
    this.greet();
    this.updateDate();
    this.loadDashboardData();

    // Default to last 31 days and set the 31D button as active
    this.updateChartData('7D', 'btn-7D');
  }

  openCreateInvoiceModal() {
    const modalRef = this.modalService.open(CreateInvoiceComponent, { size: 'lg' });
    modalRef.result.then((result) => {
      if (result === 'submitted') {

      }
    }).catch((error) => {
      console.log('Create invoice modal dismissed:', error);
    });
  }

  greet() {
    const currentHour = new Date().getHours(); // Get the current hour (0-23)

    if (currentHour >= 3 && currentHour < 12) {
      this.greeting = 'Good Morning';
    } else if (currentHour >= 12 && currentHour < 17) {
      this.greeting = 'Good Afternoon';
    } else if (currentHour >= 17 && currentHour < 22) {
      this.greeting = 'Good Evening';
    } else if (currentHour >= 22 || currentHour < 3) {
      this.greeting = 'Good Night';
    }
  }

  getUserName() {
    const _userName = this.authService.getUserName();

    if (_userName != false) {
      this.userName = _userName.toString();
    }
  }

  updateDate() {
    const now = new Date();

    // Get day with the ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
    const day = now.getDate();
    const ordinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return 'th'; // Covers 11th, 12th, 13th, etc.
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };

    const dayWithSuffix = day + ordinalSuffix(day);

    // Format the date string
    this.currentDate = now.toLocaleDateString('en-GB', {
      weekday: 'long', month: 'long', year: 'numeric'
    });

    // Append day with suffix to the final date string
    this.currentDate = `${now.toLocaleDateString('en-GB', { weekday: 'long' })}, ${dayWithSuffix} of ${now.toLocaleDateString('en-GB', { month: 'long' })} ${now.getFullYear()}`;
  }

  // Component methods and lifecycle hooks
  updateChartData(range: string, buttonId: string) {
    // This method can be used for future chart implementations
    // Remove the 'active' class from all range buttons
    const buttons = document.querySelectorAll('.range-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Add the 'active' class to the clicked button
    const activeButton = document.getElementById(buttonId);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  // Load dashboard data from API
  loadDashboardData(): void {
    this.apiService.getOverview().subscribe({
      next: (data: Overview) => {
        // Update the widget values from the API response
        this.totalLoans = data.totalActiveLoans ?? 0;
        this.totalInvoices = data.totalInvoices ?? 0;
        this.totalRevenue = data.revenueGenerated ?? 0;
        this.inventoryCount = data.inventoryCount ?? 0;
        this.customerCount = data.customerCount ?? 0;
      },
      error: (err) => {
        console.error('Error fetching widget data:', err);
      }
    });
  }
}
