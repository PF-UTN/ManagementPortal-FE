import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { mockDeep } from 'jest-mock-extended';

import { BackArrowComponent } from './back-arrow.component';

describe('BackArrowComponent', () => {
  let component: BackArrowComponent;
  let fixture: ComponentFixture<BackArrowComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackArrowComponent, MatIconModule, MatButtonModule],
      providers: [{ provide: Router, useValue: mockDeep<Router>() }],
    }).compileComponents();

    fixture = TestBed.createComponent(BackArrowComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('goBack method', () => {
    it('should navigate to backTo route if backTo is defined', () => {
      // Arrange
      const routerSpy = jest.spyOn(router, 'navigate');
      component.backTo = 'autenticacion/login';
      // Act
      component.goBack();
      // Assert
      expect(routerSpy).toHaveBeenCalledWith(['autenticacion/login']);
    });

    it('should call window.history.back if backTo is not defined', () => {
      // Arrange
      const historySpy = jest
        .spyOn(window.history, 'back')
        .mockImplementation();
      component.backTo = undefined;
      // Act
      component.goBack();
      // Assert
      expect(historySpy).toHaveBeenCalled();
    });
  });
});
