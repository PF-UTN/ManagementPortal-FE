import { AuthService, RoleHierarchy, RolesEnum } from '@Common';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { NavBarComponent } from './nav-bar.component';

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;
  let authService: AuthService;
  let dialog: MatDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NavBarComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: mockDeep<AuthService>({
            userName: 'Jhon Doe',
          }),
        },
        { provide: MatDialog, useValue: mockDeep(MatDialog) },
      ],
    });
    fixture = TestBed.createComponent(NavBarComponent);

    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    dialog = TestBed.inject(MatDialog);

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
          title: 'Inicio',
          icon: 'home',
          route: 'inicio',
          shouldRender: true,
        },
        {
          title: 'Solicitudes de Registro',
          icon: 'app_registration',
          route: 'solicitudes-registro',
          shouldRender: true,
        },
        {
          title: 'Inventario',
          icon: 'inventory_2',
          route: 'productos',
          shouldRender: true,
        },
        {
          title: 'Ordenes de Compra',
          icon: 'shopping_bag',
          route: 'ordenes-compra',
          shouldRender: true,
        },
        {
          title: 'Productos',
          icon: 'storefront',
          route: 'productos/cliente',
          shouldRender: true,
        },
        {
          title: 'Vehiculos',
          icon: 'directions_car',
          route: 'vehiculos',
          shouldRender: true,
        },
        {
          title: 'Mis pedidos',
          icon: 'assignment',
          route: 'pedidos/cliente',
          shouldRender: true,
        },
        {
          title: 'Pedidos',
          icon: 'assignment',
          route: 'pedidos',
          shouldRender: true,
        },
        {
          title: 'Envios',
          icon: 'local_shipping',
          route: 'envios',
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
          title: 'Inicio',
          icon: 'home',
          route: 'inicio',
          shouldRender: true,
        },
        {
          title: 'Solicitudes de Registro',
          icon: 'app_registration',
          route: 'solicitudes-registro',
          shouldRender: true,
        },
        {
          title: 'Inventario',
          icon: 'inventory_2',
          route: 'productos',
          shouldRender: true,
        },
        {
          title: 'Ordenes de Compra',
          icon: 'shopping_bag',
          route: 'ordenes-compra',
          shouldRender: true,
        },
        {
          title: 'Productos',
          icon: 'storefront',
          route: 'productos/cliente',
          shouldRender: true,
        },
        {
          title: 'Vehiculos',
          icon: 'directions_car',
          route: 'vehiculos',
          shouldRender: true,
        },
        {
          title: 'Mis pedidos',
          icon: 'assignment',
          route: 'pedidos/cliente',
          shouldRender: false,
        },
        {
          title: 'Pedidos',
          icon: 'assignment',
          route: 'pedidos',
          shouldRender: true,
        },
        {
          title: 'Envios',
          icon: 'local_shipping',
          route: 'envios',
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
        title: 'Inicio',
        icon: 'home',
        route: 'inicio',
        shouldRender: true,
      },
      {
        title: 'Solicitudes de Registro',
        icon: 'app_registration',
        route: 'solicitudes-registro',
        shouldRender: false,
      },
      {
        title: 'Inventario',
        icon: 'inventory_2',
        route: 'productos',
        shouldRender: false,
      },
      {
        title: 'Ordenes de Compra',
        icon: 'shopping_bag',
        route: 'ordenes-compra',
        shouldRender: false,
      },
      {
        title: 'Productos',
        icon: 'storefront',
        route: 'productos/cliente',
        shouldRender: true,
      },
      {
        title: 'Vehiculos',
        icon: 'directions_car',
        route: 'vehiculos',
        shouldRender: false,
      },
      {
        title: 'Mis pedidos',
        icon: 'assignment',
        route: 'pedidos/cliente',
        shouldRender: true,
      },
      {
        title: 'Pedidos',
        icon: 'assignment',
        route: 'pedidos',
        shouldRender: false,
      },
      {
        title: 'Envios',
        icon: 'local_shipping',
        route: 'envios',
        shouldRender: false,
      },
    ]);
  });

  describe('handleLogOutClick', () => {
    it('should call logOut if dialog is confirmed', () => {
      // Arrange
      const logOutSpy = jest.spyOn(authService, 'logOut');
      const afterClosed$ = of(true);
      (dialog.open as jest.Mock).mockReturnValue({
        afterClosed: () => afterClosed$,
      });

      // Act
      component.handleLogOutClick();

      // Assert
      expect(logOutSpy).toHaveBeenCalled();
    });

    it('should not call logOut if dialog is cancelled', () => {
      // Arrange
      const logOutSpy = jest.spyOn(authService, 'logOut');
      const afterClosed$ = of(false);
      (dialog.open as jest.Mock).mockReturnValue({
        afterClosed: () => afterClosed$,
      });
      // Act
      component.handleLogOutClick();
      // Assert
      expect(logOutSpy).not.toHaveBeenCalled();
    });

    it('should get the userName from AuthService', () => {
      // Arrange && Act
      component.ngOnInit();

      // Assert
      expect(component.userName).toBe('Jhon Doe');
    });
  });

  describe('toggleNavBar', () => {
    it('should toggle isOpen from true to false', () => {
      // Arrange
      component.isOpen = true;

      // Act
      component.toggleNavBar();

      // Assert
      expect(component.isOpen).toBe(false);
    });

    it('should toggle isOpen from false to true', () => {
      // Arrange
      component.isOpen = false;

      // Act
      component.toggleNavBar();

      // Assert
      expect(component.isOpen).toBe(true);
    });
  });
});
