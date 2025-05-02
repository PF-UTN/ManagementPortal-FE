import { TitleComponent, ButtonComponent } from '@Common-UI';

import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { RegistrationRequestListItem } from '../../models/registration-request-item.model';
import { RegistrationRequestService } from '../../services/registration-request.service';

@Component({
  selector: 'mp-reject-drawer',
  templateUrl: './reject.component.html',
  styleUrls: ['./reject.component.scss'],
  standalone: true,
  imports: [
    MatSidenavModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    CommonModule,
    MatSnackBarModule,
    TitleComponent,
    ButtonComponent,
  ],
})
export class RejectDrawerComponent {
  @Input() data: RegistrationRequestListItem;
  @Output() close = new EventEmitter<void>();
  @Output() rejectRequest = new EventEmitter<void>();

  @ViewChild('rejectionReasonInput') rejectionReasonInput!: NgModel;

  isLoading = signal(false);
  isDrawerOpen: boolean = true;
  rejectionReason: string = '';

  constructor(
    private registrationRequestService: RegistrationRequestService,
    @Inject(MatSnackBar) private readonly snackBar: MatSnackBar,
  ) {}

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.close.emit();
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeDrawer();
    } else if (event.key === 'Enter') {
      this.handleRejectClick();
    }
  }

  handleRejectClick(): void {
    if (this.rejectionReasonInput.invalid || !this.rejectionReason.trim()) {
      this.rejectionReasonInput.control.markAsTouched(); // Marca el campo como "tocado"
      return;
    }
    this.isLoading.set(true);
    this.registrationRequestService
      .rejectRegistrationRequest(this.data.id, this.rejectionReason)
      .subscribe({
        next: () => {
          this.isLoading = signal(false);
          this.rejectRequest.emit();
          this.snackBar.open('Solicitud rechazada con éxito.', 'Cerrar', {
            duration: 3000,
          });
          this.closeDrawer();
        },
        error: () => {
          this.isLoading = signal(false);
        },
      });
  }
}
