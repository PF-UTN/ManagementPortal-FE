import { ViewContainerRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDrawer } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep } from 'jest-mock-extended';

import { LateralDrawerComponent } from './lateral-drawer.component';
import { LateralDrawerService } from './service/lateral-drawer.service';

describe('LateralDrawerComponent', () => {
  let component: LateralDrawerComponent;
  let fixture: ComponentFixture<LateralDrawerComponent>;
  let service: LateralDrawerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LateralDrawerComponent, BrowserAnimationsModule],
      providers: [
        {
          provide: LateralDrawerService,
          useClass: mockDeep(LateralDrawerService),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LateralDrawerComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(LateralDrawerService);

    component.drawer = mockDeep<MatDrawer>();
    component.container = mockDeep<ViewContainerRef>();

    fixture.detectChanges();
  });

  describe('config input', () => {
    it('should have default title as "Default Title"', () => {
      // Arrange
      const expectedTitle = 'Default Title';

      // Act
      const actualTitle = component.config.title;

      // Assert
      expect(actualTitle).toBe(expectedTitle);
    });

    it('should call drawer.close on default firstButton click', () => {
      // Arrange
      const closeSpy = jest.spyOn(component.drawer, 'close');

      // Act
      component.config.footer.firstButton.click();

      // Assert
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should call setDrawer with drawer and container', () => {
      // Arrange
      const setDrawerSpy = jest.spyOn(service, 'setDrawer');

      // Act
      component.ngOnInit();

      // Assert
      expect(setDrawerSpy).toHaveBeenCalledWith(
        component.drawer,
        component.container,
      );
    });
  });

  describe('closeDrawer', () => {
    it('should call drawer.close()', () => {
      // Arrange
      const closeSpy = jest.spyOn(component.drawer, 'close');

      // Act
      component.closeDrawer();

      // Assert
      expect(closeSpy).toHaveBeenCalled();
    });
  });
});
