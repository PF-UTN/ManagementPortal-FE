import { EventEmitter, Output, Directive } from '@angular/core';

@Directive()
export class LateralDrawerContainer {
  @Output() closeEvent: EventEmitter<void> = new EventEmitter<void>();

  emitClose(): void {
    this.closeEvent.emit();
  }
}
