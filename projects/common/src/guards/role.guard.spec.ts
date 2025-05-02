import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { RoleGuard } from './role.guard';
import { RoleHierarchy } from '../constants/role-hierarchy.config';
import { AuthService } from '../services';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authService: AuthService;
  let router: Router;
  let routeSnapshot: DeepMockProxy<ActivatedRouteSnapshot>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        {
          provide: AuthService,
          useValue: mockDeep<AuthService>({
            userRole: undefined,
          }),
        },
        { provide: Router, useValue: mockDeep<Router>() },
      ],
    });

    guard = TestBed.inject(RoleGuard);

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    routeSnapshot = mockDeep<ActivatedRouteSnapshot>();
  });

  describe('canActivate', () => {
    it('should return true if no admittedRoles are specified', () => {
      // Arrange
      routeSnapshot.data = {};

      // Act
      const result = guard.canActivate(routeSnapshot);

      // Assert
      expect(result).toBe(true);
    });

    it('should redirect to login if userRole is not set', () => {
      // Arrange
      routeSnapshot.data = { admittedRoles: ['admin'] };

      const mockLoginTree = {} as UrlTree;
      jest.spyOn(router, 'createUrlTree').mockReturnValue(mockLoginTree);

      // Act
      const result = guard.canActivate(routeSnapshot);

      // Assert
      expect(result).toBe(mockLoginTree);
    });

    it('should allow access if user has an allowed role in hierarchy', () => {
      // Arrange
      routeSnapshot.data = { admittedRoles: ['admin'] };
      authService.userRole = 'superadmin';
      RoleHierarchy['superadmin'] = ['superadmin', 'admin'];

      // Act
      const result = guard.canActivate(routeSnapshot);

      // Assert
      expect(result).toBe(true);
    });

    it('should redirect to unauthorized if user role is not allowed', () => {
      // Arrange
      routeSnapshot.data = { admittedRoles: ['admin'] };
      authService.userRole = 'user';
      RoleHierarchy['user'] = ['user'];

      const mockUnauthorizedTree = {} as UrlTree;
      jest.spyOn(router, 'createUrlTree').mockReturnValue(mockUnauthorizedTree);

      // Act
      const result = guard.canActivate(routeSnapshot);

      // Assert
      expect(result).toBe(mockUnauthorizedTree);
    });
  });
});
