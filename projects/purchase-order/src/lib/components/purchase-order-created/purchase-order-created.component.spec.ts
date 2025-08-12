import { ProductService } from '@Product';
import { SupplierService } from '@Supplier';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';

import { PurchaseOrderCreatedComponent } from './purchase-order-created.component';

describe('PurchaseOrderCreatedComponent', () => {
  let component: PurchaseOrderCreatedComponent;
  let fixture: ComponentFixture<PurchaseOrderCreatedComponent>;
  //let routerMock: Router;
  //let supplierServiceMock: SupplierService;
  //let productServiceMock: ProductService;
  //let modalServiceMock: MatDialog;

  beforeEach(async () => {
    //let routerMock: Router;
    //let supplierServiceMock: SupplierService;

    await TestBed.configureTestingModule({
      imports: [
        PurchaseOrderCreatedComponent,
        ReactiveFormsModule,
        MatStepperModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatNativeDateModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: Router, useValue: mockDeep<Router>() },
        { provide: SupplierService, useValue: mockDeep<SupplierService>() },
        { provide: ProductService, useValue: mockDeep<ProductService>() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderCreatedComponent);
    //routerMock = TestBed.inject(Router);
    //supplierServiceMock = TestBed.inject(SupplierService);
    //productServiceMock = TestBed.inject(ProductService);
    //modalServiceMock = TestBed.inject(MatDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });
  });
});
