import { Component, EventEmitter, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

interface Balance {
  date: string;
  notes: { [key: number]: number }; // This defines notes as an object where keys are numbers and values are numbers
  totalAmount: number;
}
@Component({
  selector: 'app-create-balance',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './create-balance.component.html',
  styleUrl: './create-balance.component.scss'
})
export class CreateBalanceComponent {
  noteValues = [5000, 2000, 1000, 500, 100, 50, 20, 10, 5, 2, 1];
  balance: Balance = { date: '', notes: this.initializeNotes(), totalAmount: 0 };

  constructor(public activeModal: NgbActiveModal,private modalService: NgbModal) {}

  initializeNotes() {
    let notes: { [key: number]: number } = {}; // Explicitly type notes here
    this.noteValues.forEach(note => (notes[note] = 0));
    return notes;
  }

  calculateTotalAmount() {
    this.balance.totalAmount = this.noteValues.reduce(
      (total, note) => total + note * this.balance.notes[note],
      0
    );
  }

  submitBalance() {
    this.activeModal.close(this.balance);
  }
}
