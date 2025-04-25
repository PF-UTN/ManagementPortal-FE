import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';

import { RegistrationRequestListItem } from '../../models/registration-request-item.model';
import { RegistrationRequestService } from '../../services/registration-request.service';

@Component({
  selector: 'app-approve-drawer',
  templateUrl: './approve.component.html',
  styleUrls: ['./approve.component.scss'],
  standalone: true,
  imports: [MatSidenavModule, MatButtonModule],
})
export class ApproveDrawerComponent {
  @Input() data: RegistrationRequestListItem;
  @Output() close = new EventEmitter<void>();
  @Output() approveRequest = new EventEmitter<void>();

  isLoading: boolean = false;

  constructor(private registrationRequestService: RegistrationRequestService) {}

  closeDrawer(): void {
    this.close.emit();
  }

  approve(): void {
    this.isLoading = true;
    this.registrationRequestService
      .approveRegistrationRequest(this.data.id, '')
      .subscribe({
        next: () => {
          console.log('Solicitud aprobada con éxito.');
          this.isLoading = false;
          this.approveRequest.emit();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Error al aprobar la solicitud:', err);
          this.isLoading = false;
        },
      });
  }
}
