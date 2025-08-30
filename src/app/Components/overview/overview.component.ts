import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, CommonModule } from '@angular/common';
import { CreateInvoiceComponent } from '../helpers/invoices/create-invoice/create-invoice.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Services/api-service.service';
import { Overview } from '../reports/reports.model';
import { 
  SystemHealthOverview, 
  DatabaseHealth, 
  ServiceHealth, 
  BackupStatus, 
  StorageUsage 
} from './system-health.model';
declare var bootstrap: any;
import { AuthService } from '../../Services/auth.service';
import { forkJoin, interval, of } from 'rxjs';
import { startWith, switchMap, tap, catchError } from 'rxjs/operators';

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
  totalTransactions: number = 0;
  totalOutstanding: number = 0;
  settledLoans: number = 0;
  userName: string = '';
  greeting: string = '';
  currentDate: string = '';
  isLoading: boolean = true;
  
  // System Health Properties
  systemHealth: SystemHealthOverview | null = null;
  databaseHealth: DatabaseHealth | null = null;
  servicesHealth: ServiceHealth | null = null;
  backupStatus: BackupStatus | null = null;
  storageUsage: StorageUsage | null = null;
  isHealthLoading: boolean = true;
  healthError: string | null = null;
  
  // Make Math available in template
  Math = Math;

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
    this.loadSystemHealth();

    // Default to last 31 days and set the 31D button as active
    this.updateChartData('7D', 'btn-7D');

    // Set up auto-refresh for health data every 1 hour
    interval(3600000).pipe(
      startWith(0),
      switchMap(() => this.loadSystemHealthData())
    ).subscribe();
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
    this.isLoading = true;
    this.apiService.getOverview().subscribe({
      next: (data: Overview) => {
        console.log('Overview data received:', data);
        // Map the API response to component properties
        this.totalLoans = data.activeLoans ?? 0;
        this.totalInvoices = data.totalInvoices ?? 0;
        this.totalRevenue = data.totalTransactionAmount ?? 0;
        this.inventoryCount = data.totalItems ?? 0;
        this.customerCount = data.totalCustomers ?? 0;
        this.totalTransactions = data.totalTransactions ?? 0;
        this.totalOutstanding = data.totalOutstandingAmount ?? 0;
        this.settledLoans = data.settledLoans ?? 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching widget data:', err);
        // Set default values in case of error
        this.totalLoans = 0;
        this.totalInvoices = 0;
        this.totalRevenue = 0;
        this.inventoryCount = 0;
        this.customerCount = 0;
        this.totalTransactions = 0;
        this.totalOutstanding = 0;
        this.settledLoans = 0;
        this.isLoading = false;
      }
    });
  }

  // Load system health data
  loadSystemHealth(): void {
    this.loadSystemHealthData().subscribe({
      next: () => console.log('Health data loaded successfully'),
      error: (error) => console.log('Health monitoring not available:', error)
    });
  }

  // Load system health data with observables
  loadSystemHealthData() {
    this.isHealthLoading = true;
    this.healthError = null;

    return forkJoin({
      database: this.apiService.getDatabaseHealth(),
      services: this.apiService.getServiceHealth(),
      backup: this.apiService.getBackupStatus(),
      storage: this.apiService.getStorageUsage(),
      ping: this.apiService.getHealthPing()
    }).pipe(
      tap((healthData) => {
        this.databaseHealth = healthData.database;
        this.servicesHealth = healthData.services;
        this.backupStatus = healthData.backup;
        this.storageUsage = healthData.storage;
        this.isHealthLoading = false;
        console.log('Health ping:', healthData.ping);
      }),
      catchError((error) => {
        console.error('Error loading health data:', error);
        this.healthError = 'Failed to load health data';
        this.isHealthLoading = false;
        return of(null);
      })
    );
  }

  // Get database status class for styling
  getDatabaseStatusClass(): string {
    if (!this.databaseHealth) return 'bg-secondary';
    switch (this.databaseHealth.status) {
      case 'connected': return 'bg-success pulse';
      case 'error': return 'bg-danger pulse';
      case 'disconnected': return 'bg-warning pulse';
      default: return 'bg-secondary';
    }
  }

  // Get services status class for styling
  getServicesStatusClass(): string {
    if (!this.servicesHealth) return 'bg-secondary';
    switch (this.servicesHealth.status) {
      case 'healthy': return 'bg-success pulse';
      case 'degraded': return 'bg-warning pulse';
      case 'unhealthy': return 'bg-danger pulse';
      default: return 'bg-secondary';
    }
  }

  // Get backup status class for styling
  getBackupStatusClass(): string {
    if (!this.backupStatus) return 'bg-secondary';
    switch (this.backupStatus.status) {
      case 'success': return 'bg-success pulse';
      case 'running': return 'bg-info pulse';
      case 'failed': return 'bg-danger pulse';
      case 'error': return 'bg-danger pulse';
      case 'no-backup': return 'bg-warning pulse';
      default: return 'bg-secondary';
    }
  }

  // Get storage status class for styling
  getStorageStatusClass(): string {
    if (!this.storageUsage) return 'bg-secondary';
    const dbStatus = this.storageUsage.database.status;
    switch (dbStatus) {
      case 'normal': return 'bg-info pulse';
      case 'warning': return 'bg-warning pulse';
      case 'critical': return 'bg-danger pulse';
      default: return 'bg-secondary';
    }
  }

  // Format uptime for display
  formatUptime(uptimeSeconds: number): string {
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  // Format time ago for backup
  formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return `${diffMinutes}m ago`;
    }
  }
}
