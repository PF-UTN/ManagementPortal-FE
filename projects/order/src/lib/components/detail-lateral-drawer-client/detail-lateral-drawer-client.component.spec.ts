import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { DetailLateralDrawerClientComponent } from './detail-lateral-drawer-client.component';
import { OrderService } from '../../services/order.service';
import { mockOrderClientDetail } from '../../testing/mock-data.model';

describe('DetailLateralDrawerClientComponent', () => {
  let component: DetailLateralDrawerClientComponent;
  let fixture: ComponentFixture<DetailLateralDrawerClientComponent>;
  let orderService: OrderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailLateralDrawerClientComponent],
      providers: [
        {
          provide: OrderService,
          useValue: mockDeep<OrderService>(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailLateralDrawerClientComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService);
    component.orderId = mockOrderClientDetail.id;

    jest
      .spyOn(orderService, 'getOrderClientDetail')
      .mockReturnValue(of(mockOrderClientDetail));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call orderService.getOrderClientDetail with the correct orderId on ngOnInit', () => {
    // Arrange
    component.orderId = mockOrderClientDetail.id;

    // Act
    fixture.detectChanges();

    // Assert
    expect(orderService.getOrderClientDetail).toHaveBeenCalledWith(
      mockOrderClientDetail.id,
    );
  });

  it('should set the order detail data after loading', () => {
    // Arrange
    const expectedData = mockOrderClientDetail;

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
