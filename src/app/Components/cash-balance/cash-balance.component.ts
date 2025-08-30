import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { CreateBalanceComponent } from '../helpers/cash-balance/create-balance/create-balance.component';
import { FormsModule } from '@angular/forms';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

interface Balance {
  date: string;
  notes: { [key: number]: number };
  totalAmount: number;
  selected?: boolean; // Add a selected property for the checkbox
}

@Component({
  selector: 'app-cash-balance',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, PageHeaderComponent],
  templateUrl: './cash-balance.component.html',
  styleUrls: ['./cash-balance.component.scss']
})
export class CashBalanceComponent {
  balances: Balance[] = [
    {
      date: '2024-06-30',
      notes: {
        5000: 2,
        2000: 3,
        1000: 5,
        500: 0,
        100: 2,
        50: 1,
        20: 10,
        10: 0,
        5: 0,
        2: 0,
        1: 0
      },
      totalAmount: 25520
    },
    {
      date: '2024-06-29',
      notes: {
        5000: 1,
        2000: 0,
        1000: 3,
        500: 2,
        100: 1,
        50: 0,
        20: 5,
        10: 10,
        5: 0,
        2: 0,
        1: 1
      },
      totalAmount: 12380
    }
  ];

  tableColumns = [
    { key: 'date', label: 'Date' },
    { key: 'notes5000', label: 'Rs. 5000' },
    { key: 'notes2000', label: 'Rs. 2000' },
    { key: 'notes1000', label: 'Rs. 1000' },
    { key: 'notes500', label: 'Rs. 500' },
    { key: 'notes100', label: 'Rs. 100' },
    { key: 'notes50', label: 'Rs. 50' },
    { key: 'notes20', label: 'Rs. 20' },
    { key: 'notes10', label: 'Rs. 10' },
    { key: 'notes5', label: 'Rs. 5' },
    { key: 'notes2', label: 'Rs. 2' },
    { key: 'notes1', label: 'Rs. 1' },
    { key: 'totalAmount', label: 'Total Amount' }
  ];

  get processedBalances() {
    return this.balances.map(balance => ({
      ...balance,
      notes5000: balance.notes[5000],
      notes2000: balance.notes[2000],
      notes1000: balance.notes[1000],
      notes500: balance.notes[500],
      notes100: balance.notes[100],
      notes50: balance.notes[50],
      notes20: balance.notes[20],
      notes10: balance.notes[10],
      notes5: balance.notes[5],
      notes2: balance.notes[2],
      notes1: balance.notes[1]
    }));
  }

  constructor(private modalService: NgbModal) {}

  openEnterBalanceModal() {
    const modalRef = this.modalService.open(CreateBalanceComponent, { size: 'lg' });
    modalRef.result.then((result: Balance) => {
      if (result) {
        this.balances.push(result);
        Swal.fire('Success', 'Balance entry has been added.', 'success');
      }
    }).catch((error) => {
      // Handle dismiss reason if needed
    });
  }

  onTableAction(event: { action: string, item: any }) {
    const index = this.balances.findIndex(b => b.date === event.item.date);
    switch(event.action) {
      case 'edit':
        this.editBalance(index);
        break;
      case 'delete':
        this.deleteBalance(index);
        break;
    }
  }

  deleteBalance(index: number) {
    Swal.fire({
      title: 'Delete Balance Entry',
      text: 'Are you sure you want to delete this balance entry?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.balances.splice(index, 1);
        Swal.fire('Deleted!', 'Balance entry has been deleted.', 'success');
      }
    });
  }

  editBalance(index: number) {
    Swal.fire({
      title: 'Edit Balance Entry',
      text: `Editing balance entry for ${this.balances[index].date}`,
      icon: 'info',
      confirmButtonText: 'OK'
    });
    // Additional logic to handle editing the balance entry can be implemented here
  }

  deleteSelectedBalances() {
    const selectedBalances = this.balances.filter(balance => balance.selected);
    if (selectedBalances.length === 0) {
      Swal.fire(
        'No Balances Selected',
        'Please select at least one balance entry to delete.',
        'warning'
      );
      return;
    }

    Swal.fire({
      title: 'Delete Selected Balances',
      text: `Are you sure you want to delete ${selectedBalances.length} selected balance(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete them',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.balances = this.balances.filter(balance => !balance.selected);
        Swal.fire(
          'Deleted!',
          'Selected balances have been deleted.',
          'success'
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Cancelled',
          'Balance deletion cancelled.',
          'info'
        );
      }
    });
  }

  selectAllBalances(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.balances.forEach(balance => balance.selected = checkbox.checked);
  }
}
