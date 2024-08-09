import { Component } from '@angular/core';
import {RouterLink} from '@angular/router'
import { CreateInvoiceComponent } from '../helpers/invoices/create-invoice/create-invoice.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent {

  constructor(
    private modalService: NgbModal,
  ) {}


  openCreateInvoiceModal() {
    const modalRef = this.modalService.open(CreateInvoiceComponent, { size: 'lg' });
    modalRef.result.then((result) => {
      if (result === 'submitted') {
        
      }
    }).catch((error) => {
      console.log('Create invoice modal dismissed:', error);
    });
  }

}
