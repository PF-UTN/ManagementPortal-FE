import { LateralDrawerContainer, LateralDrawerService } from '@Common-UI';

import { Component, effect, Input, signal } from '@angular/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { RegistrationRequestListItem } from '../../models/registration-request-item.model';
import { RegistrationRequestService } from '../../services/registration-request.service';

@Component({
  selector: 'mp-approve-drawer',
  templateUrl: './approve-lateral-drawer.component.html',
  styleUrls: ['./approve-lateral-drawer.component.scss'],
  standalone: true,
  imports: [MatSnackBarModule],
})
export class ApproveLateralDrawerComponent extends LateralDrawerContainer {
  @Input() data: RegistrationRequestListItem;

  isLoading = signal(false);

  constructor(
    private readonly registrationRequestService: RegistrationRequestService,
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly snackBar: MatSnackBar,
  ) {
    super();
    effect(() => {
      const drawerConfig = {
        ...this.lateralDrawerService.config,
        footer: {
          firstButton: {
            click: () => this.handleApproveClick(),
            text: 'Confirmar',
            loading: this.isLoading(),
          },
          secondButton: {
            click: () => this.closeDrawer(),
            text: 'Cancelar',
          },
        },
      };

      this.lateralDrawerService.updateConfig(drawerConfig);
    });
  }

  closeDrawer(): void {
    this.lateralDrawerService.close();
  }

  handleApproveClick(): void {
    this.isLoading.set(true);

    this.registrationRequestService
      .approveRegistrationRequest(this.data.id, '')
      .subscribe(() => {
        this.isLoading.set(false);
        this.snackBar.open('Solicitud aprobada con éxito.', 'Cerrar', {
          duration: 3000,
        });
        this.closeDrawer();
        this.emitClose();
      });
  }
}
