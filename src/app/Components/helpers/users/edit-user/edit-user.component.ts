import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../Services/api-service.service';
import { User, UserDTO } from "../../../user-management/user.model"; // Adjust import paths as needed
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnChanges {
  @Input() user: User | null = null;
  @Output() saveUser = new EventEmitter<UserDTO>();
  userForm: FormGroup;
  submitted = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      roles: ['', Validators.required], // Ensure this name matches the form control in the template
    });
  }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && changes['user'].currentValue) {
      this.initializeForm();
    }
  }
  

  initializeForm() {
    if (this.user) {
      console.log('Initializing form with user:', this.user);
      this.userForm.patchValue({
        userName: this.user.userName,
        email: this.user.email,
        roles: this.user.roles?.[0] || '', // Assuming the roles array is present and has values
      });
  
      console.log('Form values after patch:', this.userForm.value);
    }
  }
  

  get f() {
    return this.userForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.userForm.valid && this.user) {
      const formValues = this.userForm.value;
      const userDto: UserDTO = {
        ...formValues,
        roles: Array.isArray(formValues.roles) ? formValues.roles : [formValues.roles]
      };

      console.log('Payload:', userDto);

      Swal.fire({
        title: 'Save Changes',
        text: 'Are you sure you want to save these changes?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, save',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.apiService.updateUser(this.user!.id, userDto).subscribe({
            next: (response) => {
              this.saveUser.emit(response);
              this.activeModal.close();
              Swal.fire('Saved!', 'Changes have been saved.', 'success');
            },
            error: (error) => {
              console.error('Error updating user:', error);
              Swal.fire('Error', 'Failed to save changes. Please try again.', 'error');
            }
          });
        }
      });
    } else {
      console.log('Form is invalid. Cannot submit.');
    }
  }

  onCancel() {
    Swal.fire({
      title: 'Cancel Changes',
      text: 'Are you sure you want to cancel these changes?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.activeModal.dismiss();
        Swal.fire('Cancelled', 'Changes have been cancelled.', 'info');
      }
    });
  }
}
