import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TransactionReportDto, TransactionType } from '../Components/reports/reports.model';
import { ExportOptions, TransactionSummary } from './unified-transaction.service';

@Injectable({
  providedIn: 'root'
})
export class UnifiedExportService {

  constructor() { }

  // Export transactions to Excel
  exportToExcel(
    transactions: TransactionReportDto[], 
    options: ExportOptions,
    summary?: TransactionSummary
  ): void {
    const workbook = XLSX.utils.book_new();
    
    // Prepare main data
    const exportData = this.prepareExportData(transactions, options);
    
    // Create main worksheet
    const mainWorksheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, 'Transactions');
    
    // Add summary worksheet if requested
    if (options.summary && summary) {
      const summaryData = this.prepareSummaryData(summary);
      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
    }
    
    // Add grouped worksheets if requested
    if (options.groupBy !== 'none') {
      const groupedData = this.groupTransactions(transactions, options.groupBy);
      Object.entries(groupedData).forEach(([groupName, groupTransactions]) => {
        const groupData = this.prepareExportData(groupTransactions, options);
        const groupWorksheet = XLSX.utils.json_to_sheet(groupData);
        const sheetName = this.sanitizeSheetName(groupName);
        XLSX.utils.book_append_sheet(workbook, groupWorksheet, sheetName);
      });
    }
    
