import {
  LateralDrawerContainer,
  LateralDrawerService,
  LoadingComponent,
  ModalComponent,
  InputComponent,
} from '@Common-UI';

import { DatePipe, CommonModule } from '@angular/common';
import { Component, OnInit, signal, effect } from '@angular/core';
import {
  FormGroup,
  FormArray,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { PurchaseOrderStatusOptionsId } from '../../constants/purchase-order-status-ids.enum';
import { PurchaseOrderDetail } from '../../models/purchase-order-detail.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
  selector: 'lib-reception-lateral-drawer',
  standalone: true,
  imports: [
    MatSnackBarModule,
    ReactiveFormsModule,
    LoadingComponent,
    CommonModule,
    InputComponent,
    MatFormFieldModule,
  ],
  providers: [DatePipe],
  templateUrl: './reception-lateral-drawer.component.html',
  styleUrl: './reception-lateral-drawer.component.scss',
})
export class ReceptionLateralDrawerComponent
  extends LateralDrawerContainer
  implements OnInit
{
  purchaseOrderId!: number;

  data = signal<PurchaseOrderDetail | null>(null);

  isLoadingData = signal(true);
  isLoadingConfirm = signal(false);
  isFormInvalid = signal(true);

  subtotal = signal(0);
  today = new Date();

  form: FormGroup<{
    items: FormArray<
      FormGroup<{
        quantity: FormControl<number>;
        price: FormControl<number>;
      }>
    >;
  }>;

  constructor(
    private readonly purchaseOrderService: PurchaseOrderService,
    public readonly lateralDrawerService: LateralDrawerService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly datePipe: DatePipe,
  ) {
    super();
    effect(() => {
      const drawerConfig = {
        ...this.lateralDrawerService.config,
        footer: {
          firstButton: {
            click: () => this.handleConfirmClick(),
            text: 'Confirmar',
            loading: this.isLoadingConfirm(),
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
    this.purchaseOrderService
      .getPurchaseOrderById(this.purchaseOrderId)
      .subscribe({
        next: (purchaseOrderDetail) => {
          this.data.set(purchaseOrderDetail);
          this.isLoadingData.set(false);
          this.initializeForm();
        },
        error: () => {
          this.snackBar.open(
            'No se pudo obtener la orden de compra',
            'Cerrar',
            { duration: 3000 },
          );
          this.isLoadingData.set(false);
        },
      });
  }

  private initializeForm() {
    const purchaseOrder = this.data();
    if (!purchaseOrder) return;

    this.form = new FormGroup({
      items: new FormArray(
        purchaseOrder.purchaseOrderItems.map(
          (product) =>
            new FormGroup({
              quantity: new FormControl(product.quantity, {
                validators: [Validators.required, Validators.min(0)],
                nonNullable: true,
              }),
              price: new FormControl(product.unitPrice, {
                validators: [Validators.required, Validators.min(1)],
                nonNullable: true,
              }),
            }),
        ),
      ),
    });
    this.form.valueChanges.subscribe(() => {
      this.updateSubtotalAndValidation();
    });
    this.updateSubtotalAndValidation();
  }

  private updateSubtotalAndValidation() {
    const items = this.form.value.items!;
    const hasAtLeastOne = items.some(
      (item) => item && typeof item.quantity === 'number' && item.quantity > 0,
    );
    const containsInvalidItem = items.some(
      (item) =>
        !item ||
        typeof item.quantity !== 'number' ||
        typeof item.price !== 'number' ||
        item.quantity < 0 ||
        item.price <= 0,
    );
    this.isFormInvalid.set(containsInvalidItem || !hasAtLeastOne);

    const total = items.reduce((acc, item) => {
      if (
        item &&
        typeof item.quantity === 'number' &&
        typeof item.price === 'number' &&
        item.quantity > 0
      ) {
        return acc + item.quantity * item.price;
      }
      return acc;
    }, 0);
    this.subtotal.set(total);
  }

  handleConfirmClick(): void {
    const dialogRef = this.dialog.open(ModalComponent, {
      data: {
        title: 'Confirmar recepción',
        message:
          '¿Está seguro que desea confirmar la recepción? Esto actualizará los stocks de los productos.',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.isLoadingConfirm.set(true);

      const purchaseOrder = this.data();
      if (!purchaseOrder) {
        this.snackBar.open('No se encontró la orden de compra', 'Cerrar', {
          duration: 3000,
        });
        this.isLoadingConfirm.set(false);
        return;
      }

      const formItems = this.form.value.items!;
      const purchaseOrderItems = purchaseOrder.purchaseOrderItems
        .map((item, idx) => ({
          productId: item.productId,
          quantity: formItems[idx].quantity ?? item.quantity,
          unitPrice: formItems[idx].price ?? item.unitPrice,
        }))
        .filter((item) => item.quantity > 0);

      const request = {
        estimatedDeliveryDate: purchaseOrder.estimatedDeliveryDate,
        effectiveDeliveryDate: this.datePipe.transform(
          new Date(),
          'yyyy-MM-dd',
        ),
        observation: purchaseOrder.observation ?? '',
        purchaseOrderStatusId: PurchaseOrderStatusOptionsId.Received,
        purchaseOrderItems,
      };

      this.purchaseOrderService
        .updatePurchaseOrderAsync(purchaseOrder.id, request)
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Recepción confirmada y stock actualizado',
              'Cerrar',
              { duration: 3000 },
            );
            this.lateralDrawerService.close();
          },
          complete: () => {
            this.isLoadingConfirm.set(false);
            this.emitSuccess();
          },
        });
    });
  }
}
