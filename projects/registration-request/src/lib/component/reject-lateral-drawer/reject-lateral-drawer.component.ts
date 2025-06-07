import { LateralDrawerContainer, LateralDrawerService } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, Input, signal, OnInit, effect } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { RegistrationRequestListItem } from '../../models/registration-request-item.model';
import { RegistrationRequestService } from '../../services/registration-request.service';

@Component({
  selector: 'mp-reject-drawer',
  templateUrl: './reject-lateral-drawer.component.html',
  styleUrls: ['./reject-lateral-drawer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
})
export class RejectLateralDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  @Input() data: RegistrationRequestListItem;

  isLoading = signal(false);
  isFormInvalid = signal(true);

  form: FormGroup<{ rejectionReason: FormControl<string | null> }>;

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
            click: () => this.handleRejectClick(),
            text: 'Confirmar',
            loading: this.isLoading(),
            disabled: this.isFormInvalid() || this.isLoading(),
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

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm() {
    this.form = new FormGroup({
      rejectionReason: new FormControl<string | null>(null, {
        validators: [Validators.required, notBlankValidator],
      }),
    });

    this.form.valueChanges.subscribe(() => {
      this.isFormInvalid.set(this.form.invalid);
    });
  }

  closeDrawer(): void {
    this.lateralDrawerService.close();
  }

  handleRejectClick(): void {
    if (this.isLoading() || this.isFormInvalid()) {
      return;
    }
    this.isLoading.set(true);

    this.registrationRequestService
      .rejectRegistrationRequest(this.data.id, this.form.value.rejectionReason!)
      .subscribe({
        next: () => {
          this.snackBar.open('Solicitud rechazada con éxito.', 'Cerrar', {
            duration: 3000,
          });
          this.closeDrawer();
        },
        complete: () => {
          this.isLoading.set(false);
          this.emitSuccess();
        },
      });
  }
}

export function notBlankValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const value = control.value;
  if (typeof value === 'string' && value.trim().length === 0) {
    return { notBlank: true };
  }
  return null;
}
