import { AuthService, RolesEnum } from '@Common';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';

import { UnauthorizedComponent } from './unauthorized.component';

describe('UnauthorizedComponent', () => {
  let fixture: ComponentFixture<UnauthorizedComponent>;
  let component: UnauthorizedComponent;
  let authMock: AuthService;
  let routerMock: Router;

  beforeEach(async () => {
    authMock = mockDeep<AuthService>();
    routerMock = mockDeep<Router>();

    await TestBed.configureTestingModule({
      imports: [UnauthorizedComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UnauthorizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('buttonLabel debe ser "Ir a Productos" cuando userRole es Client', () => {
    // Arrange
    authMock.userRole = RolesEnum.Client;

    // Act
    const label = component.buttonLabel;

    // Assert
    expect(label).toBe('Ir a Productos');
  });

  it('goHome debe navegar a /productos/cliente cuando userRole es Client', () => {
    // Arrange
    authMock.userRole = RolesEnum.Client;
    const navigateSpy = jest.spyOn(routerMock, 'navigate');

    // Act
    component.goHome();

    // Assert
    expect(navigateSpy).toHaveBeenCalledWith(['/productos/cliente']);
  });

  it('goHome debe navegar a /inicio para roles que no sean Client', () => {
    // Arrange
    authMock.userRole = RolesEnum.Employee;
    const navigateSpy = jest.spyOn(routerMock, 'navigate');

    // Act
    component.goHome();

    // Assert
    expect(navigateSpy).toHaveBeenCalledWith(['/inicio']);
  });
});
