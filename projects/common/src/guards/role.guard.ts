import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  GuardResult,
  MaybeAsync,
} from '@angular/router';

import { RoleHierarchy } from '../constants/role-hierarchy.config';
import { AuthService } from '../services';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): MaybeAsync<GuardResult> {
    const allowedRoles = route.data['admittedRoles'] as string[];

    if (!allowedRoles) {
      return true;
    }

    if (!this.authService.userRole) {
      return this.router.createUrlTree(['/login']);
    }

    const userAccessibleRoles = RoleHierarchy[this.authService.userRole];

    const hasAccess = allowedRoles.some((allowedRole) => {
      return userAccessibleRoles.includes(allowedRole);
    });

    if (!hasAccess) {
      return this.router.createUrlTree(['/unauthorized']);
    }

    return hasAccess;
  }
}
