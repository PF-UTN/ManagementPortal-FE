import { ProductService } from '@Product';
import { SupplierService } from '@Supplier';

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { PurchaseOrderCreatedComponent } from './purchase-order-created.component';

describe('PurchaseOrderCreatedComponent', () => {
  let component: PurchaseOrderCreatedComponent;
  let fixture: ComponentFixture<PurchaseOrderCreatedComponent>;
  //let routerMock: Router;
  let supplierService: SupplierService;
  //let productServiceMock: ProductService;
  //let modalServiceMock: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        provideNativeDateAdapter(),
        { provide: Router, useValue: mockDeep(Router) },
        { provide: SupplierService, useValue: mockDeep(SupplierService) },
        { provide: ProductService, useValue: mockDeep(ProductService) },
        { provide: MatDialog, useValue: mockDeep(MatDialog) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderCreatedComponent);
    supplierService = TestBed.inject(SupplierService);
    jest.spyOn(supplierService, 'getSuppliers').mockReturnValue(of([]));
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });
  });
});
