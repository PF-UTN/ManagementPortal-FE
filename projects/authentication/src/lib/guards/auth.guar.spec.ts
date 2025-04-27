import { localStorageMock, routerMock } from '@Common';

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [AuthGuard, { provide: Router, useValue: routerMock }],
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should return true if there is no token in localStorage', () => {
    // Arrange
    localStorageMock.getItem.mockReturnValue(null);
    // Act
    const result = guard.canActivate();
    // Assert
    expect(result).toBe(true);
  });

  it('should navigate to "/" if there is a token in localStorage', () => {
    // Arrange
    localStorageMock.getItem.mockReturnValue('mockTocken');

    // Act
    guard.canActivate();

    // Assert
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });
  it('should return false if there is a token in localStorage', () => {
    // Arrange
    localStorageMock.getItem.mockReturnValue('mockToken');

    // Act
    const result = guard.canActivate();

    // Assert
    expect(result).toBe(false);
  });
});
