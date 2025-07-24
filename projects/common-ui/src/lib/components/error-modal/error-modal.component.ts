import { ButtonComponent } from '@Common-UI';

import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Router } from '@angular/router';

export interface ErrorModalData {
  message: string;
  stack?: string;
}

@Component({
  selector: 'mp-error-modal',
  templateUrl: './error-modal.component.html',
  imports: [MatDialogModule, ButtonComponent],
  standalone: true,
})
export class ErrorModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ErrorModalComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: ErrorModalData,
  ) {}

  goHome() {
    this.router.navigate(['/inicio']);
    this.dialogRef.close();
  }

  sendError() {
    this.router.navigate(['/inicio']);
    this.dialogRef.close();
    throw new Error('Not implemented');
  }
}
