import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';

import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatButtonModule, ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Template Rendering', () => {
    it('should have disabled attribute when disabled', () => {
      // Arrange
      component.disabled = true;
      fixture.detectChanges();
      // Act
      const button = fixture.nativeElement.querySelector('button');
      // Assert
      expect(button.disabled).toBeTruthy();
    });
  });

  describe('onClick Method', () => {
    it('should emit clickEvent event when clicked', () => {
      // Arrange
      jest.spyOn(component.onClick, 'emit');
      const button = fixture.debugElement.query(By.css('button')).nativeElement;
      // Act
      button.click();
      // Assert
      expect(component.onClick.emit).toHaveBeenCalled();
    });

    it('should not emit clicked event when disabled', () => {
      // Arrange
      component.disabled = true;
      fixture.detectChanges();
      jest.spyOn(component.onClick, 'emit');
      const button = fixture.debugElement.query(By.css('button')).nativeElement;
      // Act
      button.click();
      // Assert
      expect(component.onClick.emit).not.toHaveBeenCalled();
    });
  });
});
