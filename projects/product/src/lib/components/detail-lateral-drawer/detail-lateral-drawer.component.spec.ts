import { LateralDrawerService } from '@Common-UI';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { DetailLateralDrawerComponent } from './detail-lateral-drawer.component';
import { mockProductDetail } from '../../testing/mock-data.model';

describe('DetailLateralDrawerComponent', () => {
  let component: DetailLateralDrawerComponent;
  let fixture: ComponentFixture<DetailLateralDrawerComponent>;
  let lateralDrawerService: LateralDrawerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailLateralDrawerComponent],
      providers: [
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailLateralDrawerComponent);
    component = fixture.componentInstance;

    lateralDrawerService = TestBed.inject(
      LateralDrawerService,
    ) as DeepMockProxy<LateralDrawerService>;
    component.data = mockProductDetail;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('closeDrawer', () => {
    it('should call lateralDrawerService.close()', () => {
      // Act
      component.closeDrawer();

      // Assert
      expect(lateralDrawerService.close).toHaveBeenCalled();
    });
  });
});
