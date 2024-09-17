import { CommonModule, JsonPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-loan-info',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule,  
  ],
  templateUrl: './loan-info.component.html',
  styleUrl: './loan-info.component.scss'
})
export class LoanInfoComponent implements OnInit {
  @Input() loan: any;  // This should be passed from the parent component, the report with loan info


  
  constructor(public activeModal: NgbActiveModal) {
    }

    
  ngOnInit(): void {
    //console.log("loan.installments: ", this.loan.installments)
  }
  onCancel(): void {
    this.activeModal.dismiss();
  }

  
}
