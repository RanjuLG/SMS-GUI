import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { CreateBalanceComponent } from '../helpers/cash-balance/create-balance/create-balance.component';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

interface Balance {
  date: string;
  notes: { [key: number]: number };
  totalAmount: number;
  selected?: boolean; // Add a selected property for the checkbox
}

@Component({
  selector: 'app-cash-balance',
  standalone: true,
  imports: [CommonModule, FormsModule,NgxPaginationModule],
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

  page: number = 1;
  itemsPerPage: number = 10;  // Default number of items per page
  itemsPerPageOptions: number[] = [1,5, 10, 15, 20];  // Options for items per page


  getStartIndex(): number {
    return (this.page - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    const endIndex = this.page * this.itemsPerPage;
    return endIndex > this.balances.length ? this.balances.length : endIndex;
  }
}