    // Generate and save file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    const filename = this.generateFilename('xlsx', options);
    saveAs(blob, filename);
  }

  // Export transactions to PDF
  exportToPDF(
    transactions: TransactionReportDto[], 
    options: ExportOptions,
    summary?: TransactionSummary
  ): void {
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Add title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction History Report', 14, yPosition);
    yPosition += 10;
    
    // Add date range
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date Range: ${options.dateRange.from.toLocaleDateString()} - ${options.dateRange.to.toLocaleDateString()}`, 14, yPosition);
    yPosition += 10;
    
    // Add summary if requested
    if (options.summary && summary) {
      yPosition = this.addSummaryToPDF(doc, summary, yPosition);
    }
    
    // Add main data table
    const tableData = this.prepareTableDataForPDF(transactions, options);
    
    autoTable(doc, {
      head: [this.getTableHeaders(options)],
      body: tableData,
      startY: yPosition,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 58, 64] },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      margin: { top: yPosition }
    });
    
    // Save PDF
    const filename = this.generateFilename('pdf', options);
    doc.save(filename);
  }

  // Export transactions to CSV
  exportToCSV(
    transactions: TransactionReportDto[], 
    options: ExportOptions
  ): void {
    const exportData = this.prepareExportData(transactions, options);
    const csv = this.convertToCSV(exportData);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const filename = this.generateFilename('csv', options);
    saveAs(blob, filename);
  }

  // Prepare export data based on selected fields
  private prepareExportData(transactions: TransactionReportDto[], options: ExportOptions): any[] {
    return transactions.map(transaction => {
      const baseData: any = {
        'Date': new Date(transaction.createdAt).toLocaleDateString(),
        'Transaction ID': transaction.transactionId,
        'Type': this.getTransactionTypeLabel(transaction.transactionType),
        'Invoice No': transaction.invoice.invoiceNo,
        'Customer Name': transaction.customer.customerName,
        'Customer NIC': transaction.customer.customerNIC,
        'Principal Amount': transaction.subTotal,
        'Interest Amount': transaction.interestAmount,
        'Total Amount': transaction.totalAmount
      };

      // Add custom fields if specified
      if (options.customFields.length > 0) {
        const customData: any = {};
        options.customFields.forEach(field => {
          switch (field) {
            case 'customerContact':
              customData['Customer Contact'] = transaction.customer.customerContactNo;
              break;
            case 'customerAddress':
              customData['Customer Address'] = transaction.customer.customerAddress;
              break;
            case 'invoiceDate':
              customData['Invoice Date'] = new Date(transaction.invoice.dateGenerated).toLocaleDateString();
              break;
            case 'loanInfo':
              if (transaction.loan) {
                customData['Loan Status'] = transaction.loan.isSettled ? 'Settled' : 'Active';
                customData['Outstanding Amount'] = transaction.loan.outstandingAmount;
                customData['Amount Paid'] = transaction.loan.amountPaid;
              }
              break;
          }
        });
        return { ...baseData, ...customData };
      }

      return baseData;
    });
  }

  // Prepare summary data for export
  private prepareSummaryData(summary: TransactionSummary): any[] {
    const summaryData = [
      { 'Metric': 'Total Transactions', 'Value': summary.totalCount },
      { 'Metric': 'Total Amount', 'Value': summary.totalAmount },
      { 'Metric': 'Average Amount', 'Value': summary.averageAmount },
      { 'Metric': '', 'Value': '' }, // Empty row
      { 'Metric': 'Transaction Type Breakdown', 'Value': '' }
    ];

    // Add transaction type breakdown
    Object.entries(summary.byType).forEach(([type, data]) => {
      const typeLabel = this.getTransactionTypeLabel(parseInt(type) as TransactionType);
      summaryData.push({
        'Metric': `${typeLabel} - Count`,
        'Value': data.count
      });
      summaryData.push({
        'Metric': `${typeLabel} - Amount`,
        'Value': data.amount
      });
    });

    return summaryData;
  }

  // Group transactions by specified criteria
  private groupTransactions(transactions: TransactionReportDto[], groupBy: string): Record<string, TransactionReportDto[]> {
    const grouped: Record<string, TransactionReportDto[]> = {};

    transactions.forEach(transaction => {
      let key: string;
      
      switch (groupBy) {
        case 'type':
          key = this.getTransactionTypeLabel(transaction.transactionType);
          break;
        case 'customer':
          key = transaction.customer.customerName || 'Unknown';
          break;
        case 'month':
          const date = new Date(transaction.createdAt);
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = 'All';
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(transaction);
    });

    return grouped;
  }

  // Add summary section to PDF
  private addSummaryToPDF(doc: jsPDF, summary: TransactionSummary, startY: number): number {
    let yPosition = startY + 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Transactions: ${summary.totalCount.toLocaleString()}`, 14, yPosition);
    yPosition += 5;
    doc.text(`Total Amount: Rs. ${summary.totalAmount.toLocaleString()}`, 14, yPosition);
    yPosition += 5;
    doc.text(`Average Amount: Rs. ${summary.averageAmount.toLocaleString()}`, 14, yPosition);
    yPosition += 15;
    
    return yPosition;
  }

  // Prepare table data for PDF
  private prepareTableDataForPDF(transactions: TransactionReportDto[], options: ExportOptions): any[][] {
    return transactions.map(transaction => [
      new Date(transaction.createdAt).toLocaleDateString(),
      this.getTransactionTypeLabel(transaction.transactionType),
      transaction.invoice.invoiceNo,
      transaction.customer.customerName,
      transaction.customer.customerNIC,
      `Rs. ${transaction.subTotal?.toLocaleString()}`,
      `Rs. ${transaction.interestAmount?.toLocaleString()}`,
      `Rs. ${transaction.totalAmount?.toLocaleString()}`
    ]);
  }

  // Get table headers
  private getTableHeaders(options: ExportOptions): string[] {
    const headers = [
      'Date',
      'Type',
      'Invoice No',
      'Customer',
      'NIC',
      'Principal',
      'Interest',
      'Total'
    ];

    // Add custom headers based on selected fields
    if (options.customFields.includes('customerContact')) {
      headers.push('Contact');
    }
    if (options.customFields.includes('loanInfo')) {
      headers.push('Loan Status');
    }

    return headers;
  }

  // Convert data to CSV format
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }

  // Generate filename based on options
  private generateFilename(extension: string, options: ExportOptions): string {
    const date = new Date().toISOString().split('T')[0];
    const fromDate = options.dateRange.from.toISOString().split('T')[0];
    const toDate = options.dateRange.to.toISOString().split('T')[0];
    
    let filename = `transactions_${fromDate}_to_${toDate}`;
    
    if (options.groupBy !== 'none') {
      filename += `_grouped_by_${options.groupBy}`;
    }
    
    filename += `_exported_${date}.${extension}`;
    
    return filename;
  }

  // Sanitize sheet name for Excel
  private sanitizeSheetName(name: string): string {
    return name.replace(/[\\\/\*\?\[\]]/g, '_').substring(0, 31);
  }

  // Get transaction type label
  private getTransactionTypeLabel(type: TransactionType): string {
    switch (type) {
      case TransactionType.LoanIssuance:
        return 'Loan Disbursement';
      case TransactionType.InstallmentPayment:
        return 'Installment Payment';
      case TransactionType.InterestPayment:
        return 'Interest Payment';
      case TransactionType.LateFeePayment:
        return 'Late Fee Payment';
      case TransactionType.LoanClosure:
        return 'Loan Closure';
      default:
        return 'Unknown';
    }
  }

  // Export single transaction
  exportSingleTransaction(transaction: TransactionReportDto, format: 'excel' | 'pdf' | 'csv' = 'excel'): void {
    const options: ExportOptions = {
      format,
      includeCharts: false,
      groupBy: 'none',
      summary: false,
      customFields: ['customerContact', 'customerAddress', 'invoiceDate', 'loanInfo'],
      dateRange: { from: new Date(transaction.createdAt), to: new Date(transaction.createdAt) }
    };

    switch (format) {
      case 'excel':
        this.exportToExcel([transaction], options);
        break;
      case 'pdf':
        this.exportToPDF([transaction], options);
        break;
      case 'csv':
        this.exportToCSV([transaction], options);
        break;
    }
  }
}
