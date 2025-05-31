import { CommonModule } from '@angular/common';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../services/product.service';
import { mockProductListItem } from '../../testing';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let service: DeepMockProxy<ProductService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductListComponent,
        BrowserAnimationsModule,
        MatPaginatorModule,
        CommonModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
      ],
      providers: [
        {
          provide: ProductService,
          useValue: mockDeep<ProductService>(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    service = TestBed.inject(ProductService) as DeepMockProxy<ProductService>;
    service.postSearchProduct.mockReturnValue(
      of({ total: mockProductListItem.length, results: mockProductListItem }),
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch data on init and update dataSource$', fakeAsync(() => {
      //Arrange
      component.ngOnInit();

      //Act
      tick(1100);

      //Assert
      expect(component.dataSource$.value).toEqual(mockProductListItem);
    }));
    it('should fetch data on init and update itemsNumber', fakeAsync(() => {
      //Arrange
      component.ngOnInit();

      //Act
      tick(1100);

      //Assert
      expect(component.itemsNumber).toBe(mockProductListItem.length);
    }));
    it('should fecht data on init and update isLoading', fakeAsync(() => {
      //Arrange
      component.ngOnInit();

      //Act
      tick(1100);

      //Assert
      expect(component.isLoading).toBe(false);
    }));
    it('should handle errors when fetch Products fails', fakeAsync(() => {
      // Arrange
      component.ngOnInit();
      service.postSearchProduct.mockReturnValueOnce(
        throwError(() => new Error('Test error')),
      );

      // Act
      component.doSearchSubject$.next();
      tick(1100);
      fixture.detectChanges();

      // Assert
      expect(component.isLoading).toBe(false);
    }));
  });
  describe('handlePageChange', () => {
    it('should update pageIndex doSearchSubject$', () => {
      // Arrange
      const event = { pageIndex: 1, pageSize: 20 };
      jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.handlePageChange(event);

      // Assert
      expect(component.pageIndex).toBe(1);
    });
    it('should update pageSize doSearchSubject$', () => {
      // Arrange
      const event = { pageIndex: 1, pageSize: 20 };
      jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.handlePageChange(event);

      // Assert
      expect(component.pageSize).toBe(20);
    });
    it('should call doSearchSubject$.next()', () => {
      // Arrange
      const event = { pageIndex: 1, pageSize: 20 };
      jest.spyOn(component.doSearchSubject$, 'next');

      // Act
      component.handlePageChange(event);

      // Assert
      expect(component.doSearchSubject$.next).toHaveBeenCalled();
    });
  });
  describe('debounceTime in doSearchSubject$', () => {
    it('should trigger the request only after the debounce time and only once for rapid consecutive triggers', fakeAsync(() => {
      // Arrange
      component.ngOnInit();
      const spy = jest.spyOn(service, 'postSearchProduct');

      // Act
      component.doSearchSubject$.next();
      tick(300);
      component.doSearchSubject$.next();
      tick(300);
      component.doSearchSubject$.next();
      expect(spy).not.toHaveBeenCalled();
      tick(1100);
      fixture.detectChanges();

      // Assert
      expect(spy).toHaveBeenCalledTimes(1);
    }));
  });
});
