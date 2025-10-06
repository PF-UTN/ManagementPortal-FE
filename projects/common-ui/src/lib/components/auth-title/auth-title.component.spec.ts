import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthTitleComponent } from './auth-title.component';

describe('AuthTitleComponent', () => {
  let component: AuthTitleComponent;
  let fixture: ComponentFixture<AuthTitleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AuthTitleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthTitleComponent);
    component = fixture.componentInstance;
  });
  describe('Initialization', () => {
    it('should initialize the component', () => {
      // Arrange
      // Act
      // Assert
      expect(component).toBeTruthy();
    });
  });
});
