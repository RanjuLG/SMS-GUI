import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import Swal from 'sweetalert2';

// Services
import { UnifiedTransactionService, AdvancedFilters, TransactionSummary, ExportOptions } from '../../Services/unified-transaction.service';
import { UnifiedExportService } from '../../Services/unified-export.service';
import { DateService } from '../../Services/date-service.service';

// Models
import { TransactionReportDto, TransactionType } from '../reports/reports.model';

// Shared Components
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../shared/components/data-table/data-table.component';
import { ModernDateRangePickerComponent } from '../helpers/modern-date-range-picker/modern-date-range-picker.component';

// Chart.js for analytics
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export interface ViewMode {
  key: 'unified' | 'segmented' | 'analytics' | 'summary';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-unified-transaction-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    DataTableComponent,
    ModernDateRangePickerComponent
  ],
  templateUrl: './unified-transaction-history.component.html',
  styleUrls: ['./unified-transaction-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnifiedTransactionHistoryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data properties
  transactions: TransactionReportDto[] = [];
  filteredTransactions: TransactionReportDto[] = [];
  transactionSummary: TransactionSummary | null = null;
  loading = false;

  // UI State
  currentView: ViewMode['key'] = 'unified';
  showAdvancedFilters = false;
  selectedTransactions: TransactionReportDto[] = [];

  // Forms
  filtersForm!: FormGroup;
  searchControl = new FormControl('');

  // View modes
  viewModes: ViewMode[] = [
    { key: 'unified', label: 'Unified View', icon: 'ri-list-unordered' },
    { key: 'segmented', label: 'Segmented View', icon: 'ri-folder-line' },
    { key: 'analytics', label: 'Analytics', icon: 'ri-bar-chart-line' },
    { key: 'summary', label: 'Summary', icon: 'ri-dashboard-line' }
  ];

  // Transaction types for filtering
  transactionTypes = [
    { value: TransactionType.LoanIssuance, label: 'Loan Disbursement', color: 'primary' },
    { value: TransactionType.InstallmentPayment, label: 'Installment Payment', color: 'success' },
    { value: TransactionType.InterestPayment, label: 'Interest Payment', color: 'info' },
    { value: TransactionType.LateFeePayment, label: 'Late Fee Payment', color: 'warning' },
    { value: TransactionType.LoanClosure, label: 'Loan Closure', color: 'secondary' }
  ];

  // Quick filter presets
  quickFilters = [
    { key: 'today', label: 'Today', icon: 'ri-calendar-line' },
    { key: 'week', label: 'This Week', icon: 'ri-calendar-week-line' },
    { key: 'month', label: 'This Month', icon: 'ri-calendar-month-line' },
    { key: 'quarter', label: 'This Quarter', icon: 'ri-calendar-line' },
    { key: 'year', label: 'This Year', icon: 'ri-calendar-year-line' },
    { key: 'all', label: 'All Time', icon: 'ri-calendar-todo-line' }
  ];

  // Table configuration
  tableColumns: TableColumn[] = [
    {
      key: 'createdAt',
      label: 'Date',
      type: 'date',
      sortable: true
    },
    {
      key: 'transactionType',
      label: 'Type',
      type: 'badge',
      sortable: true
    },
    {
      key: 'invoice.invoiceNo',
      label: 'Invoice No',
      type: 'text',
      sortable: true
    },
    {
      key: 'customer.customerName',
      label: 'Customer',
      type: 'text',
      sortable: true
    },
    {
      key: 'customer.customerNIC',
      label: 'NIC',
      type: 'text',
      sortable: false
    },
    {
      key: 'subTotal',
      label: 'Principal',
      type: 'currency',
      sortable: true
    },
    {
      key: 'interestAmount',
      label: 'Interest',
      type: 'currency',
      sortable: true
    },
    {
      key: 'totalAmount',
      label: 'Total',
      type: 'currency',
      sortable: true
    }
  ];

  tableActions: TableAction[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: 'ri-eye-line',
      color: 'info'
    },
    {
      key: 'export',
      label: 'Export',
      icon: 'ri-download-line',
      color: 'secondary'
    }
  ];

  constructor(
    private unifiedTransactionService: UnifiedTransactionService,
    private unifiedExportService: UnifiedExportService,
    private dateService: DateService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.setupSubscriptions();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Initialize forms
  private initializeForms(): void {
    // Initialize with all transaction types selected by default
    const allTransactionTypes = this.transactionTypes.map(t => t.value);
    
    this.filtersForm = this.fb.group({
      transactionTypes: [allTransactionTypes],
      customerNIC: [''],
      invoiceNo: [''],
      loanStatus: ['all'],
      minAmount: [null],
      maxAmount: [null],
      dateRange: this.fb.group({
        from: [null],
        to: [null]
      })
    });

    // Setup form changes subscription
    this.filtersForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(filters => {
      this.applyAdvancedFilters(filters);
    });

    // Setup search control
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.unifiedTransactionService.updateFilters({ searchTerm: searchTerm || undefined });
    });
  }

  private setupSubscriptions(): void {
    // Subscribe to transactions
    this.unifiedTransactionService.transactions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(transactions => {
        this.transactions = transactions;
        this.filteredTransactions = transactions;
        this.cdr.markForCheck();
      });

    // Subscribe to summary
    this.unifiedTransactionService.getTransactionSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe((summary: TransactionSummary) => {
        this.transactionSummary = summary;
        this.cdr.markForCheck();
      });

    // Subscribe to loading state
    this.unifiedTransactionService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
        this.cdr.markForCheck();
      });
  }

  private loadInitialData(): void {
    this.unifiedTransactionService.applyQuickFilter('month');
  }

  // View management
  switchView(view: ViewMode['key']): void {
    this.currentView = view;
    this.cdr.markForCheck();
  }

  // Quick filters
  applyQuickFilter(filterKey: string): void {
    this.unifiedTransactionService.applyQuickFilter(filterKey as 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all');
  }

  // Advanced filters
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  private applyAdvancedFilters(filters: any): void {
    const advancedFilters: Partial<AdvancedFilters> = {
      transactionTypes: filters.transactionTypes || [],
      amountRange: {
        min: filters.minAmount || undefined,
        max: filters.maxAmount || undefined
      },
      customerNIC: filters.customerNIC || undefined,
      invoiceNumber: filters.invoiceNo || undefined,
      loanStatus: filters.loanStatus !== 'all' ? filters.loanStatus : undefined
    };

    if (filters.dateRange?.from && filters.dateRange?.to) {
      advancedFilters.dateRange = {
        from: new Date(filters.dateRange.from),
        to: new Date(filters.dateRange.to)
      };
    }

    this.unifiedTransactionService.updateFilters(advancedFilters);
  }

  // Public version for template
  applyAdvancedFiltersFromForm(): void {
    const formValues = this.filtersForm.value;
    this.applyAdvancedFilters(formValues);
  }

  // Table event handlers
  onTableSelectionChange(selectedItems: TransactionReportDto[]): void {
    this.selectedTransactions = selectedItems;
  }

  onTableAction(action: { action: string; item: any }): void {
    switch (action.action) {
      case 'view':
        this.viewTransactionDetails(action.item);
        break;
      case 'export':
        this.unifiedExportService.exportSingleTransaction(action.item);
        break;
    }
  }

  // View transaction details
  private viewTransactionDetails(transaction: TransactionReportDto): void {
    Swal.fire({
      title: 'Transaction Details',
      html: `
        <div class="transaction-details">
          <div class="row">
            <div class="col-6"><strong>Transaction ID:</strong></div>
            <div class="col-6">${transaction.transactionId}</div>
          </div>
          <div class="row">
            <div class="col-6"><strong>Type:</strong></div>
            <div class="col-6">${this.getTransactionTypeLabel(transaction.transactionType)}</div>
          </div>
          <div class="row">
            <div class="col-6"><strong>Date:</strong></div>
            <div class="col-6">${new Date(transaction.createdAt).toLocaleDateString()}</div>
          </div>
          <div class="row">
            <div class="col-6"><strong>Customer:</strong></div>
            <div class="col-6">${transaction.customer.customerName}</div>
          </div>
          <div class="row">
            <div class="col-6"><strong>Invoice No:</strong></div>
            <div class="col-6">${transaction.invoice.invoiceNo}</div>
          </div>
          <div class="row">
            <div class="col-6"><strong>Amount:</strong></div>
            <div class="col-6">${this.formatCurrency(transaction.totalAmount)}</div>
          </div>
        </div>
      `,
      width: '500px',
      confirmButtonText: 'Close'
    });
  }

  // Export functions
  exportSelected(): void {
    if (this.selectedTransactions.length === 0) {
      Swal.fire('No Selection', 'Please select transactions to export.', 'warning');
      return;
    }

    const exportOptions = {
      format: 'excel' as const,
      includeCharts: false,
      groupBy: 'none',
      summary: true,
      customFields: ['customerContact', 'customerAddress', 'invoiceDate', 'loanInfo'],
      dateRange: {
        from: new Date(Math.min(...this.selectedTransactions.map(t => new Date(t.createdAt).getTime()))),
        to: new Date(Math.max(...this.selectedTransactions.map(t => new Date(t.createdAt).getTime())))
      }
    };

    this.showExportDialog(this.selectedTransactions, exportOptions);
  }

  exportAll(): void {
    if (this.transactions.length === 0) {
      Swal.fire('No Data', 'No transactions available to export.', 'warning');
      return;
    }

    const exportOptions = {
      format: 'excel' as const,
      includeCharts: this.currentView === 'analytics',
      groupBy: 'none',
      summary: true,
      customFields: ['customerContact', 'customerAddress', 'invoiceDate', 'loanInfo'],
      dateRange: {
        from: new Date(Math.min(...this.transactions.map(t => new Date(t.createdAt).getTime()))),
        to: new Date(Math.max(...this.transactions.map(t => new Date(t.createdAt).getTime())))
      }
    };

    this.showExportDialog(this.transactions, exportOptions);
  }

  private showExportDialog(transactions: TransactionReportDto[], defaultOptions: any): void {
    Swal.fire({
      title: 'Export Options',
      html: `
        <div class="export-options">
          <div class="form-group mb-3">
            <label class="form-label">Format:</label>
            <select id="exportFormat" class="form-select">
              <option value="excel">Excel (.xlsx)</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="csv">CSV (.csv)</option>
            </select>
          </div>
          <div class="form-group mb-3">
            <label class="form-label">Group By:</label>
            <select id="groupBy" class="form-select">
              <option value="none">No Grouping</option>
              <option value="type">Transaction Type</option>
              <option value="customer">Customer</option>
              <option value="month">Month</option>
            </select>
          </div>
          <div class="form-check mb-3">
            <input type="checkbox" id="includeSummary" class="form-check-input" checked>
            <label class="form-check-label" for="includeSummary">Include Summary</label>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Export',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      preConfirm: () => {
        const format = (document.getElementById('exportFormat') as HTMLSelectElement).value as 'excel' | 'pdf' | 'csv';
        const groupBy = (document.getElementById('groupBy') as HTMLSelectElement).value;
        const includeSummary = (document.getElementById('includeSummary') as HTMLInputElement).checked;

        return {
          ...defaultOptions,
          format,
          groupBy,
          summary: includeSummary
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.performExport(transactions, result.value);
      }
    });
  }

  private performExport(transactions: TransactionReportDto[], options: any): void {
    try {
      Swal.fire({
        title: 'Exporting...',
        text: 'Please wait while we prepare your export.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      setTimeout(() => {
        switch (options.format) {
          case 'excel':
            this.unifiedExportService.exportToExcel(transactions, options, this.transactionSummary || undefined);
            break;
          case 'pdf':
            this.unifiedExportService.exportToPDF(transactions, options, this.transactionSummary || undefined);
            break;
          case 'csv':
            this.unifiedExportService.exportToCSV(transactions, options);
            break;
        }

        Swal.fire({
          icon: 'success',
          title: 'Export Complete',
          text: `Successfully exported ${transactions.length} transactions.`,
          timer: 2000,
          showConfirmButton: false
        });
      }, 1000);

    } catch (error) {
      console.error('Export error:', error);
      Swal.fire('Export Failed', 'An error occurred while exporting data.', 'error');
    }
  }

  // Refresh data
  refreshData(): void {
    this.unifiedTransactionService.refreshData();
  }

  // Reset filters
  resetFilters(): void {
    this.filtersForm.reset();
    this.searchControl.setValue('');
    this.unifiedTransactionService.applyQuickFilter('month');
  }

  // Utility methods
  getTransactionTypeLabel(type: TransactionType): string {
    return this.unifiedTransactionService.getTransactionTypeLabel(type);
  }

  getTransactionTypeColor(type: TransactionType): string {
    return this.unifiedTransactionService.getTransactionTypeColor(type);
  }

  formatCurrency(amount: number): string {
    return `Rs. ${amount?.toLocaleString() || '0'}`;
  }

  getTransactionsByType(type: TransactionType): TransactionReportDto[] {
    return this.transactions.filter(t => t.transactionType === type);
  }

  // Get total amount for transaction type
  getTotalAmountByType(type: TransactionType): number {
    return this.getTransactionsByType(type)
      .reduce((sum, transaction) => sum + (transaction.totalAmount || 0), 0);
  }

  // Template helper methods
  openAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  exportData(): void {
    const exportOptions = {
      format: 'excel' as const,
      includeCharts: false,
      groupBy: 'none' as const,
      summary: true,
      customFields: [],
      dateRange: { from: new Date(), to: new Date() }
    };
    this.showExportDialog(this.filteredTransactions, exportOptions);
  }

  toggleType(type: TransactionType): void {
    const currentTypes = this.filtersForm.get('transactionTypes')?.value || [];
    const index = currentTypes.indexOf(type);
    
    if (index > -1) {
      currentTypes.splice(index, 1);
    } else {
      currentTypes.push(type);
    }
    
    this.filtersForm.patchValue({ transactionTypes: currentTypes });
    console.log('Selected types:', currentTypes, 'Clicked type:', type); // Debug log
  }

  selectAllTransactionTypes(): void {
    const allTypes = this.transactionTypes.map(t => t.value);
    this.filtersForm.patchValue({ transactionTypes: allTypes });
  }

  clearAllTransactionTypes(): void {
    this.filtersForm.patchValue({ transactionTypes: [] });
  }

  get selectedTypes(): TransactionType[] {
    return this.filtersForm.get('transactionTypes')?.value || [];
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    const allTransactionTypes = this.transactionTypes.map(t => t.value);
    this.filtersForm.reset({
      transactionTypes: allTransactionTypes,
      customerNIC: '',
      invoiceNo: '',
      loanStatus: 'all',
      minAmount: null,
      maxAmount: null,
      dateRange: {
        from: null,
        to: null
      }
    });
    this.showAdvancedFilters = false;
    this.unifiedTransactionService.applyQuickFilter('month');
  }

  // Template helper methods
  getCurrentFilters(): any {
    return this.unifiedTransactionService.getCurrentFilters();
  }

  onDateRangeChange(dateRange: { startDate: Date, endDate: Date }): void {
    this.unifiedTransactionService.updateFilters({
      dateRange: { from: dateRange.startDate, to: dateRange.endDate }
    });
  }

  onDateFromChange(event: any): void {
    const fromDate = new Date(event.target.value);
    const currentFilters = this.getCurrentFilters();
    this.unifiedTransactionService.updateFilters({
      dateRange: { from: fromDate, to: currentFilters.dateRange.to }
    });
  }

  onDateToChange(event: any): void {
    const toDate = new Date(event.target.value);
    const currentFilters = this.getCurrentFilters();
    this.unifiedTransactionService.updateFilters({
      dateRange: { from: currentFilters.dateRange.from, to: toDate }
    });
  }

  onDateRangeSelected(dateRange: { start: string | null; end: string | null }): void {
    if (dateRange.start && dateRange.end) {
      this.unifiedTransactionService.updateFilters({
        dateRange: { 
          from: new Date(dateRange.start), 
          to: new Date(dateRange.end) 
        }
      });
    }
  }
}
