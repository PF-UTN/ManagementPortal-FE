import { TitleComponent, ButtonComponent } from '@Common-UI';

import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { RegistrationRequestListItem } from '../../models/registration-request-item.model';
import { RegistrationRequestService } from '../../services/registration-request.service';

@Component({
  selector: 'app-approve-drawer',
  templateUrl: './approve.component.html',
  styleUrls: ['./approve.component.scss'],
  standalone: true,
  imports: [
    MatSidenavModule,
    MatSnackBarModule,
    TitleComponent,
    ButtonComponent,
  ],
})
export class ApproveDrawerComponent {
  @Input() data: RegistrationRequestListItem;
  @Output() close = new EventEmitter<void>();
  @Output() approveRequest = new EventEmitter<void>();

  isLoading: boolean = false;

  constructor(
    private readonly registrationRequestService: RegistrationRequestService,
    @Inject(MatSnackBar) private readonly snackBar: MatSnackBar,
  ) {}

  closeDrawer(): void {
    this.close.emit();
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeDrawer();
    }
  }

  handleKeyDownApprove(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.handleApproveClick();
    }
  }

  handleApproveClick(): void {
    this.isLoading = true;
    this.registrationRequestService
      .approveRegistrationRequest(this.data.id, '')
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.approveRequest.emit();
          this.snackBar.open('Solicitud aprobada con éxito.', 'Cerrar', {
            duration: 3000,
          });
          this.closeDrawer();
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }
}
