import { TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';

import { ErrorModalComponent, ErrorModalData } from './error-modal.component';

describe('ErrorModalComponent', () => {
  let component: ErrorModalComponent;
  let dialogRef: MatDialogRef<ErrorModalComponent>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ErrorModalComponent,
        {
          provide: MatDialogRef,
          useValue: mockDeep<MatDialogRef<ErrorModalComponent>>(),
        },
        { provide: Router, useValue: mockDeep<Router>() },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            message: 'Test error',
            stack: 'stacktrace',
          } as ErrorModalData,
        },
      ],
    });

    component = TestBed.inject(ErrorModalComponent);
    router = TestBed.inject(Router);
    dialogRef = TestBed.inject(MatDialogRef<ErrorModalComponent>);
  });

  describe('config input', () => {
    it('should have message and stacktrace from MAT_DIALOG_DATA', () => {
      // Arrange & Act & Assert
      expect(component.data.message).toBe('Test error');
      expect(component.data.stack).toBe('stacktrace');
    });
  });

  describe('goHome', () => {
    it('should navigate to /inicio and close dialog', () => {
      // Arrange & Act
      component.goHome();

      // Assert
      expect(router.navigate).toHaveBeenCalledWith(['/inicio']);
      expect(dialogRef.close).toHaveBeenCalled();
    });
  });

  describe('sendError', () => {
    it('should throw not implemented, navigate to /inicio and close dialog', () => {
      // Arrange & Act & Assert
      expect(() => component.sendError()).toThrow('Not implemented');
      expect(router.navigate).toHaveBeenCalledWith(['/inicio']);
      expect(dialogRef.close).toHaveBeenCalled();
    });
  });
});
