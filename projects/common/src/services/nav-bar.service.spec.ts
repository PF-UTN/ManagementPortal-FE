import { TestBed } from '@angular/core/testing';

import { NavBarService } from './nav-bar.service';

describe('NavBarService', () => {
  let service: NavBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NavBarService],
    });
    service = TestBed.inject(NavBarService);
  });

  describe('Initialization', () => {
    it('should initialize with the navbar visible', () => {
      // Arrange & Act
      const isNavBarVisible = service.isNavBarVisible();

      // Assert
      expect(isNavBarVisible).toBe(true);
    });
  });

  describe('showNavBar', () => {
    it('should show the navbar', () => {
      // Arrange
      service.hideNavBar();

      // Act
      service.showNavBar();

      // Assert
      expect(service.isNavBarVisible()).toBe(true);
    });
  });

  describe('hideNavBar', () => {
    it('should hide the navbar', () => {
      // Arrange
      service.showNavBar();

      // Act
      service.hideNavBar();

      // Assert
      expect(service.isNavBarVisible()).toBe(false);
    });
  });
});
