import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { ModalConfig } from './model/modal-config.model';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'mp-abstract-modal',
  templateUrl: './modal.component.html',
  imports: [MatDialogModule, ButtonComponent],
  styles: ``,
  standalone: true,
})
export class ModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalConfig,
  ) {}

  cancel() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.dialogRef.close(true);
  }
}
