import { LateralDrawerContainer, LateralDrawerService } from '@Common-UI';

import { CommonModule } from '@angular/common';
import { Component, signal, OnInit, effect, Input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { PurchaseOrderStatusOptionsId } from '../../constants/purchase-order-status-ids.enum';
import { PostUpdatePurchaseOrderStatusRequest } from '../../models/post-cancel-purchase-order-request.model';
import { PurchaseOrderItem } from '../../models/purchase-order-item.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
  selector: 'mp-cancel-drawer',
  templateUrl: './cancel-lateral-drawer.component.html',
  styleUrls: ['./cancel-lateral-drawer.component.scss'],
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
export class CancelLateralDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  @Input() data: PurchaseOrderItem;

  isLoading = signal(false);
  isFormInvalid = signal(true);

  form: FormGroup<{ cancelReason: FormControl<string | null> }>;

  constructor(
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly lateralDrawerService: LateralDrawerService,
    private readonly snackBar: MatSnackBar,
  ) {
    super();
    effect(() => {
      const drawerConfig = {
        ...this.lateralDrawerService.config,
        footer: {
          firstButton: {
            click: () => this.handleConfirmClick(),
            text: 'Confirmar',
            loading: this.isLoading(),
            disabled: this.isFormInvalid(),
          },
          secondButton: {
            click: () => this.lateralDrawerService.close(),
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
      cancelReason: new FormControl<string | null>(null, {
        validators: [Validators.required],
      }),
    });

    this.form.valueChanges.subscribe(() => {
      this.isFormInvalid.set(this.form.invalid);
    });
  }

  handleConfirmClick(): void {
    this.isLoading.set(true);

    this.purchaseOrderService
      .updatePurchaseOrderStatusAsync(
        this.data.id,
        new PostUpdatePurchaseOrderStatusRequest(
          PurchaseOrderStatusOptionsId.Cancelled,
          this.form.value.cancelReason!,
        ),
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Orden de Compra cancelada con éxito.', 'Cerrar', {
            duration: 3000,
          });
          this.lateralDrawerService.close();
        },
        complete: () => {
          this.isLoading.set(false);
          this.emitSuccess();
        },
      });
  }
}
