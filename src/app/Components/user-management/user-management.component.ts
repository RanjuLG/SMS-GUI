import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { ApiService } from '../../Services/api-service.service';
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatHint } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from './user.model';
import { EditUserComponent } from '../helpers/users/edit-user/edit-user.component';

export interface ExtendedUserDto extends User {
  selected?: boolean;
}


@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule, 
    CommonModule, 
    NgxPaginationModule, 
    ReactiveFormsModule, 
    JsonPipe,
    MatDatepickerModule,
    MatHint,
    MatFormFieldModule, // Import Material Form Field Module
    MatInputModule,],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  users: ExtendedUserDto[] = [];
  selectedUsers: ExtendedUserDto[] = [];
  itemsPerPage: number = 10;
  page: number = 1;
  itemsPerPageOptions: number[] = [5, 10, 20, 50];

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef,private modalService: NgbModal, ) {}

  ngOnInit(): void {
    this.loadUserDetails();
  }

  loadUserDetails(): void {
    this.apiService.getUsers().subscribe({
      next: (users: ExtendedUserDto[]) => {
        this.users = users;
        console.log("Users loaded: ", this.users);
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
      }
    });
  }

  editUser(user: User): void {
    console.log("user to be edited: ",user)
    // Handle edit user functionality, likely by opening a modal with the user's data
    Swal.fire({
      title: 'Edit User',
      text: `Are you sure you want to edit user '${user.userName}'?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      confirmButtonText: 'Yes, edit it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("edit user: ",user)
        const modalRef = this.modalService.open(EditUserComponent, { size: 'lg' });
        modalRef.componentInstance.user = { ...user };
        modalRef.componentInstance.saveUser.subscribe((updatedUser: User) => {
          // Update the local customers array or reload customers from API
          this.loadUserDetails(); // Reload customers after editing
          Swal.fire('Updated!', 'User has been updated.', 'success');
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'User editing cancelled.', 'info');
      }
    });
  }


  deleteSelectedUsers(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete selected user(s)?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!'
    }).then((result) => {
      if (result.isConfirmed) {
        const userIds = this.selectedUsers.map(user => user.id);
        this.apiService.deleteUsers(userIds).subscribe({
          next: () => {
            this.users = this.users.filter(u => !this.selectedUsers.includes(u));
            Swal.fire('Deleted!', 'Selected users have been deleted.', 'success');
            this.selectedUsers = [];
          },
          error: (error) => {
            console.error('Error deleting users:', error);
            Swal.fire('Error!', 'An error occurred while deleting the users.', 'error');
          }
        });
      }
    });
  }
  

  selectAll(event: any): void {
    const checked = event.target.checked;
    this.users.forEach(user => user.selected = checked);
    this.selectedUsers = checked ? [...this.users] : [];
  }

  getStartIndex(): number {
    return (this.page - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    return Math.min(this.page * this.itemsPerPage, this.users.length);
  }
}