import { EventEmitter, Output, Directive } from '@angular/core';

@Directive()
export class LateralDrawerContainer {
  @Output() successEvent: EventEmitter<void> = new EventEmitter<void>();

  emitSuccess(): void {
    this.successEvent.emit();
  }
}
