import { AuthService, RoleHierarchy, RolesEnum } from '@Common';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';

import { NavBarComponent } from './nav-bar.component';

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NavBarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockDeep(AuthService) },
      ],
    });
    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize items with the correct values for Admins', () => {
      //Arrange
      const authService = TestBed.inject(AuthService);
      jest
        .spyOn(authService, 'hasAccess')
        .mockImplementation((roles: string[]) => {
          return RoleHierarchy[RolesEnum.Admin].some((role) =>
            roles.includes(role),
          );
        });

      //Act
      component.ngOnInit();

      //Assert
      expect(component.items).toEqual([
        {
          title: 'Solicitudes de Registro',
          icon: 'app_registration',
          route: 'solicitudes-registro',
          shouldRender: true,
        },
      ]);
    });

    it('should initialize items with the correct values for Employees', () => {
      //Arrange
      const authService = TestBed.inject(AuthService);
      jest
        .spyOn(authService, 'hasAccess')
        .mockImplementation((roles: string[]) => {
          return RoleHierarchy[RolesEnum.Employee].some((role) =>
            roles.includes(role),
          );
        });

      //Act
      component.ngOnInit();

      //Assert
      expect(component.items).toEqual([
        {
          title: 'Solicitudes de Registro',
          icon: 'app_registration',
          route: 'solicitudes-registro',
          shouldRender: true,
        },
      ]);
    });
  });

  it('should initialize items with the correct values for Clients', () => {
    //Arrange
    const authService = TestBed.inject(AuthService);
    jest
      .spyOn(authService, 'hasAccess')
      .mockImplementation((roles: string[]) => {
        return RoleHierarchy[RolesEnum.Client].some((role) =>
          roles.includes(role),
        );
      });

    //Act
    component.ngOnInit();

    //Assert
    expect(component.items).toEqual([
      {
        title: 'Solicitudes de Registro',
        icon: 'app_registration',
        route: 'solicitudes-registro',
        shouldRender: false,
      },
    ]);
  });
});
