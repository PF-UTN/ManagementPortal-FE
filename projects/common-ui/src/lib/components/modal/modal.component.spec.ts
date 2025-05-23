import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { mockDeep } from 'jest-mock-extended';

import { ModalComponent } from './modal.component';
import { ModalConfig } from './model/modal-config.model';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let dialogRef: MatDialogRef<ModalComponent>;

  const mockData: ModalConfig = {
    title: 'Test Title',
    message: 'Test Message',
    confirmText: 'Yes',
    cancelText: 'No',
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDeep<MatDialogRef<ModalComponent>>(),
        },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    });

    fixture = TestBed.createComponent(ModalComponent);

    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef);

    fixture.detectChanges();
  });

  it('should create', () => {
    //AAA
    expect(component).toBeTruthy();
  });

  it('should close dialog with false when cancel is called', () => {
    //Arrange & Act
    component.cancel();

    //Assert
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should close dialog with true when confirm is called', () => {
    //Arrange & Act
    component.confirm();

    //Assert
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should receive data via MAT_DIALOG_DATA', () => {
    //AAA
    expect(component.data).toEqual(mockData);
  });
});
