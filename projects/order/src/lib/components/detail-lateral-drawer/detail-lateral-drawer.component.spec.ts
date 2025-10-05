import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { DetailLateralDrawerComponent } from './detail-lateral-drawer.component';
import { OrderService } from '../../services/order.service';
import { mockOrderDetail } from '../../testing/mock-data.model';

describe('DetailLateralDrawerComponent', () => {
  let component: DetailLateralDrawerComponent;
  let fixture: ComponentFixture<DetailLateralDrawerComponent>;
  let orderService: OrderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailLateralDrawerComponent],
      providers: [
        {
          provide: OrderService,
          useValue: mockDeep<OrderService>(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailLateralDrawerComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService);
    component.orderId = mockOrderDetail.id;

    jest
      .spyOn(orderService, 'getOrderDetail')
      .mockReturnValue(of(mockOrderDetail));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call orderService.getOrderDetail with the correct orderId on ngOnInit', () => {
    // Arrange
    component.orderId = mockOrderDetail.id;

    // Act
    fixture.detectChanges();

    // Assert
    expect(orderService.getOrderDetail).toHaveBeenCalledWith(
      mockOrderDetail.id,
    );
  });

  it('should set the order detail data after loading', () => {
    // Arrange
    const expectedData = mockOrderDetail;

    // Act
    const result = component.data();

    // Assert
    expect(result).toEqual(expectedData);
  });

  it('should set isLoading to false after order detail is loaded', () => {
    // Act
    const result = component.isLoading();

    // Assert
    expect(result).toBe(false);
  });
});
