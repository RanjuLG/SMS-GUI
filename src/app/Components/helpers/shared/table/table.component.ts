import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule, MatHint } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, 
    FormsModule, 
    DataTableComponent,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatHint,
    MatFormFieldModule,
    MatInputModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() actions: any[] = [];
  @Input() title: string = '';
  @Input() searchable: boolean = true;
  @Input() selectable: boolean = false;

  @Output() actionClick = new EventEmitter<{action: string, item: any}>();
  @Output() selectionChange = new EventEmitter<any[]>();

  onTableAction(event: {action: string, item: any}) {
    this.actionClick.emit(event);
  }

  onSelectionChange(selectedItems: any[]) {
    this.selectionChange.emit(selectedItems);
  }
}
