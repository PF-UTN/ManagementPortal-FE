import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'mp-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-spinner">
      <mat-progress-spinner mode="indeterminate" color="primary">
      </mat-progress-spinner>
    </div>
  `,
  styles: `
    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
    }
  `,
})
export class LoadingComponent {}
